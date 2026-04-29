<?php
// public/api/get_settings.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$stmt = $conn->prepare("SELECT setting_key, setting_value FROM settings");
$stmt->execute();
$res = $stmt->get_result();

$settings = [];
while ($row = $res->fetch_assoc()) {
    $val = $row['setting_value'];
    // Try to decode if it's JSON
    $decoded = json_decode($val, true);
    $settings[$row['setting_key']] = ($decoded !== null) ? $decoded : $val;
}

// Defaults
$defaults = [
    "liveFeedEnabled" => true,
    "liveFeedScrolling" => true,
    "liveFeedShowUsername" => true,
    "liveFeedShowOffer" => true
];

$final_settings = array_merge($defaults, $settings);

echo json_encode(["status" => "success", "settings" => $final_settings]);
$conn->close();
?>
