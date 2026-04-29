import mysql from 'mysql2/promise';

async function updateSchema() {
  const connectionDetails = {
    host: '31.97.2.37',
    user: 'u804912319_findejob',
    password: 'Mitu@#9090',
    database: 'u804912319_findejob',
    port: 3306,
  };

  try {
    const connection = await mysql.createConnection(connectionDetails);
    
    console.log('Adding missing columns to users table...');
    
    const alterQuery = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS lastLogin TIMESTAMP NULL DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS offersCompleted INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS surveysCompleted INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS refereeName VARCHAR(100) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS referralEarnings DECIMAL(10,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS usersInvited INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS isBanned TINYINT(1) DEFAULT 0;
    `;

    // MySQL might not support IF NOT EXISTS in ALTER TABLE add column (depends on MariaDB / MySQL version)
    // To be safe, we will just try adding them and catch error if duplicate
    const columnsToAdd = [
      "country VARCHAR(100) DEFAULT NULL",
      "streak INT DEFAULT 0",
      "lastLogin TIMESTAMP NULL DEFAULT NULL",
      "createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "offersCompleted INT DEFAULT 0",
      "surveysCompleted INT DEFAULT 0",
      "refereeName VARCHAR(100) DEFAULT NULL",
      "referralEarnings DECIMAL(10,2) DEFAULT 0.00",
      "usersInvited INT DEFAULT 0",
      "isBanned TINYINT(1) DEFAULT 0"
    ];

    for (let col of columnsToAdd) {
        try {
            await connection.execute(`ALTER TABLE users ADD COLUMN ${col};`);
            console.log(`Added column: ${col}`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log(`Column already exists, skipping: ${col.split(' ')[0]}`);
            } else {
                console.warn(`Error adding column ${col}:`, e.message);
            }
        }
    }

    console.log('Creating offers table...');
    const createOffersQuery = `
      CREATE TABLE IF NOT EXISTS offers (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          reward DECIMAL(10,2) DEFAULT 0.00,
          category VARCHAR(50),
          imageUrl VARCHAR(255),
          difficulty VARCHAR(50),
          isFuture TINYINT(1) DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await connection.execute(createOffersQuery);
    console.log('Offers table created successfully.');

    await connection.end();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

updateSchema();
