<?php
$response = array('message' => 'failed', 'error' => true);

try {
    if (isset($_GET['ticket_id'], $_GET['reason'], $_GET['user_id'])) {
        include '../db_connection.php';

        // Date setup
        date_default_timezone_set('Africa/Nairobi');
        $date = date('Y-m-d H:i:s a');

        // Sanitize input to prevent SQL injection
        $ticket_id = mysqli_real_escape_string($conn, $_GET['ticket_id']);
        $user_id = mysqli_real_escape_string($conn, $_GET['user_id']);
        $reason = mysqli_real_escape_string($conn, $_GET['reason']);

        // Prepare the SQL query
        $stmt = $conn->prepare("UPDATE ticket_assign SET ticket_user_status='declined', ticket_decline_reason=?, ticket_acknowledge_date=?
                                WHERE ticket_id=? AND agent_id=?");
        $stmt->bind_param('ssii', $reason, $date, $ticket_id, $user_id);

        if ($stmt->execute()) {
            $response['message'] = "declined";
            $response['error'] = false;
        } else {
            throw new Exception("Failed to update ticket_assign.");
        }

        // Close the statement
        $stmt->close();
    } else {
        throw new Exception("Required parameters are missing.");
    }
} catch (Exception $e) {
    error_log("Error occurred: " . $e->getMessage());
    $response['message'] = "An error occurred while processing your request.";
    $response['error'] = true;
}

echo json_encode($response);

$conn->close();
?>
