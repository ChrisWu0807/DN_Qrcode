const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// 訪客證有效期（小時）
const VISITOR_PASS_EXPIRY_HOURS = 24;

// 有效的訪客資料庫（門牌號+電話作為KEY）
// 只有在這裡面的組合才能生成訪客證
const validVisitors = {
  '350106 0975635180': {
    doorNumber: '350106',
    phoneNumber: '0975635180',
    visitorName: '訪客A'
  },
  '999 0123456789': {
    doorNumber: '999',
    phoneNumber: '0123456789',
    visitorName: '測試訪客'
  }
};

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

    // 驗證門牌號+電話組合是否在資料庫中
    const key = `${doorNumber} ${phoneNumber}`;
    const visitor = validVisitors[key];

    // 如果不存在於資料庫，拒絕生成
    if (!visitor) {
      return res.status(403).json({
        code: 403,
        message: '無權限',
        desc: '門牌號碼和電話號碼組合不存在於資料庫中，無法發放訪客證',
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

