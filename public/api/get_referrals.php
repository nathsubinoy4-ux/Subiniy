<?php
// public/api/get_referrals.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$uid = $_GET['uid'] ?? '';

if (empty($uid)) {
    echo json_encode(["status" => "error", "message" => "Missing UID"]);
    exit;
}

// Fetch referrals
$stmt = $conn->prepare("SELECT uid, username, created_at FROM users WHERE referrer_uid = ? ORDER BY created_at DESC");
$stmt->bind_param("s", $uid);
$stmt->execute();
$res = $stmt->get_result();

$referrals = [];
while ($row = $res->fetch_assoc()) {
    $referrals[] = [
        "id" => $row['uid'],
        "username" => $row['username'] ?? 'Anonymous',
        "date" => $row['created_at'],
        "status" => 'Active',
        "earned" => 0 // In a real app, you'd calculate 10% of their earnings
    ];
}

echo json_encode(["status" => "success", "referrals" => $referrals]);
$conn->close();
?>
