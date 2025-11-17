# API 請求格式說明

## 1. Timestamp 產生方式

### 產生方法
```javascript
const currentTimestamp = Date.now().toString();
```

### 說明
- **`Date.now()`**: 返回當前時間的毫秒數（自 1970-01-01 00:00:00 UTC 起）
- **`.toString()`**: 轉換為字串格式
- **格式**: 13位數字字串，例如：`1763350834090`

### 範例
```javascript
// 當前時間：2025-11-17 11:38:54
Date.now() = 1763350834090
currentTimestamp = "1763350834090"
```

### 重要
- **精確度**: 毫秒級（milliseconds）
- **格式**: 必須是字串（String），不是數字
- **有效期**: 服務器會檢查 timestamp，與當前時間相差超過 30 分鐘會返回失敗

---

## 2. Sign（簽名）計算方式

### 計算公式
```javascript
sign = md5(timestamp + "#" + app_secret)
```

### 實作代碼
```javascript
function calculateSign(timestamp, appSecret) {
  const signString = `${timestamp}#${appSecret}`;
  return crypto.createHash('md5').update(signString).digest('hex');
}
```

### 範例
```javascript
timestamp = "1763350834090"
app_secret = "e30af86f8f4e75d128ba4288597dea3c"

signString = "1763350834090#e30af86f8f4e75d128ba4288597dea3c"
sign = md5(signString) = "4ed75ef570a2f8326587677f16b3aa37"
```

### 重要
- **連接符**: 使用 `#` 連接 timestamp 和 app_secret
- **順序**: `timestamp#app_secret`（不能顛倒）
- **格式**: MD5 雜湊後的 32 位十六進制字串（小寫）

---

## 3. 完整 HTTP 請求格式

### 請求方式
**POST**

### 請求 URL
```
http://facereg.aoy.tw/sl/api/v5/userqrcodes
```

### Headers（請求頭）
```
appKey: c6324cfa50169e85
timestamp: 1763350834090
sign: 4ed75ef570a2f8326587677f16b3aa37
requestId: req-1763350834090-abc123xyz
Content-Type: application/json
Accept: application/json
```

### Headers 說明

| Header 名稱 | 類型 | 是否必填 | 說明 |
|------------|------|---------|------|
| `appKey` | String | 是 | 分配的 appKey 值 |
| `timestamp` | String | 是 | 當前請求的時間戳（毫秒，字串格式） |
| `sign` | String | 是 | MD5 簽名值 |
| `requestId` | String | 否 | 請求 ID，建議填 UUID |
| `Content-Type` | String | 是 | `application/json` |
| `Accept` | String | 是 | `application/json` |

### Request Body（請求體）
```json
{
  "userId": 186
}
```

### Request Body 參數說明

| 參數名稱 | 類型 | 是否必填 | 說明 |
|---------|------|---------|------|
| `userId` | long | 是 | 用戶 ID |
| `timeValidFrom` | long | 否 | 二維碼有效起始時間（秒級時間戳），不填默認當前時間 |
| `validTime` | long | 否 | 有效時間時長（秒），不填默認 60 秒 |
| `entryTimes` | int | 否 | 可使用次數，不填默認 1 次 |

---

## 4. 完整請求範例

### JavaScript/Node.js 範例
```javascript
const crypto = require('crypto');

// 1. 產生 timestamp
const timestamp = Date.now().toString();
// 結果: "1763350834090"

// 2. 計算 sign
const appSecret = "e30af86f8f4e75d128ba4288597dea3c";
const signString = `${timestamp}#${appSecret}`;
const sign = crypto.createHash('md5').update(signString).digest('hex');
// 結果: "4ed75ef570a2f8326587677f16b3aa37"

// 3. 發送請求
const response = await fetch('http://facereg.aoy.tw/sl/api/v5/userqrcodes', {
  method: 'POST',
  headers: {
    'appKey': 'c6324cfa50169e85',
    'timestamp': timestamp,
    'sign': sign,
    'requestId': `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    userId: 186
  })
});

const data = await response.json();
// 成功回應: { code: 200, message: "OK", data: "slqr-..." }
```

### cURL 範例
```bash
TIMESTAMP=$(node -e "console.log(Date.now())")
SIGN=$(node -e "const crypto=require('crypto');const ts='$TIMESTAMP';const secret='e30af86f8f4e75d128ba4288597dea3c';process.stdout.write(crypto.createHash('md5').update(ts+'#'+secret).digest('hex'));")

curl -X POST "http://facereg.aoy.tw/sl/api/v5/userqrcodes" \
  -H "appKey: c6324cfa50169e85" \
  -H "timestamp: $TIMESTAMP" \
  -H "sign: $SIGN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"userId":186}'
```

---

## 5. 成功回應格式

```json
{
  "code": 200,
  "message": "OK",
  "data": "slqr-P1vmW1euzAf9Zj2K5EoAxD0GLG8U5xRw"
}
```

### 回應說明
- **code**: 200 表示成功
- **message**: "OK" 表示成功
- **data**: QR Code 內容字串，格式為 `slqr-...`

---

## 6. 錯誤回應格式

### 參數錯誤 (498)
```json
{
  "code": 498,
  "message": "Param Invalid",
  "desc": "timeValidFrom-invalid",
  "data": {},
  "subCode": "timeValidFrom-invalid",
  "requestId": ""
}
```

### HTTP 請求錯誤 (400)
```json
{
  "code": 400,
  "message": "Http Request Error",
  "desc": "http request error",
  "data": {},
  "subCode": "http-request-error",
  "requestId": ""
}
```

---

## 7. 注意事項

1. **Timestamp 格式**:
   - 必須是毫秒級時間戳（13位數字）
   - 必須轉換為字串格式
   - 與服務器時間相差超過 30 分鐘會失敗

2. **Sign 計算**:
   - 必須使用 `timestamp#app_secret` 格式
   - 使用 MD5 雜湊
   - 結果必須是小寫十六進制字串

3. **Header 名稱**:
   - 使用 `appKey`（大寫 K），不是 `app_key` 或 `app-key`
   - 使用 `timestamp`（全小寫）
   - 使用 `sign`（全小寫）

4. **請求方式**:
   - 必須使用 POST 方法
   - Content-Type 必須是 `application/json`

