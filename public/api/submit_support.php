<?php
// public/api/submit_support.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$uid = $data['uid'] ?? 'guest';
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$subject = $data['subject'] ?? '';
$message = $data['message'] ?? '';

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO support_tickets (uid, name, email, subject, message) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $uid, $name, $email, $subject, $message);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Ticket submitted"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to submit ticket"]);
}

$conn->close();
?>
