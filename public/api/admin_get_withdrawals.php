<?php
// public/api/admin_get_withdrawals.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$filter = $_GET['filter'] ?? 'all';
$sql = "SELECT w.*, u.username FROM withdrawals w LEFT JOIN users u ON w.uid = u.uid";

if ($filter !== 'all') {
    $sql .= " WHERE w.status = ?";
}
$sql .= " ORDER BY w.created_at DESC LIMIT 100";

$stmt = $conn->prepare($sql);
if ($filter !== 'all') {
    $stmt->bind_param("s", $filter);
}
$stmt->execute();
$res = $stmt->get_result();

$withdrawals = [];
while ($row = $res->fetch_assoc()) {
    $row['userId'] = $row['uid'];
    $row['time'] = date('m/d/Y H:i', strtotime($row['created_at']));
    $withdrawals[] = $row;
}

echo json_encode(["status" => "success", "withdrawals" => $withdrawals]);
$conn->close();
?>
