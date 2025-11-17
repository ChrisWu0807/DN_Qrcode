# 雲端部署指南（Zeabur）

## 📦 需要搬遷的文件清單

### ✅ 必須上傳的文件

#### 1. 核心應用文件
- ✅ `server.js` - 主服務器文件
- ✅ `package.json` - 依賴管理
- ✅ `package-lock.json` - 鎖定依賴版本

#### 2. 前端文件（public 目錄）
- ✅ `public/index.html` - 前端頁面
- ✅ `public/app.js` - 前端邏輯
- ✅ `public/styles.css` - 樣式文件

#### 3. 部署配置文件
- ✅ `Procfile` - Zeabur 啟動命令
- ✅ `zeabur.json` - Zeabur 配置（如果有）

#### 4. 資料庫相關（可選，用於初始化）
- ✅ `database-schema.sql` - 資料庫結構（如果需要重新初始化）
- ✅ `init-cloud-db.js` - 雲端資料庫初始化腳本（可選）

### ❌ 不需要上傳的文件

- ❌ `node_modules/` - 會在雲端自動安裝
- ❌ `.env` - 環境變數在 Zeabur 中設置
- ❌ `*.md` - 文檔文件（可選，不影響運行）
- ❌ `test-*.js` - 測試文件（可選）
- ❌ `database.js` - 如果沒有使用（可選）

---

## 🔧 伺服器環境參數（Zeabur 環境變數設置）

### 📋 必須設置的環境變數

#### 1. 資料庫配置（MySQL）
```
DB_HOST=43.167.198.15
DB_PORT=31170
DB_USER=root
DB_PASSWORD=YsEcZ4dU7gXQlhz2RAN1Du90385kCFL6
DB_NAME=zeabur
```

#### 2. 外部 SenseLink API 配置
```
SENSELINK_API_BASE_URL=http://facereg.aoy.tw/sl
APP_KEY=c6324cfa50169e85
APP_SECRET=e30af86f8f4e75d128ba4288597dea3c
```

#### 3. 伺服器配置
```
PORT=3000
VISITOR_PASS_EXPIRY_HOURS=1
```

### 📋 可選的環境變數

#### 4. 加密金鑰（如果使用加密功能）
```
ENCRYPTION_KEY=your-32-character-secret-key-here!
```
**生成方式**:
```bash
openssl rand -base64 32
```

#### 5. SenseLink 登入資訊（如果需要自動登入）
```
SENSELINK_USERNAME=admin1234
SENSELINK_PASSWORD=GP1234as
```

#### 6. 其他可選配置
```
JWT_SECRET=your-jwt-secret-key
DEVICE_LDID=TEST-DEVICE-001
```

---

## 📝 Zeabur 部署步驟

### 步驟 1: 準備代碼倉庫
```bash
# 確保所有必要文件都在 Git 倉庫中
git add server.js package.json package-lock.json
git add public/
git add Procfile
git add zeabur.json
git commit -m "準備部署到 Zeabur"
git push
```

### 步驟 2: 在 Zeabur 創建服務
1. 登入 Zeabur 控制台
2. 創建新服務
3. 連接 Git 倉庫或直接上傳代碼

### 步驟 3: 設置環境變數
在 Zeabur 控制台的「環境變數」頁面設置：

**必須設置**:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `APP_KEY`
- `APP_SECRET`
- `SENSELINK_API_BASE_URL`
- `PORT`（Zeabur 可能會自動設置）

**可選設置**:
- `VISITOR_PASS_EXPIRY_HOURS`
- `ENCRYPTION_KEY`
- `SENSELINK_USERNAME`
- `SENSELINK_PASSWORD`

### 步驟 4: 連接 MySQL 服務
1. 在 Zeabur 創建 MySQL 服務（如果還沒有）
2. 使用提供的連接資訊：
   - Host: `43.167.198.15`
   - Port: `31170`
   - User: `root`
   - Password: `YsEcZ4dU7gXQlhz2RAN1Du90385kCFL6`
   - Database: `zeabur`

