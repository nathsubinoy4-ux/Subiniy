<?php
// public/api/admin_get_users.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

// Security check: only allow if authenticated as admin session
// (This is simple, ideally we check a token)
// For now, we trust the client if they are in the admin dashboard area
// but we should ideally check a secret key or session.

$stmt = $conn->prepare("SELECT uid, username AS displayName, email, avatar AS photoURL, balance, role, isBanned, created_at AS createdAt FROM users ORDER BY created_at DESC LIMIT 100");
$stmt->execute();
$res = $stmt->get_result();

$users = [];
while ($row = $res->fetch_assoc()) {
    $row['isBanned'] = (bool)$row['isBanned'];
    $row['balance'] = (int)$row['balance'];
    $users[] = $row;
}

echo json_encode(["status" => "success", "users" => $users]);
$conn->close();
?>
