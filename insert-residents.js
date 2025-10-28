// 批量插入住戶資料到雲端資料庫
const mysql = require('mysql2/promise');

async function insertResidents() {
  const connection = await mysql.createConnection({
    host: '43.167.198.15',
    port: 31170,
    user: 'root',
    password: 'YsEcZ4dU7gXQlhz2RAN1Du90385kCFL6',
    database: 'zeabur'
  });

  console.log('✅ 連接雲端資料庫成功');

  try {
    // 要插入的資料（門牌號 | 電話號碼）
    const residents = [
      ['1FA2', '0987872924'],
      ['1FA3', '0933883030'],
      ['1FA6', '0905285227'],
      ['1FA7', '0910935420'],
      ['1FA8', '0919650509'],
      ['1FA9', '0919225491'],
      ['2FA1', '0975133969'],
      ['2FA2', '0983979464'],
      ['2FA3', '0955766748'],
      ['2FA5', '039563968'],
      ['2FA6', '0911294839'],
      ['2FA7', '0976633390'],
      ['2FA8', '0920890286'],
      ['2FA9', '0920890286'],
      ['3FA1', '0915935220'],
      ['3FA2', '0979007797'],
      ['3FA3', '0910128580'],
      ['3FA5', '0906191608'],
      ['3FA6', '0979228589'],
      ['3FA7', '0979228589'],
      ['3FA8', '0921377318'],
      ['3FA9', '0921377318'],
      ['4FA1', '0912299157'],
      ['4FA2', '0978477876'],
      ['4FA3', '0933216609'],
      ['4FA5', '0910721183'],
      ['4FA6', '0971320527'],
      ['4FA7', '0963037613'],
      ['4FA8', '0963246005'],
      ['4FA9', '0912657678']
    ];

    console.log(`準備插入 ${residents.length} 筆資料...\n`);

    for (const [doorNumber, phoneNumber] of residents) {
      await connection.execute(
        `INSERT IGNORE INTO visitors (door_number, phone_encrypted, visitor_name) 
         VALUES (?, ?, ?)`,
        [doorNumber, phoneNumber, `${doorNumber} 住戶`]
      );
      console.log(`✅ 插入: ${doorNumber} - ${phoneNumber}`);
    }

    // 顯示結果
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM visitors');
    console.log(`\n📊 資料庫總共 ${rows[0].total} 筆訪客資料`);

    await connection.end();
    console.log('\n✅ 批量插入完成！');
  } catch (error) {
    console.error('❌ 發生錯誤:', error.message);
    await connection.end();
    process.exit(1);
  }
}

insertResidents();

