import mysql from 'mysql2/promise';

async function check() {
  const connectionDetails = {
    host: '31.97.2.37',
    user: 'u804912319_findejob',
    password: 'Mitu@#9090',
    database: 'u804912319_findejob',
    port: 3306,
  };
  const c = await mysql.createConnection(connectionDetails);
  const [rows] = await c.execute('SHOW TABLES;');
  console.log(rows);
  const [trans] = await c.execute('DESCRIBE transactions;');
  console.log('Transactions:', trans);
  try {
      const [live] = await c.execute('DESCRIBE live_activity;');
      console.log('Live Activity:', live);
  } catch (e) {
      console.log('No live_activity table');
  }
  await c.end();
}
check();
