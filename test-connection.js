// 測試連接和查詢
const mysql = require('mysql2/promise');

async function test() {
  const connection = await mysql.createConnection({
    host: '43.167.198.15',
    port: 31170,
    user: 'root',
    password: 'YsEcZ4dU7gXQlhz2RAN1Du90385kCFL6',
    database: 'zeabur'
  });

  try {
    // 查詢1FA2的資料
    const [rows] = await connection.query(
      'SELECT * FROM visitors WHERE door_number = ?',
      ['1FA2']
    );
    
    console.log('查詢結果：');
    console.table(rows);
    
    // 測試驗證邏輯
    const testPhone = '0987872924';
    const [rows2] = await connection.query(
      'SELECT * FROM visitors WHERE door_number = ? AND phone_encrypted = ?',
      ['1FA2', testPhone]
    );
    
    console.log('\n使用電話號碼 0987872924 查詢：');
    console.table(rows2);

    await connection.end();
  } catch (error) {
    console.error('錯誤:', error);
    await connection.end();
  }
}

test();

