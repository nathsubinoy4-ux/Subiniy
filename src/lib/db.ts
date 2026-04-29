import mysql from 'mysql2/promise';

// Read config from env (fallback to the ones provided for local testing)
let envDbUrl = process.env.DATABASE_URL;
if (envDbUrl && (envDbUrl.includes('localhost') || envDbUrl.includes('127.0.0.1'))) {
  console.warn('[MySQL] Ignoring local DATABASE_URL from secrets because AI Studio cannot connect to localhost.');
  envDbUrl = undefined;
}

const dbConfig = envDbUrl ? {
  uri: envDbUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000 // 2 seconds
} : {
  host: process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST) ? process.env.DB_HOST : '31.97.2.37',
  user: process.env.DB_USER || 'u804912319_findejob',
  password: process.env.DB_PASSWORD || 'Mitu@#9090',
  database: process.env.DB_NAME || 'u804912319_findejob',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000
};

console.log(`[MySQL] Initializing connection pool to ${dbConfig.uri ? 'DATABASE_URL' : (dbConfig as any).host}...`);
export const pool = envDbUrl 
  ? mysql.createPool({ uri: envDbUrl, ...dbConfig } as mysql.PoolOptions) 
  : mysql.createPool(dbConfig as mysql.PoolOptions);
