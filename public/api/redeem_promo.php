<?php
// public/api/redeem_promo.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$uid = $data['uid'] ?? null;
$code = strtoupper(trim($data['code'] ?? ''));

if (!$uid || !$code) {
    echo json_encode(["status" => "error", "message" => "Missing UID or Code"]);
    exit;
}

// 1. Check if code exists and is active
$stmt = $conn->prepare("SELECT id, rewardAmount, isActive FROM promo_codes WHERE code = ?");
$stmt->bind_param("s", $code);
$stmt->execute();
$code_res = $stmt->get_result()->fetch_assoc();

if (!$code_res) {
    echo json_encode(["status" => "error", "message" => "Invalid promo code"]);
    exit;
}

if (!$code_res['isActive']) {
    echo json_encode(["status" => "error", "message" => "This code is no longer active"]);
    exit;
}

$reward = (int)$code_res['rewardAmount'];

// 2. Check if user already used it
// We need a table for redemptions
// Let's create it if not exists in migrator, but here we can just use a unique constraint check if we had one.
// Let's assume a table 'redeemed_codes' with columns: uid, code_id, redeemedAt
$stmt = $conn->prepare("SELECT id FROM redeemed_codes WHERE uid = ? AND code_id = ?");
$cid = $code_res['id'];
$stmt->bind_param("si", $uid, $cid);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "You have already used this code"]);
    exit;
}

// 3. Process Redemption
$conn->begin_transaction();
try {
    // Add to redemptions
    $stmt = $conn->prepare("INSERT INTO redeemed_codes (uid, code_id) VALUES (?, ?)");
    $stmt->bind_param("si", $uid, $cid);
    $stmt->execute();
    
    // Update user balance
    $stmt = $conn->prepare("UPDATE users SET balance = balance + ? WHERE uid = ?");
    $stmt->bind_param("is", $reward, $uid);
    $stmt->execute();
    
    // Log transaction
    $type = 'reward';
    $name = "Promo: $code";
    $status = 'credited';
    $stmt = $conn->prepare("INSERT INTO transactions (uid, name, reward, type, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssiss", $uid, $name, $reward, $type, $status);
    $stmt->execute();
    
    $conn->commit();
    echo json_encode(["status" => "success", "reward" => $reward]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Redemption failed: " . $e->getMessage()]);
}

$conn->close();
?>
