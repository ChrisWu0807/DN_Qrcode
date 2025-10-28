// 初始化雲端資料庫
const mysql = require('mysql2/promise');

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: '43.167.198.15',
    port: 31170,
    user: 'root',
    password: 'YsEcZ4dU7gXQlhz2RAN1Du90385kCFL6',
    database: 'zeabur'
  });

  console.log('✅ 連接雲端資料庫成功');

  try {
    // 創建visitors表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visitors (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        door_number VARCHAR(50) NOT NULL,
        phone_encrypted TEXT NOT NULL,
        visitor_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_door (door_number)
      )
    `);
    console.log('✅ 創建visitors表成功');

    // 創建visitor_passes表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visitor_passes (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        visitor_id BIGINT NOT NULL,
        token TEXT NOT NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP NULL,
        status ENUM('ACTIVE', 'USED', 'EXPIRED') DEFAULT 'ACTIVE',
        FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_expires (expires_at)
      )
    `);
    console.log('✅ 創建visitor_passes表成功');

    // 插入測試資料
    await connection.execute(
      `INSERT IGNORE INTO visitors (door_number, phone_encrypted, visitor_name) VALUES (?, ?, ?)`,
      ['350106', '0975635180', '訪客A']
    );
    console.log('✅ 插入測試訪客A成功');

    await connection.execute(
      `INSERT IGNORE INTO visitors (door_number, phone_encrypted, visitor_name) VALUES (?, ?, ?)`,
      ['999', '0123456789', '測試訪客']
    );
    console.log('✅ 插入測試訪客999成功');

    // 顯示結果
    const [rows] = await connection.execute('SELECT * FROM visitors');
    console.log('\n📊 資料庫內容：');
    console.table(rows);

    await connection.end();
    console.log('\n✅ 資料庫初始化完成！');
  } catch (error) {
    console.error('❌ 發生錯誤:', error.message);
    await connection.end();
    process.exit(1);
  }
}

initDatabase();

