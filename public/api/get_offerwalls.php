<?php
// public/api/get_offerwalls.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$id = $_GET['id'] ?? '';

if (!empty($id)) {
    $stmt = $conn->prepare("SELECT * FROM offerwall_settings WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($row = $res->fetch_assoc()) {
        $row['isActive'] = (bool)$row['isActive'];
        echo json_encode(["status" => "success", "config" => $row]);
    } else {
        echo json_encode(["status" => "error", "message" => "Offerwall not found"]);
    }
} else {
    $res = $conn->query("SELECT * FROM offerwall_settings");
    $configs = [];
    while ($row = $res->fetch_assoc()) {
        $row['isActive'] = (bool)$row['isActive'];
        $configs[] = $row;
    }
    echo json_encode(["status" => "success", "offerwalls" => $configs]);
}
$conn->close();
?>
