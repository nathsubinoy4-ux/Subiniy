<?php
// public/api/admin_update_user.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$uid = $data['uid'] ?? null;
$updates = $data['updates'] ?? [];

if (!$uid) {
    echo json_encode(["status" => "error", "message" => "Missing UID"]);
    exit;
}

if (empty($updates)) {
    echo json_encode(["status" => "error", "message" => "No updates provided"]);
    exit;
}

$fields = [];
$params = [];
$types = "";

foreach ($updates as $key => $val) {
    // Only allow specific keys
    if (in_array($key, ['isBanned', 'role', 'balance', 'username', 'avatar'])) {
        $db_key = $key;
        if ($key === 'username') $db_key = 'username';
        if ($key === 'avatar') $db_key = 'avatar';
        
        $fields[] = "$db_key = ?";
        $params[] = $val;
        $types .= is_int($val) ? "i" : "s";
    }
}

if (empty($fields)) {
    echo json_encode(["status" => "error", "message" => "Invalid fields"]);
    exit;
}

$types .= "s";
$params[] = $uid;

$sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE uid = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$conn->close();
?>
