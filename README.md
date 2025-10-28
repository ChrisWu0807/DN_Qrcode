# 🏠 門牌號碼QR Code生成器

一個簡潔易用的門牌號碼和手機號碼QR Code生成工具，支援雲端部署。

## ✨ 功能特色

- 📍 輸入門牌號碼和手機號碼
- 🔲 一鍵生成QR Code
- 📥 下載QR Code圖片
- 🎨 現代化UI設計
- ☁️ 支援Zeabur雲端部署
- 📱 響應式設計，支援手機瀏覽

## 🚀 快速開始

### 本地開發

1. 安裝依賴
```bash
npm install
```

2. 啟動開發服務器
```bash
npm start
# 或使用開發模式（自動重啟）
npm run dev
```

3. 瀏覽器打開
```
http://localhost:3000
```

## 🌐 API 接口

### 生成QR Code
```
POST /api/generate-qrcode
```

**請求體:**
```json
{
  "doorNumber": "台北市信義區市府路1號",
  "phoneNumber": "0912345678"
}
```

**回應:**
```json
{
  "code": 200,
  "message": "OK",
  "desc": "",
  "data": {
    "qrcode": "data:image/png;base64,iVBORw0KG...",
    "content": "{\"doorNumber\":\"...\",\"phoneNumber\":\"...\",\"timestamp\":1234567890}",
    "timestamp": 1234567890,
    "doorNumber": "台北市信義區市府路1號",
    "phoneNumber": "0912345678"
  }
}
```

### QR Code驗證
```
POST /v2/identify/qrcode
```

此接口符合API文件的第21個接口規範。

## ☁️ 部署到Zeabur

### 方法一：自動部署（推薦）

1. 將代碼推送到GitHub
2. 在Zeabur平台連接GitHub倉庫
3. 選擇此倉庫進行自動部署
4. Zeabur會自動檢測並部署

### 方法二：手動部署

```bash
# 確保已安裝Zeabur CLI
zeabur login
zeabur project create
zeabur deploy
```

### 環境變數

可選環境變數：
- `PORT`: 服務器端口（默認: 3000）
- `DEVICE_LDID`: 設備識別碼（用於QR Code驗證）

## 📁 專案結構

```
DoorNumber_Qrcode/
├── server.js          # Express服務器
├── package.json       # 依賴配置
├── public/           # 靜態文件
│   ├── index.html    # 主頁面
│   ├── styles.css    # 樣式文件
│   └── app.js        # 前端邏輯
├── zeabur.json       # Zeabur配置
├── Procfile          # 生產環境配置
└── README.md         # 說明文檔
```

## 🛠 技術棧

- **後端**: Node.js + Express
- **前端**: 原生 JavaScript + CSS3
- **QR Code**: qrcode npm包
- **部署**: Zeabur

## 📄 授權

ISC License

## 👥 貢獻

歡迎提交Issue和Pull Request！

