# timeValidFrom 參數說明

## 1. 什麼是 timeValidFrom？

`timeValidFrom` 是 QR Code **有效起始時間**的參數。

### 定義
- **類型**: `long`（長整數）
- **單位**: 秒級時間戳（Unix timestamp，秒）
- **說明**: 指定 QR Code 從什麼時候開始生效

### 範例
```javascript
// 當前時間：2025-11-17 12:00:00
// Unix 時間戳（秒）：1763352000

timeValidFrom = 1763352000
// 表示 QR Code 從 2025-11-17 12:00:00 開始生效
```

---

## 2. 與 validTime 的關係

### 完整時間計算
```
有效起始時間 = timeValidFrom
有效結束時間 = timeValidFrom + validTime
```

### 範例
```javascript
timeValidFrom = 1763352000  // 2025-11-17 12:00:00
validTime = 3600            // 3600 秒 = 1 小時

有效時間範圍：
- 開始：2025-11-17 12:00:00
- 結束：2025-11-17 13:00:00（12:00:00 + 1小時）
```

---

## 3. 如果不傳 timeValidFrom 會怎樣？

根據 API 文檔：
- **默認值**: 如果不傳 `timeValidFrom`，系統會使用**當前時間**作為起始時間
- **計算方式**: `timeValidFrom = 當前時間（秒級時間戳）`

### 範例
```javascript
// 不傳 timeValidFrom
{
  "userId": 197,
  "validTime": 3600
}

// 系統自動設置
timeValidFrom = 當前時間（例如：1763352000）
有效時間 = 從現在開始的 1 小時
```

---

## 4. 為什麼我們不傳 timeValidFrom？

### 測試結果
在測試中發現，傳入 `timeValidFrom` 會返回錯誤：
```json
{
  "code": 498,
  "message": "Param Invalid",
  "desc": "timeValidFrom-invalid"
}
```

### 可能的原因
1. **時間戳格式問題**: 可能需要毫秒級而不是秒級
2. **時間範圍限制**: 可能不能設置未來的時間
3. **API 版本問題**: 可能這個參數在當前版本有問題

### 當前解決方案
- **不傳 `timeValidFrom`**: 使用默認值（當前時間）
- **只傳 `validTime`**: 設置有效時長
- **結果**: QR Code 從生成時間開始，有效期為 `validTime` 秒

---

## 5. 實際使用範例

### 當前代碼實現
```javascript
// 不傳 timeValidFrom，使用默認當前時間
const requestBody = {
  userId: 197,
  validTime: 3600,      // 1 小時
  entryTimes: 5          // 可使用 5 次
};

// 實際效果：
// - 起始時間：生成 QR Code 的當前時間
// - 結束時間：起始時間 + 3600 秒（1小時後）
// - 可使用次數：5 次
```

### 如果需要指定起始時間
```javascript
// 假設 API 修復後可以這樣使用
const timeValidFrom = Math.floor(Date.now() / 1000); // 秒級時間戳
const validTime = 3600; // 1小時

const requestBody = {
  userId: 197,
  timeValidFrom: timeValidFrom,  // 指定起始時間
  validTime: validTime,          // 有效時長
  entryTimes: 5
};
```

---

## 6. 時間戳格式對比

### 秒級時間戳（Unix timestamp）
```javascript
Math.floor(Date.now() / 1000)
// 範例：1763352000（10位數字）
// 表示：2025-11-17 12:00:00
```

### 毫秒級時間戳
```javascript
Date.now()
// 範例：1763352000000（13位數字）
// 表示：2025-11-17 12:00:00.000
```

### 在 API 中的使用
- **Headers 中的 `timestamp`**: 毫秒級（13位數字）
- **Body 中的 `timeValidFrom`**: 秒級（10位數字）← 但這個參數目前有問題

---

## 總結

- **timeValidFrom**: QR Code 的有效起始時間（秒級時間戳）
- **如果不傳**: 使用當前時間作為起始時間
- **當前狀態**: 由於 API 返回錯誤，我們不傳這個參數，使用默認值
- **實際效果**: QR Code 從生成時間開始生效，有效期為 `validTime` 秒

