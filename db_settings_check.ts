import mysql from 'mysql2/promise';

async function checkSettings() {
  const connectionDetails = {
    host: '31.97.2.37',
    user: 'u804912319_findejob',
    password: 'Mitu@#9090',
    database: 'u804912319_findejob',
    port: 3306,
  };
  const c = await mysql.createConnection(connectionDetails);
  try {
      const [rows] = await c.execute('DESCRIBE settings;');
      console.log('Settings table columns:');
      console.dir(rows);
      
      const [data] = await c.execute('SELECT * FROM settings;');
      console.log('Settings data:');
      console.dir(data);
  } catch (e) {
      console.log('Error describing settings:', e.message);
  }
  await c.end();
}
checkSettings();
