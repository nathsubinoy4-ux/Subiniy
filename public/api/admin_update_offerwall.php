<?php
// public/api/admin_update_offerwall.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$id = $data['id'] ?? null;
if (!$id) {
    echo json_encode(["status" => "error", "message" => "Missing ID"]);
    exit;
}

// Prepare dynamic update
$fields = [];
$types = "";
$values = [];

$allowed_fields = ['name', 'logoUrl', 'appId', 'apiKey', 'secretKey', 'pubId', 'url', 'postbackUrl', 'isActive'];

foreach ($data as $key => $val) {
    if (in_array($key, $allowed_fields)) {
        $fields[] = "$key = ?";
        if ($key === 'isActive') {
            $types .= "i";
            $values[] = $val ? 1 : 0;
        } else {
            $types .= "s";
            $values[] = $val;
        }
    }
}

if (empty($fields)) {
     echo json_encode(["status" => "error", "message" => "No fields to update"]);
     exit;
}

// Check if exists
$check = $conn->prepare("SELECT id FROM offerwall_settings WHERE id = ?");
$check->bind_param("s", $id);
$check->execute();
$exists = $check->get_result()->num_rows > 0;

if ($exists) {
    $sql = "UPDATE offerwall_settings SET " . implode(", ", $fields) . " WHERE id = ?";
    $types .= "s";
    $values[] = $id;
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);
} else {
    // Insert new
    $cols = array_keys($data);
    $placeholders = array_fill(0, count($data), "?");
    // This is a bit simplified, let's just do a manual insert for safety or use ON DUPLICATE KEY
    // Re-doing with INSERT INTO ... ON DUPLICATE KEY UPDATE might be better but let's stick to this for now
    
    // Actually let's just use INSERT if not exists
    $columns_str = "";
    $placeholders_str = "";
    $insert_types = "";
    $insert_values = [];
    foreach ($data as $key => $val) {
        if (in_array($key, $allowed_fields) || $key === 'id') {
             $columns_str .= ($columns_str ? ", " : "") . $key;
             $placeholders_str .= ($placeholders_str ? ", " : "") . "?";
             if ($key === 'isActive') {
                 $insert_types .= "i";
                 $insert_values[] = $val ? 1 : 0;
             } else {
                 $insert_types .= "s";
                 $insert_values[] = $val;
             }
        }
    }
    
    $sql = "INSERT INTO offerwall_settings ($columns_str) VALUES ($placeholders_str)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($insert_types, ...$insert_values);
}

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$conn->close();
?>
