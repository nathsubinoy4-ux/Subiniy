<?php
// public/api/chat.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch last 50 messages
    $stmt = $conn->prepare("SELECT c.id, c.uid as userId, u.username, u.avatar as userAvatar, c.message, c.created_at as createdAt FROM chat_messages c LEFT JOIN users u ON c.uid = u.uid ORDER BY c.created_at DESC LIMIT 50");
    $stmt->execute();
    $res = $stmt->get_result();
    
    $messages = [];
    while ($row = $res->fetch_assoc()) {
        $messages[] = $row;
    }
    echo json_encode(["status" => "success", "messages" => array_reverse($messages)]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $uid = $data['userId'] ?? '';
    $message = $data['message'] ?? '';
    
    if (empty($uid) || empty($message)) {
        echo json_encode(["status" => "error", "message" => "Invalid data"]);
        exit;
    }
    
    $stmt = $conn->prepare("INSERT INTO chat_messages (uid, message) VALUES (?, ?)");
    $stmt->bind_param("ss", $uid, $message);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Message sent"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to send message"]);
    }
}
$conn->close();
?>