### 步驟 5: 初始化資料庫（如果需要）
如果資料庫還沒有初始化，可以：
1. 使用 Zeabur 的 MySQL 終端執行 `database-schema.sql`
2. 或使用 `init-cloud-db.js` 腳本（需要先設置環境變數）

### 步驟 6: 部署
1. Zeabur 會自動檢測 `package.json` 並安裝依賴
2. 使用 `Procfile` 中的命令啟動服務
3. 等待部署完成

---

## 🔍 檢查清單

### 部署前檢查
- [ ] 所有必要文件已提交到 Git
- [ ] `package.json` 包含所有依賴
- [ ] `Procfile` 存在且正確
- [ ] 環境變數清單已準備好

### 部署後檢查
- [ ] 服務正常啟動（檢查日誌）
- [ ] 資料庫連接成功
- [ ] API 端點可訪問（`/health`）
- [ ] 前端頁面可訪問
- [ ] QR Code 生成功能正常

---

## 📊 文件大小估算

### 必須上傳的文件大小
- `server.js`: ~15 KB
- `package.json`: ~1 KB
- `package-lock.json`: ~100 KB
- `public/`: ~10 KB
- `Procfile`: <1 KB
- `zeabur.json`: <1 KB

**總計**: 約 130 KB（不含 node_modules）

---

## 🚨 注意事項

### 1. 環境變數安全
- ✅ 不要在代碼中硬編碼敏感資訊
- ✅ 使用 Zeabur 的環境變數功能
- ✅ 不要將 `.env` 文件提交到 Git

### 2. 資料庫連接
- ✅ 確保 MySQL 服務已啟動
- ✅ 檢查防火牆設置（允許連接）
- ✅ 確認連接資訊正確

### 3. 依賴安裝
- ✅ Zeabur 會自動運行 `npm install`
- ✅ 確保 `package.json` 包含所有依賴
- ✅ 檢查是否有平台特定的依賴（如 `node-rsa`）

### 4. 端口配置
- ✅ Zeabur 可能會自動設置 `PORT` 環境變數
- ✅ 確保代碼使用 `process.env.PORT || 3000`

### 5. 固定值後備
- ✅ 代碼中已設置 APP_KEY 和 APP_SECRET 的固定值作為後備
- ✅ 即使環境變數未設置也能運行（但建議設置）

---

## 📞 故障排除

### 問題 1: 服務無法啟動
- 檢查 `Procfile` 是否正確
- 查看 Zeabur 日誌
- 確認 `package.json` 中的 `start` 腳本

### 問題 2: 資料庫連接失敗
- 檢查環境變數是否正確設置
- 確認 MySQL 服務正在運行
- 檢查網絡連接

### 問題 3: API 調用失敗
- 檢查 `APP_KEY` 和 `APP_SECRET` 是否正確
- 確認 `SENSELINK_API_BASE_URL` 正確
- 查看服務器日誌

---

## 🎯 快速部署命令（參考）

```bash
# 1. 確保所有文件已提交
git status

# 2. 提交並推送
git add .
git commit -m "準備部署"
git push

# 3. 在 Zeabur 控制台：
# - 創建新服務
# - 連接 Git 倉庫
# - 設置環境變數
# - 部署
```

---

## 📋 環境變數完整清單（複製用）

```
DB_HOST=43.167.198.15
DB_PORT=31170
DB_USER=root
DB_PASSWORD=YsEcZ4dU7gXQlhz2RAN1Du90385kCFL6
DB_NAME=zeabur
SENSELINK_API_BASE_URL=http://facereg.aoy.tw/sl
APP_KEY=c6324cfa50169e85
APP_SECRET=e30af86f8f4e75d128ba4288597dea3c
PORT=3000
VISITOR_PASS_EXPIRY_HOURS=1
```

