<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$uid = $data['uid'] ?? '';
$amount = $data['amount'] ?? 0;
$method = $data['method'] ?? 'crypto';
$address = $data['address'] ?? '';

if (empty($uid) || empty($amount) || empty($address)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$amount = (float)$amount;

$stmt = $conn->prepare("SELECT balance FROM users WHERE uid = ?");
$stmt->bind_param("s", $uid);
$stmt->execute();
$res = $stmt->get_result();

if ($row = $res->fetch_assoc()) {
    $balance = (float)$row['balance'];
    if ($balance < $amount) {
        echo json_encode(["status" => "error", "message" => "Insufficient balance"]);
        exit;
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}
$stmt->close();

$update = $conn->prepare("UPDATE users SET balance = balance - ? WHERE uid = ?");
$update->bind_param("ds", $amount, $uid);
if (!$update->execute()) {
    echo json_encode(["status" => "error", "message" => "Failed to update balance"]);
    exit;
}
$update->close();

// Insert to withdrawals
$insertW = $conn->prepare("INSERT INTO withdrawals (uid, method, address, amount, status) VALUES (?, ?, ?, ?, 'pending')");
$insertW->bind_param("sssd", $uid, $method, $address, $amount);
$insertW->execute();
$insertW->close();

// Insert to transactions for Live Feed
$offerName = $method . ' Withdrawal';
$type = 'withdrawal';
$insertT = $conn->prepare("INSERT INTO transactions (uid, name, reward, type) VALUES (?, ?, ?, ?)");
$insertT->bind_param("ssds", $uid, $offerName, $amount, $type);
$insertT->execute();
$insertT->close();

echo json_encode(["status" => "success", "new_balance" => $balance - $amount]);
$conn->close();
?>
