# 資料庫配置說明

## 📋 資料庫架構

### 系統需要三個主要資料表：
1. **visitors** - 訪客基本資料
2. **visitor_passes** - 訪客證記錄
3. **admins** - 管理員帳號
4. **audit_logs** - 操作日誌

## 🔐 資訊安全措施

### 1. 敏感資料加密
- **電話號碼**：使用 AES-256 加密儲存
- **管理員密碼**：使用 BCrypt 雜湊

### 2. 環境變數保護
```bash
# 不要將 .env 文件提交到Git
# 已在 .gitignore 中排除

# 資料庫密碼
DB_PASSWORD=your_secure_password

# 加密金鑰（使用強密鑰）
ENCRYPTION_KEY=your-32-character-secret-key!
```

### 3. SQL注入防護
- 使用參數化查詢 (Prepared Statements)
- 所有用戶輸入都經過驗證

### 4. 加密金鑰管理
```bash
# 生成新的加密金鑰
openssl rand -base64 32
```

## 🛠 安裝步驟

### 1. 安裝資料庫
**選擇 MySQL 或 PostgreSQL**

#### MySQL
```bash
# macOS
brew install mysql
mysql.server start

# 創建資料庫
mysql -u root -p
CREATE DATABASE visitor_db;
CREATE USER 'visitor_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON visitor_db.* TO 'visitor_user'@'localhost';
```

### 2. 安裝依賴
```bash
npm install mysql2 dotenv
# 或
npm install pg dotenv  # PostgreSQL
```

### 3. 配置環境變數
```bash
cp .env.example .env
# 編輯 .env 文件，填入資料庫資訊
```

### 4. 初始化資料庫
```bash
# 執行SQL腳本
mysql -u visitor_user -p visitor_db < database-schema.sql
```

## 📊 資料流程

### 生成訪客證流程
1. 用戶輸入：門牌號 + 電話
2. 系統加密電話號碼
3. 查詢資料庫驗證是否存在
4. 如果存在 → 生成QR Code
5. 記錄發放記錄到 `visitor_passes` 表

### 驗證流程
1. 門禁機器掃描QR Code
2. 系統解析token（門牌號+電話+到期時間）
3. 查詢資料庫驗證有效性
4. 檢查是否過期
5. 記錄使用記錄
6. 返回驗證結果

## 🚨 注意事項

### 1. 生產環境配置
- 絕對不要使用預設密碼
- 定期更換加密金鑰
- 啟用資料庫SSL連線
- 限制資料庫訪問IP

### 2. 備份策略
```bash
# MySQL備份
mysqldump -u visitor_user -p visitor_db > backup.sql

# 還原
mysql -u visitor_user -p visitor_db < backup.sql
```

### 3. 監控與日誌
- 查看 `audit_logs` 表追蹤所有操作
- 監控異常登入嘗試
- 定期檢查過期的訪客證

## 🔄 遷移現有資料

如果已經有硬編碼的訪客資料：

```javascript
const validVisitors = {
  '350106 0975635180': {
    doorNumber: '350106',
    phoneNumber: '0975635180',
    visitorName: '訪客A'
  }
};
```

需要手動轉移到資料庫：
```sql
INSERT INTO visitors (door_number, phone_encrypted, visitor_name) 
VALUES ('350106', 'encrypted_phone', '訪客A');
```

