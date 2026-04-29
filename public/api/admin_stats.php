<?php
// public/api/admin_stats.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

// 1. Total Users
$user_count = $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'];

// 2. Pending Withdrawals
$pending_withdrawals = $conn->query("SELECT COUNT(*) as count FROM transactions WHERE type='withdrawal' AND status='pending'")->fetch_assoc()['count'];

// 3. Total Revenue (Earnings Credited)
$total_revenue_coins = $conn->query("SELECT SUM(reward) as total FROM transactions WHERE type='earning' AND status='credited'")->fetch_assoc()['total'] ?: 0;
// Assuming 1000 coins = $1
$total_revenue = $total_revenue_coins * 0.001;

// 4. Total Paid (Withdrawals Credited)
$total_paid_coins = $conn->query("SELECT SUM(reward) as total FROM transactions WHERE type='withdrawal' AND status='credited'")->fetch_assoc()['total'] ?: 0;
$total_paid = $total_paid_coins * 0.001;

// 5. Active Offerwalls (from settings or dedicated table)
// For now, let's just count from settings or assume some
$active_offerwalls = 6; // Hardcoded or fetch from settings table if exists

// 6. Chart Data (Last 7 Days)
$daily_data = [];
for ($i = 6; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-$i days"));
    $display_date = date('M d', strtotime("-$i days"));
    
    // Revenue for this day
    $day_rev_coins = $conn->query("SELECT SUM(reward) as total FROM transactions WHERE type='earning' AND status='credited' AND DATE(created_at) = '$date'")->fetch_assoc()['total'] ?: 0;
    
    // Active users for this day
    $day_users = $conn->query("SELECT COUNT(DISTINCT uid) as count FROM transactions WHERE DATE(created_at) = '$date'")->fetch_assoc()['count'] ?: 0;
    
    $daily_data[] = [
        "date" => $display_date,
        "Revenue" => round($day_rev_coins * 0.001, 2),
        "ActiveUsers" => (int)$day_users
    ];
}

// 7. Offerwall Performance
$offerwall_stats = [];
$res = $conn->query("SELECT network as name, COUNT(*) as value FROM transactions WHERE type='earning' AND status='credited' GROUP BY network ORDER BY value DESC");
$colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
$i = 0;
while ($row = $res->fetch_assoc()) {
    $row['name'] = strtoupper($row['name'] ?: 'Other');
    $row['value'] = (int)$row['value'];
    $row['fill'] = $colors[$i % count($colors)];
    $offerwall_stats[] = $row;
    $i++;
}

// 8. Top Offers
$top_offers = [];
$res = $conn->query("SELECT name, COUNT(*) as count, SUM(reward) as reward FROM transactions WHERE type='earning' AND status='credited' GROUP BY name ORDER BY count DESC LIMIT 5");
while ($row = $res->fetch_assoc()) {
    $row['count'] = (int)$row['count'];
    $row['reward'] = (int)$row['reward'];
    $top_offers[] = $row;
}

// 9. Recent Withdrawals
$recent_withdrawals = [];
$res = $conn->query("SELECT t.id, t.uid, t.reward, t.name, t.status, t.created_at as time, u.username FROM transactions t LEFT JOIN users u ON t.uid = u.uid WHERE t.type='withdrawal' AND t.status='pending' ORDER BY t.created_at DESC LIMIT 5");
while ($row = $res->fetch_assoc()) {
    $row['time'] = date('m/d/Y', strtotime($row['time']));
    $row['username'] = $row['username'] ?: 'Anonymous';
    $recent_withdrawals[] = $row;
}

echo json_encode([
    "status" => "success",
    "stats" => [
        "totalUsers" => (int)$user_count,
        "pendingCount" => (int)$pending_withdrawals,
        "totalRevenue" => (float)$total_revenue,
        "totalPaidUSD" => (float)$total_paid,
        "activeOfferwalls" => (int)$active_offerwalls
    ],
    "dailyData" => $daily_data,
    "offerwallStats" => $offerwall_stats,
    "topOffers" => $top_offers,
    "withdrawals" => $recent_withdrawals
]);

$conn->close();
?>
