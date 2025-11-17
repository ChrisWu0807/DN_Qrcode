const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// NodeRSA 用於加密登入密碼
const NodeRSA = require('node-rsa');

const app = express();
const PORT = process.env.PORT || 3000;

// 訪客證有效期（小時）
const VISITOR_PASS_EXPIRY_HOURS = parseInt(process.env.VISITOR_PASS_EXPIRY_HOURS) || 1;

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

// 移除本地QR碼產生與解析機制（改走外部服務）

// 啟用CORS和JSON解析
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 刪除本地 /api/generate-qrcode 產生機制（改用外部API）

// 刪除本地 /v2/identify/qrcode 驗證機制（改走外部流程）

// 計算簽名：sign = md5(timestamp#app_secret) (用於 v3 API)
function calculateSign(timestamp, appSecret) {
  const signString = `${timestamp}#${appSecret}`;
  return crypto.createHash('md5').update(signString).digest('hex');
}

// 獲取 auth-token（通過 API 登入）
let cachedAuthToken = null;
let cachedAuthTimestamp = null;
let cachedAuthSign = null;
const AUTH_TOKEN_CACHE_TTL = 30 * 60 * 1000; // 30分鐘緩存

async function getAuthToken() {
  // 如果緩存有效，直接返回
  if (cachedAuthToken && cachedAuthTimestamp && (Date.now() - cachedAuthTimestamp < AUTH_TOKEN_CACHE_TTL)) {
    return {
      authToken: cachedAuthToken,
      authTimestamp: cachedAuthTimestamp,
      authSign: cachedAuthSign
    };
  }

  // 如果環境變數有提供，直接使用
  if (process.env.AUTH_TOKEN && process.env.AUTH_TIMESTAMP && process.env.AUTH_SIGN) {
    cachedAuthToken = process.env.AUTH_TOKEN;
    cachedAuthTimestamp = parseInt(process.env.AUTH_TIMESTAMP);
    cachedAuthSign = process.env.AUTH_SIGN;
    return {
      authToken: cachedAuthToken,
      authTimestamp: cachedAuthTimestamp,
      authSign: cachedAuthSign
    };
  }

  // 通過 API 登入獲取 token
  const API_BASE_URL = process.env.SENSELINK_API_BASE_URL || 'http://facereg.aoy.tw/sl';
  const username = process.env.SENSELINK_USERNAME || 'admin1234';
  const password = process.env.SENSELINK_PASSWORD || 'GP1234as';

  try {
    console.log('開始通過 API 登入獲取 auth-token...');

    // 步驟1: 獲取 RSA 公鑰
    const rsaPubResponse = await fetch(`${API_BASE_URL}/v2/rsapub`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const rsaPubData = await rsaPubResponse.json();
    if (rsaPubData.code !== 200) {
      throw new Error(`獲取 RSA 公鑰失敗: ${rsaPubData.message}`);
    }

    const { empoent, module: rsaModule, rsa_id } = rsaPubData.data;

    // 步驟2: 使用 RSA 加密密碼
    const key = new NodeRSA();
    key.setOptions({ encryptionScheme: 'pkcs1' });
    key.importKey({
      n: Buffer.from(rsaModule, 'hex'),
      e: parseInt(empoent, 16)
    }, 'components-public');

    const encryptedPassword = key.encrypt(password, 'hex');

    // 步驟3: 調用登入 API
    const loginResponse = await fetch(`${API_BASE_URL}/v2/device/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        account: username,
        password: encryptedPassword,
        rsa_id: rsa_id,
        identifier: 'WEB-API',
        duid: 'web-api-' + Date.now()
      })
    });

    const loginData = await loginResponse.json();
    if (loginData.code !== 200) {
      throw new Error(`登入失敗: ${loginData.message || loginData.desc}`);
    }

    // 獲取 token
    const token = loginData.data.token;
    
    // 生成時間戳和 sign（暫時使用當前時間戳，sign 需要知道計算規則）
    const timestamp = Date.now();
    
    // TODO: 需要知道 auth-sign 的計算規則
    // 暫時先返回 token，sign 可能需要從其他方式獲取
    cachedAuthToken = token;
    cachedAuthTimestamp = timestamp;
    cachedAuthSign = ''; // 需要知道計算規則後填入

    console.log('成功通過 API 登入，獲取 token:', token);

    return {
      authToken: token,
      authTimestamp: timestamp,
      authSign: '' // 需要知道計算規則
    };
  } catch (error) {
    console.error('API 登入失敗:', error);
    throw new Error(`無法通過 API 登入獲取 token: ${error.message}`);
  }
}

// 生成QR Code API（整合外部SenseLink API）
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

    // 清理電話號碼（移除連字號和空格）
    const cleanPhone = phoneNumber.replace(/[-\s]/g, '');

    // 從MySQL資料庫查詢訪客（同時檢查門牌號和電話號碼）
    let visitor = null;
    try {
      const [rows] = await pool.query(
        'SELECT * FROM visitors WHERE door_number = ? AND phone_encrypted = ? AND is_active = TRUE LIMIT 1',
        [doorNumber, cleanPhone]
      );

      if (rows.length > 0) {
        const dbVisitor = rows[0];
        visitor = {
          doorNumber: dbVisitor.door_number,
          phoneNumber: cleanPhone,
          visitorName: dbVisitor.visitor_name,
          id: dbVisitor.id,
          userId: dbVisitor.user_id || null // 如果資料庫有user_id欄位
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
        desc: '門牌號碼和電話號碼組合不存在於資料庫中，無法發放訪客證',
        data: null
      });
    }

    // 檢查外部API配置（使用固定值作為後備）
    const APP_KEY = process.env.APP_KEY || 'c6324cfa50169e85';
    const APP_SECRET = process.env.APP_SECRET || 'e30af86f8f4e75d128ba4288597dea3c';
    const API_BASE_URL = process.env.SENSELINK_API_BASE_URL || 'http://facereg.aoy.tw/sl';

    if (!APP_KEY || !APP_SECRET) {
      return res.status(500).json({
        code: 500,
        message: '配置錯誤',
        desc: '缺少APP_KEY或APP_SECRET環境變數',
        data: null
      });
    }

    // 獲取user_id（如果資料庫有存，否則需要映射邏輯）
    // TODO: 需要確認user_id如何從門牌+電話映射
    const userId = visitor.userId || 197; // 暫時用197測試

    // 調用外部API獲取QR Code - 使用 /api/v5/userqrcodes 端點（POST，v5 通用請求格式）
    try {
      // 使用 v5 通用請求格式：appKey + timestamp + sign
      const currentTimestamp = Date.now().toString();
      const sign = calculateSign(currentTimestamp, APP_SECRET);
      
      // 構建請求體
      // 設置有效時間為 1 小時（3600秒），可使用 99 次
      // timeValidFrom 不傳，使用默認值（當前時間）
      const validTime = 3600; // 1小時 = 3600秒
      const entryTimes = 99; // 可使用 99 次
      
      const requestBody = {
        userId: userId,
        validTime: validTime,
        entryTimes: entryTimes
      };
      
      // 使用 /api/v5/userqrcodes 端點（POST）
      let apiUrl = `${API_BASE_URL}/api/v5/userqrcodes`;
      
      let apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'appKey': APP_KEY,
          'timestamp': currentTimestamp,
          'sign': sign,
          'requestId': `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      let apiData = await apiResponse.json();

      // 檢查回應
      if (!apiData || (apiData.code !== 200 && apiResponse.status !== 200)) {
        console.error('外部API錯誤:', apiData);
        return res.status(500).json({
          code: 500,
          message: '外部API錯誤',
          desc: apiData?.desc || apiData?.message || apiData?.error || '無法取得QR Code',
          data: null
        });
      }

      // 成功取得QR Code內容
      // /api/v5/userqrcodes 返回的格式：{ code: 200, data: "slqr-..." } (data 直接是字串)
      const qrContent = typeof apiData.data === 'string' ? apiData.data : (apiData.data?.content || '');
      if (!qrContent) {
        return res.status(500).json({
          code: 500,
          message: '外部API錯誤',
          desc: 'QR Code內容為空',
          data: null
        });
      }

      // 計算有效時間（預設1小時）
      const validFrom = Math.floor(Date.now() / 1000);
      const validTo = validFrom + 3600; // 1小時後過期

      // 生成QR Code圖片（使用qrcode套件）
      const QRCode = require('qrcode');
      const qrCodeDataURL = await QRCode.toDataURL(qrContent, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // 記錄發證記錄到資料庫
      try {
        await pool.query(
          'INSERT INTO visitor_passes (visitor_id, token, expires_at) VALUES (?, ?, ?)',
          [visitor.id, qrContent, new Date(validTo * 1000)]
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
          content: qrContent,
          timestamp: Date.now(),
          doorNumber: visitor.doorNumber,
          phoneNumber: visitor.phoneNumber,
          visitorName: visitor.visitorName,
          expiryHours: VISITOR_PASS_EXPIRY_HOURS,
          expireTime: validTo * 1000,
          validFrom: validFrom * 1000,
          validTo: validTo * 1000
        }
      });

    } catch (error) {
      console.error('調用外部API錯誤:', error);
      return res.status(500).json({
        code: 500,
        message: '外部API錯誤',
        desc: error.message,
        data: null
      });
    }

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

