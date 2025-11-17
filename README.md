# 🏠 臨時訪客證生成器

一個基於門牌號碼和手機號碼的臨時訪客證 QR Code 生成系統，整合 SenseLink v5 API，支援雲端部署。

## ✨ 功能特色

- 📍 **門牌號碼驗證**：輸入門牌號碼（格式：1FA2）和手機號碼
- 🔐 **資料庫驗證**：只有資料庫中存在的門牌號+電話組合才能生成訪客證
- 🔲 **QR Code 生成**：整合 SenseLink v5 API 生成訪客證 QR Code
- ⏰ **有效時間控制**：QR Code 有效時間 1 小時，可使用 99 次
- 📥 **下載功能**：支援下載 QR Code 圖片
- 🎨 **現代化 UI**：簡潔易用的介面設計
- ☁️ **雲端部署**：支援 Zeabur 雲端部署
- 📱 **響應式設計**：支援手機和桌面瀏覽

## 🚀 快速開始

### 本地開發

1. **安裝依賴**
```bash
npm install
```

2. **配置環境變數**
```bash
cp env.example .env
# 編輯 .env 文件，填入資料庫和 API 配置
```

3. **初始化資料庫**
```bash
# 執行資料庫結構腳本
mysql -u root -p < database-schema.sql
```

4. **啟動服務器**
```bash
npm start
# 或使用開發模式（自動重啟）
npm run dev
```

5. **訪問應用**
```
http://localhost:3000
```

## 🔧 環境變數配置

### 必須設置的環境變數

```env
# 資料庫配置（MySQL）
DB_HOST=localhost
DB_PORT=3306
DB_USER=visitor_user
DB_PASSWORD=your_password
DB_NAME=visitor_db

# 外部 SenseLink API 配置
SENSELINK_API_BASE_URL=http://facereg.aoy.tw/sl
APP_KEY=c6324cfa50169e85
APP_SECRET=e30af86f8f4e75d128ba4288597dea3c

# 伺服器配置
PORT=3000
VISITOR_PASS_EXPIRY_HOURS=1
```

### 可選環境變數

```env
# 加密金鑰（32字元）
ENCRYPTION_KEY=your-32-character-secret-key-here!

# SenseLink 登入資訊（如果需要）
SENSELINK_USERNAME=admin1234
SENSELINK_PASSWORD=GP1234as
```

**注意**：`APP_KEY` 和 `APP_SECRET` 在代碼中已有固定值作為後備，即使環境變數未設置也能運行（但建議設置）。

## 🌐 API 接口

### 生成訪客證 QR Code

```
POST /api/generate-qrcode
```

**請求體:**
```json
{
  "doorNumber": "1FA2",
  "phoneNumber": "0987872924"
}
```

**回應（成功）:**
```json
{
  "code": 200,
  "message": "OK",
  "desc": "",
  "data": {
    "qrcode": "data:image/png;base64,iVBORw0KG...",
    "content": "slqr-Te8iS93WkyO+WzUzLFDd1j0GLG8U5xRw",
    "timestamp": 1763350834090,
    "doorNumber": "1FA2",
    "phoneNumber": "0987872924",
    "visitorName": "訪客姓名",
    "expiryHours": 1,
    "expireTime": 1763354434090,
    "validFrom": 1763350834000,
    "validTo": 1763354434000
  }
}
```

**回應（失敗 - 不在資料庫中）:**
```json
{
  "code": 403,
  "message": "無權限",
  "desc": "門牌號碼和電話號碼組合不存在於資料庫中，無法發放訪客證",
  "data": null
}
```

### 健康檢查

```
GET /health
```

**回應:**
```json
{
  "code": 200,
  "message": "OK",
  "status": "healthy"
}
```

## 📊 資料庫結構

### visitors 表
存儲有效的門牌號碼和電話號碼組合。

```sql
CREATE TABLE visitors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    door_number VARCHAR(50) NOT NULL,
    phone_encrypted TEXT NOT NULL,
    visitor_name VARCHAR(100) NOT NULL,
    user_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_door (door_number)
);
```

### visitor_passes 表
記錄已發放的訪客證。

```sql
CREATE TABLE visitor_passes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    visitor_id BIGINT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visitor_id) REFERENCES visitors(id)
);
```

## ☁️ 部署到 Zeabur

### 部署步驟

1. **推送代碼到 GitHub**
```bash
git add .
git commit -m "準備部署"
git push origin main
```

