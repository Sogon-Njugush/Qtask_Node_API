<?php
try {
    // Check for required parameters
    if (!isset($_GET['project_assign_id'], $_GET['reason'])) {
        throw new Exception("Insufficient Parameters");
    }

    include '../db_connection.php';

    // Date setup
    date_default_timezone_set('Africa/Nairobi');
    $date = date('Y-m-d H:i:s'); // Changed to 24-hour format

    $project_assign_id = $_GET['project_assign_id'];
    $reason = $_GET['reason'];

    // Use prepared statements to prevent SQL injection
    $stmt = $conn->prepare("
        UPDATE project_assign_user
        SET request_status = 'declined', reject_reason = ?, accept_date = ?
        WHERE segment_assign_id = ?
    ");

    if ($stmt === false) {
        throw new Exception("Failed to prepare SQL statement: ");
    }

    $stmt->bind_param("sss", $reason, $date, $project_assign_id);
    $result = $stmt->execute();

    if ($result) {
        $response = [
            'message' => 'declined',
            'error' => false
        ];
    } else {
        throw new Exception("Failed to execute SQL statement: ");
    }

    $stmt->close();

} catch (Exception $e) {
    $response = [
        'message' => $e->getMessage(),
        'error' => true
    ];
}

echo json_encode($response);
?>
