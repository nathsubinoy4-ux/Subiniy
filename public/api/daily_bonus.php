<?php
// ১. যেকোনো এরর যেন JSON নষ্ট না করে তাই সব হাইড করি
error_reporting(0);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// ২. ডাটাবেস কানেকশন
$conn = new mysqli("localhost", "u804912319_findejob", "Mitu@#9090", "u804912319_findejob");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

// ৩. ডাটা ধরা (GET এবং POST দুইটাই চেক করবে)
$uid = $_GET['uid'] ?? null;
if (!$uid) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $uid = $data['uid'] ?? $data['userId'] ?? null;
}

// যদি আইডি না পায় বা ভুল আইডি পায়
if (!$uid || $uid == "null" || $uid == "{userId}") {
    echo json_encode(["success" => false, "error" => "User ID is invalid or missing"]);
    exit;
}

$amount = 50;
$tid = "BONUS_" . time();

// ৪. ডাটাবেস আপডেট (ট্রাই-ক্যাচ ব্যবহার করছি যাতে ৫০০ এরর না আসে)
try {
    $check = $conn->query("SELECT uid FROM users WHERE uid = '$uid'");
    
    if ($check && $check->num_rows > 0) {
        $conn->query("UPDATE users SET balance = balance + $amount WHERE uid = '$uid'");
    } else {
        $conn->query("INSERT INTO users (uid, balance) VALUES ('$uid', $amount)");
    }

    $conn->query("INSERT INTO transactions (trans_id, uid, amount) VALUES ('$tid', '$uid', $amount)");
    echo json_encode(["success" => true, "message" => "Successfully claimed 50 coins!"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => "Database operation failed"]);
}

$conn->close();
?>
