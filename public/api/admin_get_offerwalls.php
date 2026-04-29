<?php
// public/api/admin_get_offerwalls.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$res = $conn->query("SELECT * FROM offerwall_settings");
$configs = [];
while ($row = $res->fetch_assoc()) {
    $row['isActive'] = (bool)$row['isActive'];
    $configs[] = $row;
}

echo json_encode(["status" => "success", "configs" => $configs]);
$conn->close();
?>
