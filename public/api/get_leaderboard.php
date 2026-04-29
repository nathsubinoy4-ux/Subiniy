<?php
// public/api/get_leaderboard.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

// Fetch top 100 users by balance
$stmt = $conn->prepare("SELECT uid, username, avatar, balance FROM users ORDER BY balance DESC LIMIT 100");
$stmt->execute();
$res = $stmt->get_result();

$leaderboard = [];
$rank = 1;
while ($row = $res->fetch_assoc()) {
    $row['rank'] = $rank++;
    $leaderboard[] = $row;
}

echo json_encode(["status" => "success", "leaderboard" => $leaderboard]);
$conn->close();
?>
