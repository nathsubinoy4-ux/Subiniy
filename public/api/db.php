<?php
// public/api/db.php
$host = "localhost";
$user = "u804912319_findejob";
$pass = "Mitu@#9090";
$db   = "u804912319_findejob";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed"]));
}
?>
