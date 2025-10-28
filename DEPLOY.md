# 雲端部署指南

## ✅ 已完成配置

### 1. 資料庫配置（使用環境變數）

所有敏感資訊都已改為使用環境變數，便於雲端部署：

```javascript
// server.js 中的配置
const dbConfig = {
  host: process.env.DB_HOST,        // ✅ 雲端注入
  port: process.env.DB_PORT,        // ✅ 雲端注入
  user: process.env.DB_USER,        // ✅ 雲端注入
  password: process.env.DB_PASSWORD, // ✅ 雲端注入
  database: process.env.DB_NAME,    // ✅ 雲端注入
};
```

### 2. 需要的環境變數

| 變數名稱 | 說明 | 本地 | 雲端 |
|---------|------|------|------|
| `DB_HOST` | 資料庫主機 | localhost | Zeabur會自動提供 |
| `DB_PORT` | 資料庫端口 | 3306 | Zeabur會自動提供 |
| `DB_NAME` | 資料庫名稱 | visitor_db | Zeabur會自動提供 |
| `DB_USER` | 資料庫用戶 | visitor_user | Zeabur會自動提供 |
| `DB_PASSWORD` | 資料庫密碼 | visitor_pass_2024 | Zeabur會自動提供 |
| `PORT` | 服務器端口 | 3000 | 自動 |
| `VISITOR_PASS_EXPIRY_HOURS` | 訪客證有效期 | 24 | 可選設定 |

### 3. 本地開發環境

創建 `.env` 文件：
```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=visitor_db
DB_USER=visitor_user
DB_PASSWORD=visitor_pass_2024
PORT=3000
VISITOR_PASS_EXPIRY_HOURS=24
```

## 🚀 部署到Zeabur

### 步驟 1：連接資料庫

1. 在Zeabur創建MySQL資料庫服務
2. 記下連接資訊

### 步驟 2：設定環境變數

在Zeabur服務設定中，添加以下環境變數：

```
VISITOR_PASS_EXPIRY_HOURS=24
```

資料庫連接資訊（Zeabur會自動注入）：
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### 步驟 3：部署應用

1. 連接GitHub倉庫
2. Zeabur會自動檢測Node.js
3. 自動部署

### 步驟 4：初始化資料庫

部署後，需要在雲端資料庫中執行：

```sql
-- 1. 創建表結構
CREATE TABLE visitors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    door_number VARCHAR(50) NOT NULL,
    phone_encrypted TEXT NOT NULL,
    visitor_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_door (door_number)
);

CREATE TABLE visitor_passes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    visitor_id BIGINT NOT NULL,
    token TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    status ENUM('ACTIVE', 'USED', 'EXPIRED') DEFAULT 'ACTIVE',
    FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE
);

CREATE TABLE admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role ENUM('ADMIN', 'VIEWER') DEFAULT 'VIEWER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id BIGINT,
    old_data JSON,
    new_data JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 步驟 5：插入測試資料

```sql
-- 插入測試訪客
INSERT INTO visitors (door_number, phone_encrypted, visitor_name) 
VALUES ('350106', 'encrypted_0975635180', '訪客A');

INSERT INTO visitors (door_number, phone_encrypted, visitor_name) 
VALUES ('999', 'encrypted_0123456789', '測試訪客');
```

## 📊 資料庫管理

### 本地訪問
```bash
mysql -u visitor_user -pvisitor_pass_2024 visitor_db
```

### 查詢訪客
```sql
SELECT * FROM visitors;
```

### 查詢發證記錄
```sql
SELECT vp.*, v.visitor_name 
FROM visitor_passes vp 
JOIN visitors v ON vp.visitor_id = v.id;
```

### 新增訪客
```sql
INSERT INTO visitors (door_number, phone_encrypted, visitor_name)
VALUES ('新門牌', '加密電話', '訪客名稱');
```

## 🔐 安全注意事項

### 1. 密碼管理
- ✅ 不要將 `.env` 提交到Git
- ✅ 使用強密碼
- ✅ 定期更換資料庫密碼

### 2. 環境變數保護
- ✅ Zeabur會自動保護環境變數
- ✅ 不要在代碼中硬編碼密碼

### 3. 資料加密
- 📝 目前電話號碼加密功能需完整實現
- 📝 建議使用AES-256加密

## 📝 下一步改進

1. **完整實現電話號碼加密**
2. **添加管理員登入界面**
3. **實作資料庫備份功能**
4. **添加操作日誌查詢接口**

## 🎯 已實現功能

- ✅ 環境變數配置
- ✅ MySQL資料庫連接
- ✅ 訪客資料庫管理
- ✅ 訪客證發放記錄
- ✅ 雲端部署準備

