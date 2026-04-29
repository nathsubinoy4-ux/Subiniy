<?php
// public/api/admin_update_settings.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$type = $data['type'] ?? 'general'; // general or seoConfig
$settings = $data['settings'] ?? [];

if (empty($settings)) {
    echo json_encode(["status" => "error", "message" => "No settings provided"]);
    exit;
}

// We store settings in the 'settings' table as key-value pairs
// or we can store the whole JSON blob for a key like 'general_settings'

$stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");

foreach ($settings as $key => $val) {
    if (is_array($val)) {
        $val = json_encode($val);
    }
    $stmt->bind_param("sss", $key, $val, $val);
    $stmt->execute();
}

echo json_encode(["status" => "success"]);

$conn->close();
?>
