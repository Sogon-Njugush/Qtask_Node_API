<?php
// Date setup
date_default_timezone_set('Africa/Nairobi');
$date = date('Y-m-d');

try {
    // Check for required parameters
    if (!isset($_GET['user_id'], $_GET['project_assign_id'], $_GET['key_plan_id'], $_GET['title'])) {
        throw new Exception("Missing required parameters.");
    }

    include '../db_connection.php';

    $user_id = $_GET['user_id'];
    $project_assign_id = $_GET['project_assign_id'];
    $key_plan_id = $_GET['key_plan_id']; // This parameter is not used in the query but is required
    $title = $_GET['title'];

    // Use prepared statements to prevent SQL injection
    $stmt = $conn->prepare("
        SELECT COUNT(*) AS countcm
        FROM job_card
        WHERE user_id = ?
          AND segment_id = ?
          AND title = ?
          AND DATE_FORMAT(date_created, '%Y-%m-%d') = ?
    ");

    if ($stmt === false) {
        throw new Exception("Failed to prepare SQL statement: ");
    }

    $stmt->bind_param("ssss", $user_id, $project_assign_id, $title, $date);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result === false) {
        throw new Exception("Failed to execute SQL statement:");
    }

    $count = $result->fetch_assoc()["countcm"];
    $response = [
        'count' => $count,
        'message' => 'done',
        'error' => false
    ];

} catch (Exception $e) {
    $response = [
        'count' => 'failed',
        'message' => $e->getMessage(),
        'error' => true
    ];
}

echo json_encode($response);
?>
