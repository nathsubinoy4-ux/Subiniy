<?php
// public/api/update_profile.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$uid = $data['uid'] ?? '';
$is_private = isset($data['isPrivate']) ? ($data['isPrivate'] ? 1 : 0) : null;

if (empty($uid)) {
    echo json_encode(["status" => "error", "message" => "Missing UID"]);
    exit;
}

if ($is_private !== null) {
    $stmt = $conn->prepare("UPDATE users SET is_private = ? WHERE uid = ?");
    $stmt->bind_param("is", $is_private, $uid);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Profile updated"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update profile"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Nothing to update"]);
}

$conn->close();
?>