2. **在 Zeabur 創建服務**
   - 登入 Zeabur 控制台
   - 創建新服務
   - 連接 GitHub 倉庫：`ChrisWu0807/DN_Qrcode`

3. **設置環境變數**
   
   參考 `ZEABUR_ENV_VARS.txt` 或 `ZEABUR_ENV_VARS_ONELINE.txt` 文件，在 Zeabur 環境變數頁面設置：

   ```
   DB_HOST=43.167.198.15
   DB_PORT=31170
   DB_USER=root
   DB_PASSWORD=YsEcZ4dU7gXQlhz2RAN1Du90385kCFL6
   DB_NAME=zeabur
   PORT=${WEB_PORT}
   VISITOR_PASS_EXPIRY_HOURS=1
   SENSELINK_API_BASE_URL=http://facereg.aoy.tw/sl
   APP_KEY=c6324cfa50169e85
   APP_SECRET=e30af86f8f4e75d128ba4288597dea3c
   ```

4. **連接 MySQL 服務**
   - 在 Zeabur 創建或連接 MySQL 服務
   - 使用提供的連接資訊

5. **初始化資料庫**
   - 使用 Zeabur MySQL 終端執行 `database-schema.sql`
   - 或使用 `init-cloud-db.js` 腳本

6. **部署**
   - Zeabur 會自動檢測並部署
   - 等待部署完成

詳細部署指南請參考 `DEPLOYMENT_GUIDE.md`。

## 📁 專案結構

```
DoorNumber_Qrcode/
├── server.js                    # Express 服務器主文件
├── package.json                 # 依賴配置
├── package-lock.json            # 鎖定依賴版本
├── Procfile                     # Zeabur 啟動命令
├── zeabur.json                  # Zeabur 配置
├── env.example                  # 環境變數範例
├── .gitignore                   # Git 忽略文件
│
├── public/                      # 前端靜態文件
│   ├── index.html              # 主頁面
│   ├── styles.css              # 樣式文件
│   └── app.js                  # 前端邏輯
│
├── database-schema.sql          # 資料庫結構腳本
├── init-cloud-db.js            # 雲端資料庫初始化腳本
│
├── DEPLOYMENT_GUIDE.md         # 部署指南
├── API_REQUEST_FORMAT.md       # API 請求格式說明
├── TIMESTAMP_EXPLANATION.md    # Timestamp 說明
├── TIMEVALIDFROM_EXPLANATION.md # timeValidFrom 說明
├── ZEABUR_ENV_VARS.txt         # Zeabur 環境變數清單
└── README.md                   # 本文件
```

## 🛠 技術棧

- **後端**: Node.js + Express
- **前端**: 原生 JavaScript + CSS3
- **資料庫**: MySQL
- **QR Code 生成**: SenseLink v5 API (`/api/v5/userqrcodes`)
- **QR Code 圖片**: qrcode npm 包
- **部署**: Zeabur

## 🔐 安全特性

- ✅ 資料庫驗證：只有資料庫中存在的門牌號+電話組合才能生成訪客證
- ✅ 環境變數保護：敏感資訊使用環境變數，不寫死在代碼中
- ✅ SQL 注入防護：使用參數化查詢
- ✅ 電話號碼清理：自動移除連字號和空格

## 📝 QR Code 規格

- **有效時間**: 1 小時（3600 秒）
- **可使用次數**: 99 次
- **格式**: SenseLink QR Code（`slqr-...`）
- **生成方式**: 通過 SenseLink v5 API 生成

## 🚨 注意事項

1. **門牌號碼格式**: 必須符合格式 `1FA2`（數字+兩字母+數字）
2. **電話號碼格式**: 支援 `0987-872-924` 或 `0987872924`，系統會自動清理
3. **資料庫驗證**: 必須先在資料庫中添加有效的門牌號+電話組合
4. **user_id 映射**: 目前使用默認值 197，需要根據實際情況調整映射邏輯

## 📄 授權

ISC License

## 👥 貢獻

歡迎提交 Issue 和 Pull Request！

## 📚 相關文檔

- [部署指南](DEPLOYMENT_GUIDE.md)
- [API 請求格式說明](API_REQUEST_FORMAT.md)
- [Timestamp 說明](TIMESTAMP_EXPLANATION.md)
- [timeValidFrom 說明](TIMEVALIDFROM_EXPLANATION.md)
