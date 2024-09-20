<?php
$response = ['message' => 'failed', 'error' => true];
try {
    if (isset($_GET['ticket_id']) && isset($_GET['user_id'])) {
        include_once '../db_connection.php';
        if ($conn->connect_error) {
                    throw new Exception("Connection failed: " . $conn->connect_error);
                }

        // Date setup
        date_default_timezone_set('Africa/Nairobi');
        $date = date('Y-m-d H:i:s a');
        $user_id = $_GET['user_id'];
        $ticket_id = $_GET['ticket_id'];

        // Prepare the SQL statement with placeholders to prevent SQL injection
        $sql = "UPDATE ticket_assign
                SET ticket_user_status = ?, ticket_acknowledge_date = ?
                WHERE ticket_id = ? AND agent_id = ?";

        // Prepare the statement
        if ($stmt = $conn->prepare($sql)) {
            $status = 'in-progress';

            // Bind variables to the prepared statement as parameters
            $stmt->bind_param('ssii', $status, $date, $ticket_id, $user_id);

            // Attempt to execute the prepared statement
            if ($stmt->execute()) {
                $response['message'] = "accepted";
                $response['error'] = false;
            }

            // Close statement
            $stmt->close();
        } else {
            throw new Exception("Connection Lost, Try Again");
        }

        // Close connection
        $conn->close();
    } else {
        throw new Exception("Missing required parameters.");
    }
} catch (Exception $e) {
    // Handle any errors
    //$response['message'] = $e->getMessage();
    $response['message'] = "Something went wrong.";
}

// Output the response as JSON
echo json_encode($response);
?>
