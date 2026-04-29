<?php
// ১. এরর দেখার জন্য (যাতে ৫০০ এরর এর বদলে আসল কারণ দেখা যায়)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// ২. ডাটাবেস কানেকশন (তথ্যগুলো আবার চেক করে নিন)
$conn = new mysqli("localhost", "u804912319_findejob", "Mitu@#9090", "u804912319_findejob");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "DB Connection Failed: " . $conn->connect_error]));
}

// ৩. ইনপুট ডাটা ধরা
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$email = $data['email'] ?? null;
$password = $data['password'] ?? null;
$username = $data['username'] ?? null;
$avatar = $data['avatar'] ?? null;

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Email and Password are required"]);
    exit;
}

// ৪. ইউজার চেক এবং ইনসার্ট
try {
    $check = $conn->query("SELECT id FROM users WHERE email = '$email'");
    if ($check && $check->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "User already exists"]);
    } else {
        $uid = "USER_" . bin2hex(random_bytes(8));
        $sql = "INSERT INTO users (uid, email, password, username, avatar, balance) VALUES ('$uid', '$email', '$password', '$username', '$avatar', 0)";
        
        if ($conn->query($sql)) {
            echo json_encode(["success" => true, "uid" => $uid, "message" => "Registration successful"]);
        } else {
            echo json_encode(["success" => false, "message" => "Database Error: " . $conn->error]);
        }
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}

$conn->close();
?>
