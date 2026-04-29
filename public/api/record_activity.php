<?php
// public/api/record_activity.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$uid = $data['userId'] ?? null;
$username = $data['username'] ?? 'User';
$userAvatar = $data['userAvatar'] ?? '';
$offerName = $data['offerName'] ?? 'Task';
$reward = (int)($data['reward'] ?? 0);
$type = $data['type'] ?? 'offer';

if (!$uid) {
    echo json_encode(["status" => "error", "message" => "Missing UID"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO transactions (uid, name, reward, type, status, network) VALUES (?, ?, ?, ?, 'credited', ?)");
$network = $data['network'] ?? 'System';
$stmt->bind_param("ssiss", $uid, $offerName, $reward, $type, $network);

if ($stmt->execute()) {
    // Optionally also log to a dedicated activity table if needed, 
    // but for now, the get_live_activity.php fetches from transactions.
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$conn->close();
?>
