<?php
try {
    // Check for required parameters
    if (!isset($_GET['segment_id'], $_GET['user_id'], $_GET['comment'])) {
        throw new Exception("Insufficient Parameters");
    }

    include '../db_connection.php';

    // Date setup
    date_default_timezone_set('Africa/Nairobi');
    $date = date('Y-m-d H:i:s'); // 24-hour format

    $segment_id = $_GET['segment_id'];
    $comment = $_GET['comment'];
    $user_id = $_GET['user_id'];

    // Use transaction for multiple queries
    $conn->begin_transaction();

    // 1. Update project_segment table
    $stmt1 = $conn->prepare("
        UPDATE project_segment
        SET segment_status = 'Completed'
        WHERE segment_id = ?
    ");

    if ($stmt1 === false) {
        throw new Exception("Failed to prepare SQL statement for project_segment update.");
    }

    $stmt1->bind_param("s", $segment_id);
    $result1 = $stmt1->execute();

    if (!$result1) {
        throw new Exception("Failed to execute SQL statement for project_segment update.");
    }

    $stmt1->close();

    // 2. Insert into segment_supervisor_closure table
    $stmt2 = $conn->prepare("
        INSERT INTO segment_supervisor_closure
        (segment_id, supervisor_id, closure_remark, closure_date, closure_status, closure_approved_by, closure_approve_date, closure_remark)
        VALUES (?, ?, ?, ?, 'Pending', '', '', '')
    ");

    if ($stmt2 === false) {
        throw new Exception("Failed to prepare SQL statement for segment_supervisor_closure insert.");
    }

    $stmt2->bind_param("sss", $segment_id, $user_id, $comment, $date);
    $result2 = $stmt2->execute();

    if (!$result2) {
        throw new Exception("Failed to execute SQL statement for segment_supervisor_closure insert.");
    }

    $stmt2->close();

    // If both queries were successful, commit the transaction
    $conn->commit();

    $response = [
        'message' => 'sent',
        'error' => false
    ];

} catch (Exception $e) {
    // Rollback the transaction if anything goes wrong
    $conn->rollback();
    $response = [
        'message' => $e->getMessage(),
        'error' => true
    ];
}

echo json_encode($response);
?>
