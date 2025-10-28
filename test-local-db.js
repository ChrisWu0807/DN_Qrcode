// 測試本地資料庫
const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'visitor_user',
    password: 'visitor_pass_2024',
    database: 'visitor_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const [rows] = await pool.query('SELECT * FROM visitors WHERE door_number = ? AND phone_encrypted = ?', ['1FA2', '0987872924']);
    console.log('本地資料庫查詢結果：');
    console.table(rows);
    await pool.end();
  } catch (error) {
    console.error('錯誤:', error.message);
    await pool.end();
  }
}

test();

