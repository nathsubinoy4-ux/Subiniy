<?php
// public/api/admin_promo_codes.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $res = $conn->query("SELECT * FROM promo_codes ORDER BY createdAt DESC");
    $codes = [];
    while ($row = $res->fetch_assoc()) {
        $row['isActive'] = (bool)$row['isActive'];
        $row['rewardAmount'] = (int)$row['rewardAmount'];
        $codes[] = $row;
    }
    echo json_encode(["status" => "success", "promoCodes" => $codes]);
} elseif ($method === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $action = $data['action'] ?? 'create';
    
    if ($action === 'create') {
        $code = strtoupper($data['code']);
        $reward = (int)$data['rewardAmount'];
        
        $stmt = $conn->prepare("INSERT INTO promo_codes (code, rewardAmount, isActive) VALUES (?, ?, 1)");
        $stmt->bind_param("si", $code, $reward);
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => $stmt->error]);
        }
    } elseif ($action === 'toggle') {
        $id = $data['id'];
        $isActive = $data['isActive'] ? 1 : 0;
        
        $stmt = $conn->prepare("UPDATE promo_codes SET isActive = ? WHERE id = ?");
        $stmt->bind_param("ii", $isActive, $id);
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => $stmt->error]);
        }
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM promo_codes WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
}

$conn->close();
?>
