<?php
$response = array('message' => 'failed', 'error' => true);

try {
    if (isset($_GET['ticket_id'], $_GET['description'], $_GET['user_id'], $_GET['fault_cause'],$_GET['fault_type'],$_GET['fault_location'])) {
        include '../db_connection.php';

        // Date setup
        date_default_timezone_set('Africa/Nairobi');
        $date = date('Y-m-d H:i:s a');

        // Sanitize input to prevent SQL injection
        $ticket_id = mysqli_real_escape_string($conn, $_GET['ticket_id']);
        $user_id = mysqli_real_escape_string($conn, $_GET['user_id']);
        $description = mysqli_real_escape_string($conn, $_GET['description']);
        $fault_cause = mysqli_real_escape_string($conn, $_GET['fault_cause']);
        $fault_type = mysqli_real_escape_string($conn, $_GET['fault_type']);
        $fault_location = mysqli_real_escape_string($conn, $_GET['fault_location']);

        // Prepare the SQL query
        $stmt = $conn->prepare("INSERT INTO ticket_fault_cause(ticket_id,user_id,fault_type,fault_cause,fault_location,fault_description,fault_create_date) VALUES(?,?,?,?,?,?,?)");
        $stmt->bind_param('iisssss', $ticket_id, $user_id,$fault_type,$fault_cause,$fault_location,$description,$date);

        if ($stmt->execute()) {
            $response['message'] = "sent";
            $response['error'] = true;
        } else {
            throw new Exception("Failed to process request.");
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
