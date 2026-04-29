<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$uid = $_GET['uid'] ?? '';

if (empty($uid)) {
    echo json_encode(["status" => "error", "message" => "Missing UID"]);
    exit;
}

// 1. Fetch user data
$stmt = $conn->prepare("SELECT balance, username, avatar, role, is_private FROM users WHERE uid = ?");
$stmt->bind_param("s", $uid);
$stmt->execute();
$res = $stmt->get_result();

$userData = null;
if ($row = $res->fetch_assoc()) {
    $userData = $row;
} else {
    // If user doesn't exist, create them or handle guest
    if (strpos($uid, 'GUEST_') === 0) {
        $userData = ["balance" => 0, "username" => "Guest", "avatar" => null, "role" => "guest", "is_private" => 0];
    } else {
        $insert = $conn->prepare("INSERT INTO users (uid, balance, username) VALUES (?, 0, 'User')");
        $insert->bind_param("s", $uid);
        if ($insert->execute()) {
            $userData = ["balance" => 0, "username" => "User", "avatar" => null, "role" => "user", "is_private" => 0];
        } else {
            $userData = ["balance" => 0, "username" => "User", "avatar" => null, "role" => "user", "is_private" => 0];
        }
    }
}
$stmt->close();

// 2. Fetch User's specific transactions
$stmt2 = $conn->prepare("SELECT id, name AS offerName, reward, type, created_at as createdAt FROM transactions WHERE uid = ? ORDER BY created_at DESC LIMIT 10");
$stmt2->bind_param("s", $uid);
$stmt2->execute();
$res2 = $stmt2->get_result();

$user_transactions = [];
while ($row = $res2->fetch_assoc()) {
    $user_transactions[] = [
        "id" => $row['id'],
        "userId" => $uid,
        "offerName" => $row['offerName'],
        "reward" => (float)$row['reward'],
        "type" => $row['type'] ?? 'offer',
        "createdAt" => $row['createdAt']
    ];
}
$stmt2->close();

// 3. Fetch Global recent transactions (for Live Feed)
$stmt3 = $conn->prepare("SELECT t.id, t.uid AS userId, u.username, u.avatar AS userAvatar, t.name AS offerName, t.reward, t.type, t.created_at as createdAt FROM transactions t LEFT JOIN users u ON t.uid = u.uid ORDER BY t.created_at DESC LIMIT 15");
$stmt3->execute();
$res3 = $stmt3->get_result();

$global_transactions = [];
while ($row = $res3->fetch_assoc()) {
    $global_transactions[] = [
        "id" => $row['id'],
        "userId" => $row['userId'],
        "username" => $row['username'] ?? 'User',
        "userAvatar" => $row['userAvatar'] ?? '',
        "offerName" => $row['offerName'],
        "reward" => (float)$row['reward'],
        "type" => $row['type'] ?? 'offer',
        "createdAt" => $row['createdAt']
    ];
}
$stmt3->close();

echo json_encode([
    "status" => "success",
    "success" => true,
    "balance" => (float)$userData['balance'],
    "username" => $userData['username'],
    "avatar" => $userData['avatar'],
    "role" => $userData['role'] ?? 'user',
    "isPrivate" => (bool)($userData['is_private'] ?? 0),
    "user_transactions" => $user_transactions,
    "global_transactions" => $global_transactions,
    "history" => $user_transactions
]);
$conn->close();
?>
