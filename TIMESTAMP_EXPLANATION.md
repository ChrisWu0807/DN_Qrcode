# Timestamp 獲取方式說明

## 1. 請求時發送的 timestamp 如何獲取？

### 代碼位置
`server.js` 第 237 行

### 獲取方式
```javascript
const currentTimestamp = Date.now().toString();
```

---

## 2. 詳細說明

### Date.now()
- **功能**: 返回當前時間的毫秒數
- **基準時間**: 1970-01-01 00:00:00 UTC（Unix 紀元）
- **格式**: 數字（Number）
- **長度**: 13 位數字

### .toString()
- **功能**: 將數字轉換為字串
- **原因**: API 要求 timestamp 必須是字串格式（String）

### 完整流程
```javascript
// 步驟 1: 獲取當前時間的毫秒數
Date.now()
// 結果: 1763350834090 (數字)

// 步驟 2: 轉換為字串
Date.now().toString()
// 結果: "1763350834090" (字串)
```

---

## 3. 實際範例

### 當前時間範例
假設當前時間是：**2025-11-17 12:00:00.090**

```javascript
// 獲取 timestamp
const currentTimestamp = Date.now().toString();

// 結果
currentTimestamp = "1763350834090"

// 這個數字代表：
// - 從 1970-01-01 00:00:00 UTC 開始
// - 經過了 1763350834090 毫秒
// - 等於 2025-11-17 12:00:00.090
```

### 時間戳格式對比

| 類型 | 格式 | 範例 | 說明 |
|------|------|------|------|
| **毫秒級時間戳** | 13 位數字 | `1763350834090` | 用於 Headers 中的 `timestamp` |
| **秒級時間戳** | 10 位數字 | `1763350834` | 用於 Body 中的 `timeValidFrom`（如果需要的話） |

---

## 4. 在 API 請求中的使用

### Headers 中的 timestamp
```javascript
headers: {
  'appKey': 'c6324cfa50169e85',
  'timestamp': currentTimestamp,  // ← 這裡使用毫秒級時間戳（字串）
  'sign': sign,
  // ...
}
```

### 實際請求範例
```
POST /sl/api/v5/userqrcodes HTTP/1.1
Host: facereg.aoy.tw
appKey: c6324cfa50169e85
timestamp: 1763350834090          ← 毫秒級時間戳（字串）
sign: 4ed75ef570a2f8326587677f16b3aa37
Content-Type: application/json
```

---

## 5. 重要注意事項

### 1. 必須是字串格式
```javascript
// ✅ 正確
const timestamp = Date.now().toString();  // "1763350834090"

// ❌ 錯誤
const timestamp = Date.now();  // 1763350834090 (數字)
```

### 2. 必須是毫秒級
```javascript
// ✅ 正確（毫秒級，13位）
Date.now() = 1763350834090

// ❌ 錯誤（秒級，10位）
Math.floor(Date.now() / 1000) = 1763350834
```

### 3. 每次請求都要重新獲取
```javascript
// ✅ 正確：每次請求都獲取新的 timestamp
const currentTimestamp = Date.now().toString();

// ❌ 錯誤：使用緩存的 timestamp
const cachedTimestamp = "1763350834090";  // 會過期
```

### 4. 有效期限制
- **服務器檢查**: 服務器會對比當前時間和請求中的 timestamp
- **時間差限制**: 相差超過 **30 分鐘** 會返回失敗
- **建議**: 每次請求都使用當前時間，不要使用舊的 timestamp

---

## 6. 完整代碼範例

### 在 server.js 中的實際使用
```javascript
// 步驟 1: 獲取當前時間戳（毫秒級，字串格式）
const currentTimestamp = Date.now().toString();
// 結果: "1763350834090"

// 步驟 2: 使用 timestamp 計算 sign
const sign = calculateSign(currentTimestamp, APP_SECRET);
// sign = md5("1763350834090#e30af86f8f4e75d128ba4288597dea3c")

// 步驟 3: 在 Headers 中使用
headers: {
  'appKey': APP_KEY,
  'timestamp': currentTimestamp,  // "1763350834090"
  'sign': sign,
  // ...
}
```

---

## 7. 時間戳生成流程圖

```
當前時間
  ↓
Date.now()           → 獲取毫秒數（數字）
  ↓
.toString()          → 轉換為字串
  ↓
currentTimestamp      → "1763350834090"
  ↓
用於計算 sign         → md5(timestamp#app_secret)
  ↓
放入 Headers         → timestamp: "1763350834090"
```

---

## 總結

1. **獲取方式**: `Date.now().toString()`
2. **格式**: 13 位數字字串（毫秒級）
3. **用途**: 用於 Headers 中的 `timestamp` 和計算 `sign`
4. **要求**: 
   - 必須是字串格式
   - 必須是毫秒級
   - 每次請求都要重新獲取
   - 不能與服務器時間相差超過 30 分鐘

