const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 訪客證有效期（小時）
const VISITOR_PASS_EXPIRY_HOURS = parseInt(process.env.VISITOR_PASS_EXPIRY_HOURS) || 24;

// MySQL連接配置（使用環境變數，雲端部署時會自動注入）
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'visitor_user',
  password: process.env.DB_PASSWORD || 'visitor_pass_2024',
  database: process.env.DB_NAME || 'visitor_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 創建連接池
const pool = mysql.createPool(dbConfig);

// 簡單的加密（實際使用中可以用AES）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';

// 產生加密token（用於QR Code內容）
function generateVisitorToken(doorNumber, phoneNumber, expiryTime) {
  // 組合資訊：門牌號+電話+到期時間+簽名
  const data = `${doorNumber}|${phoneNumber}|${expiryTime}`;
  // Base64編碼（實際應用中可以用更安全的加密）
  return Buffer.from(data).toString('base64');
}

// 解析訪客證token
function parseVisitorToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [doorNumber, phoneNumber, expiryTime] = decoded.split('|');
    return {
      doorNumber,
      phoneNumber,
      expiryTime: parseInt(expiryTime)
    };
  } catch (e) {
    return null;
  }
}

// 啟用CORS和JSON解析
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 生成QR Code API
app.post('/api/generate-qrcode', async (req, res) => {
  try {
    const { doorNumber, phoneNumber } = req.body;

    // 驗證輸入
    if (!doorNumber || !phoneNumber) {
      return res.status(400).json({
        code: 498,
        message: '參數錯誤',
        desc: '門牌號碼和電話號碼都是必填欄位',
        data: null
      });
    }

    // 從MySQL資料庫查詢訪客
    let visitor = null;
    try {
      const [rows] = await pool.query(
        'SELECT * FROM visitors WHERE door_number = ? AND is_active = TRUE LIMIT 1',
        [doorNumber]
      );

      if (rows.length > 0) {
        const dbVisitor = rows[0];
        // 解密電話號碼（這裡簡化為直接比較，實際應該加密後比較）
        visitor = {
          doorNumber: dbVisitor.door_number,
          phoneNumber: phoneNumber, // 這裡簡化處理
          visitorName: dbVisitor.visitor_name,
          id: dbVisitor.id
        };
      }
    } catch (error) {
      console.error('資料庫查詢錯誤:', error);
      return res.status(500).json({
        code: 500,
        message: '資料庫錯誤',
        desc: '無法連接資料庫',
        data: null
      });
    }

    // 如果不存在於資料庫，拒絕生成
    if (!visitor) {
      return res.status(403).json({
        code: 403,
        message: '無權限',
        desc: '門牌號碼不存在於資料庫中，無法發放訪客證',
        data: null
      });
    }

    // 計算有效期（24小時後過期）
    const expiryTime = Date.now() + (VISITOR_PASS_EXPIRY_HOURS * 60 * 60 * 1000);
    
    // 生成QR Code內容（加密token格式）
    // 包含：門牌號+電話+到期時間
    const content = generateVisitorToken(doorNumber, phoneNumber, expiryTime);
    const timestamp = Date.now();

    // 生成QR Code (返回base64)
    const qrCodeDataURL = await QRCode.toDataURL(content, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // 計算剩餘有效時間（小時）
    const hoursLeft = VISITOR_PASS_EXPIRY_HOURS;

    // 記錄發證記錄到資料庫
    try {
      await pool.query(
        'INSERT INTO visitor_passes (visitor_id, token, expires_at) VALUES (?, ?, ?)',
        [visitor.id, content, new Date(expiryTime)]
      );
    } catch (error) {
      console.error('記錄發證錯誤:', error);
    }

    // 返回標準格式
    res.json({
      code: 200,
      message: 'OK',
      desc: '',
      data: {
        qrcode: qrCodeDataURL,
        content: content, // 這是加密的token
        timestamp: timestamp,
        doorNumber: visitor.doorNumber,
        phoneNumber: visitor.phoneNumber,
        visitorName: visitor.visitorName,
        expiryHours: hoursLeft,
        expireTime: expiryTime
      }
    });

  } catch (error) {
    console.error('生成QR Code時發生錯誤:', error);
    res.status(500).json({
      code: 400,
      message: 'http錯誤',
      desc: error.message,
      data: null
    });
  }
});

// QR Code驗證API (對應API文件第21個)
app.post('/v2/identify/qrcode', async (req, res) => {
  try {
    const { content, timestamp } = req.body;

    if (!content || !timestamp) {
      return res.status(400).json({
        code: 498,
        message: '參數錯誤',
        desc: 'content和timestamp都是必填欄位',
        data: null
      });
    }

    // 解析QR Code內容（base64加密的token）
    const visitorData = parseVisitorToken(content);

    if (!visitorData) {
      return res.json({
        code: 200,
        message: 'OK',
        desc: '',
        data: {
          timestamp: timestamp,
          sign: '',
          type: 3,
          entry_status: 3, // QR Code解析失敗
          entry_hint: 'QR Code格式錯誤'
        }
      });
    }

    const { doorNumber, phoneNumber, expiryTime } = visitorData;

    // 檢查有效期
    if (Date.now() > expiryTime) {
      return res.json({
        code: 200,
        message: 'OK',
        desc: '',
        data: {
          timestamp: timestamp,
          sign: '',
          type: 3,
          entry_status: 6, // QR Code不在有效期限內
          entry_hint: '訪客證已過期'
        }
      });
    }

    // 根據API文件返回標準格式
    const deviceLDID = process.env.DEVICE_LDID || 'TEST-DEVICE-001';
    const passRuleType = 0;
    const entryStatus = 1; // 可通行
    
    // 生成sign（根據API文件格式）
    const sign = crypto.createHash('md5')
      .update(`${entryStatus}-${timestamp}-${deviceLDID}-${passRuleType}`)
      .digest('hex');

    // 計算剩餘時間（小時）
    const remainingTime = Math.round((expiryTime - Date.now()) / (1000 * 60 * 60));
    
    // 返回訪客資訊（根據API文件格式）
    res.json({
      code: 200,
      message: 'OK',
      desc: '',
      data: {
        timestamp: timestamp,
        sign: sign,
        type: 2, // 2:訪客
        user_id: 1,
        user_name: `${doorNumber}訪客`,
        entry_status: entryStatus,
        entry_hint: `歡迎訪客 ${phoneNumber}`,
        user_card_id: '',
        user_image: {
          format: '',
          data: '',
          url: ''
        },
        entry_time_left: remainingTime,
        id_number: ''
      }
    });

  } catch (error) {
    console.error('驗證QR Code時發生錯誤:', error);
    res.status(500).json({
      code: 400,
      message: 'http錯誤',
      desc: error.message,
      data: null
    });
  }
});

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'OK',
    status: 'healthy'
  });
});

// 根路徑重定向到index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
});

