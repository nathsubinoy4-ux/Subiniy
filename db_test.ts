import mysql from 'mysql2/promise';

async function testConnection() {
  const connectionDetails = {
    host: '31.97.2.37',
    user: 'u804912319_findejob',
    password: 'Mitu@#9090',
    database: 'u804912319_findejob',
    port: 3306,
  };

  try {
    const connection = await mysql.createConnection(connectionDetails);
    
    console.log('--- USERS TABLE ---');
    const [userRows] = await connection.execute('DESCRIBE users;');
    console.dir(userRows);

    try {
      console.log('\n--- OFFERS TABLE ---');
      const [offerRows] = await connection.execute('DESCRIBE offers;');
      console.dir(offerRows);
    } catch (e) {
      console.log('Offers table does not exist yet:', e.message);
    }
    
    await connection.end();
  } catch (error) {
    console.error('Failed to connect:', error.message);
  }
}

testConnection();
