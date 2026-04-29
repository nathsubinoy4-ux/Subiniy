import { pool } from './src/lib/db';

async function initDB() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255) UNIQUE,
        email VARCHAR(255),
        password VARCHAR(255) DEFAULT '',
        username VARCHAR(255),
        balance DECIMAL(10, 2) DEFAULT 0,
        streak INT DEFAULT 0,
        role VARCHAR(50) DEFAULT 'user',
        is_private TINYINT(1) DEFAULT 0,
        lastLogin DATETIME,
        avatar_url VARCHAR(255)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(255),
        type VARCHAR(50),
        amount DECIMAL(10, 2),
        description VARCHAR(255),
        username VARCHAR(255),
        avatar VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS offerwalls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        image_url VARCHAR(255),
        bonus_percentage INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        url VARCHAR(255),
        description VARCHAR(255),
        bg_color VARCHAR(50)
      )
    `);

    console.log('Database tables created successfully.');
  } catch (error: any) {
    console.error('Error creating database tables:', error.message);
  } finally {
    process.exit(0);
  }
}

initDB();
