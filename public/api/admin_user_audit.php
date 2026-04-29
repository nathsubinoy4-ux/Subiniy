<?php
// public/api/admin_user_audit.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$uid = $_GET['uid'] ?? null;

if (!$uid) {
    echo json_encode(["status" => "error", "message" => "Missing UID"]);
    exit;
}

// 1. Fetch User Data
$stmt = $conn->prepare("SELECT * FROM users WHERE uid = ?");
$stmt->bind_param("s", $uid);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

// 2. Fetch Recent Earnings (Transactions)
$stmt = $conn->prepare("SELECT * FROM transactions WHERE uid = ? AND type IN ('offer', 'reward', 'earning') ORDER BY created_at DESC LIMIT 20");
$stmt->bind_param("s", $uid);
$stmt->execute();
$res = $stmt->get_result();

$history = [];
while ($row = $res->fetch_assoc()) {
    $row['time'] = date('m/d/Y H:i', strtotime($row['created_at']));
    $history[] = $row;
}

echo json_encode([
    "status" => "success",
    "user" => $user,
    "history" => $history
]);

$conn->close();
?>
