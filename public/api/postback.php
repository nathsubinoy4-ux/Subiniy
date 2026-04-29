<?php
/**
 * Universal Postback Handler for findejob.com
 * Handles callbacks from GemiAd, Adlexy, Revtoo, Notik, etc.
 */

require_once 'db.php';

// 1. Get Params
$params = array_merge($_GET, $_POST);
$log_entry = date('Y-m-d H:i:s') . " - POSTBACK: " . json_encode($params) . PHP_EOL;
file_put_contents('postbacks.log', $log_entry, FILE_APPEND);

// 2. Identify variables (Universal)
$userId = $params['user_id'] ?? $params['uid'] ?? $params['subId'] ?? $params['identity_id'] ?? null;
$amount = $params['amount'] ?? $params['reward'] ?? $params['payout'] ?? $params['virtual_currency'] ?? $params['points'] ?? 0;
$txid = $params['trans_id'] ?? $params['transaction_id'] ?? $params['txn_id'] ?? $params['txid'] ?? $params['transid'] ?? null;
$source = $params['source'] ?? 'offerwall';

// 3. Response logic
if (!$userId) {
    echo "ERROR: MISSING_USER";
    exit;
}

$amount = (float)$amount;

// Add user if doesn't exist
$insertUser = $conn->prepare("INSERT IGNORE INTO users (uid, balance, username) VALUES (?, 0, 'User')");
$insertUser->bind_param("s", $userId);
$insertUser->execute();
$insertUser->close();

// Update balance
$update = $conn->prepare("UPDATE users SET balance = balance + ? WHERE uid = ?");
$update->bind_param("ds", $amount, $userId);
$update->execute();
$update->close();

// Insert transaction
$type = 'offer';
// Optionally prefix name with source
$name = strtoupper($source) . ' Offer';
$insertT = $conn->prepare("INSERT INTO transactions (uid, name, reward, type) VALUES (?, ?, ?, ?)");
$insertT->bind_param("ssds", $userId, $name, $amount, $type);
$insertT->execute();
$insertT->close();

// Response
echo "OK";
$conn->close();
?>
