<?php
// public/api/get_live_activity.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

// Fetch recent completions from transactions
$stmt = $conn->prepare("SELECT t.id, t.uid AS userId, u.username, u.avatar AS userAvatar, t.name AS offerName, t.reward, t.type, t.created_at as createdAt FROM transactions t LEFT JOIN users u ON t.uid = u.uid ORDER BY t.created_at DESC LIMIT 20");
$stmt->execute();
$res = $stmt->get_result();

$activities = [];
while ($row = $res->fetch_assoc()) {
    $activities[] = $row;
}

echo json_encode(["status" => "success", "activities" => $activities]);
$conn->close();
?>
