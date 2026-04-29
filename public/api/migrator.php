<?php
// public/api/migrator.php
require_once 'db.php';

// Safe wrapper for executing schema changes
function addColumnIfNotExists($conn, $table, $column, $definition) {
    $result = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($result && $result->num_rows === 0) {
        $conn->query("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
    }
}

// Ensure all base tables exist
$sql = [
    "CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(128) PRIMARY KEY,
        username VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(128),
        name VARCHAR(255),
        reward DECIMAL(15,2),
        type VARCHAR(50),
        trans_id VARCHAR(128),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS withdrawals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(128),
        method VARCHAR(50),
        address VARCHAR(255),
        amount DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(128),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
    )",
    "CREATE TABLE IF NOT EXISTS promo_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        rewardAmount INT DEFAULT 0,
        isActive TINYINT(1) DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS redeemed_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(128) NOT NULL,
        code_id INT NOT NULL,
        redeemedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_code (uid, code_id)
    )",
    "CREATE TABLE IF NOT EXISTS offerwall_settings (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100),
        logoUrl TEXT,
        appId VARCHAR(255),
        apiKey VARCHAR(255),
        secretKey VARCHAR(255),
        pubId VARCHAR(255),
        url TEXT,
        postbackUrl TEXT,
        isActive TINYINT(1) DEFAULT 0,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uid VARCHAR(128),
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($sql as $query) {
    $conn->query($query);
}

// Safely add missing columns to users table
addColumnIfNotExists($conn, 'users', 'email', 'VARCHAR(255) DEFAULT NULL');
addColumnIfNotExists($conn, 'users', 'password', 'VARCHAR(255) DEFAULT NULL');
addColumnIfNotExists($conn, 'users', 'avatar', 'VARCHAR(255) DEFAULT NULL');
addColumnIfNotExists($conn, 'users', 'balance', 'DECIMAL(15,2) DEFAULT 0.00');
addColumnIfNotExists($conn, 'users', 'role', "VARCHAR(50) DEFAULT 'user'");
addColumnIfNotExists($conn, 'users', 'referrer_uid', 'VARCHAR(128) DEFAULT NULL');
addColumnIfNotExists($conn, 'users', 'is_private', 'TINYINT(1) DEFAULT 0');

// Safely add missing columns to transactions table
addColumnIfNotExists($conn, 'transactions', 'type', "VARCHAR(50) DEFAULT 'offer'");
addColumnIfNotExists($conn, 'transactions', 'offerwall', "VARCHAR(50) DEFAULT NULL");
addColumnIfNotExists($conn, 'transactions', 'name', "VARCHAR(255) DEFAULT NULL");
addColumnIfNotExists($conn, 'transactions', 'reward', "DECIMAL(15,2) DEFAULT 0.00");
addColumnIfNotExists($conn, 'transactions', 'status', "VARCHAR(50) DEFAULT 'credited'");
addColumnIfNotExists($conn, 'transactions', 'network', "VARCHAR(50) DEFAULT NULL");

echo json_encode(["status" => "success", "message" => "Migration check complete V4"]);
?>
