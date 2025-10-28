// 資料庫連接模組
// 支援MySQL和PostgreSQL
const crypto = require('crypto');

// 加密配置（使用環境變數）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';
const ALGORITHM = 'aes-256-cbc';

// 加密函數（用於電話號碼等敏感資訊）
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// 解密函數
function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 資料庫類別（抽象層）
class DatabaseManager {
  constructor(db) {
    this.db = db;
  }

  // 檢查訪客是否存在
  async checkVisitor(doorNumber, phoneNumber) {
    const phoneEncrypted = encrypt(phoneNumber);
    
    try {
      const [rows] = await this.db.query(
        'SELECT * FROM visitors WHERE door_number = ? AND phone_encrypted = ? AND is_active = TRUE',
        [doorNumber, phoneEncrypted]
      );
      
      if (rows.length > 0) {
        // 解密電話號碼
        const visitor = rows[0];
        return {
          id: visitor.id,
          doorNumber: visitor.door_number,
          phoneNumber: decrypt(visitor.phone_encrypted),
          visitorName: visitor.visitor_name
        };
      }
      return null;
    } catch (error) {
      console.error('資料庫查詢錯誤:', error);
      throw error;
    }
  }

  // 記錄訪客證發放
  async logPassIssued(visitorId, token, expiresAt) {
    try {
      await this.db.query(
        'INSERT INTO visitor_passes (visitor_id, token, expires_at) VALUES (?, ?, ?)',
        [visitorId, token, new Date(expiresAt)]
      );
    } catch (error) {
      console.error('記錄發放錯誤:', error);
      throw error;
    }
  }

  // 記錄訪客證使用
  async logPassUsed(token) {
    try {
      await this.db.query(
        'UPDATE visitor_passes SET used_at = NOW(), status = ? WHERE token = ?',
        ['USED', token]
      );
    } catch (error) {
      console.error('記錄使用錯誤:', error);
      throw error;
    }
  }

  // 檢查token是否有效
  async validatePassToken(token) {
    try {
      const [rows] = await this.db.query(
        'SELECT vp.*, v.door_number, v.visitor_name, v.phone_encrypted ' +
        'FROM visitor_passes vp ' +
        'JOIN visitors v ON vp.visitor_id = v.id ' +
        'WHERE vp.token = ? AND vp.status = ? AND vp.expires_at > NOW()',
        [token, 'ACTIVE']
      );

      if (rows.length > 0) {
        const pass = rows[0];
        return {
          valid: true,
          doorNumber: pass.door_number,
          phoneNumber: decrypt(pass.phone_encrypted),
          visitorName: pass.visitor_name,
          passId: pass.id
        };
      }
      return { valid: false };
    } catch (error) {
      console.error('驗證token錯誤:', error);
      return { valid: false };
    }
  }

  // 新增訪客（管理接口使用）
  async addVisitor(doorNumber, phoneNumber, visitorName) {
    try {
      const phoneEncrypted = encrypt(phoneNumber);
      const [result] = await this.db.query(
        'INSERT INTO visitors (door_number, phone_encrypted, visitor_name) VALUES (?, ?, ?)',
        [doorNumber, phoneEncrypted, visitorName]
      );
      return result.insertId;
    } catch (error) {
      console.error('新增訪客錯誤:', error);
      throw error;
    }
  }

  // 記錄操作日誌
  async logAction(adminId, action, tableName, recordId, oldData, newData, ipAddress) {
    try {
      await this.db.query(
        'INSERT INTO audit_logs (admin_id, action, table_name, record_id, old_data, new_data, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [adminId, action, tableName, recordId, JSON.stringify(oldData), JSON.stringify(newData), ipAddress]
      );
    } catch (error) {
      console.error('記錄操作日誌錯誤:', error);
    }
  }
}

module.exports = { DatabaseManager, encrypt, decrypt };

