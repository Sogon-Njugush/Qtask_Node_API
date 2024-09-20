<?php
include '../db_connection.php';

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'project_assign_id' is set
if (isset($_GET['project_assign_id'])) {
    // Sanitize and assign the project_assign_id
    $project_assign_id = $_GET['project_assign_id'];

    // Prepare the SQL query with placeholders
    $sql = "UPDATE project_assign_user
            SET request_status = 'accepted', accept_date = ?
            WHERE segment_assign_id = ?";

    try {
        // Prepare the statement
        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            throw new Exception('Failed to prepare SQL statement.');
        }

        // Bind parameters
        $stmt->bind_param('si', $date, $project_assign_id);

        // Set the date
        date_default_timezone_set('Africa/Nairobi');
        $date = date('Y-m-d H:i:s');

        // Execute the statement
        if ($stmt->execute()) {
            $response['message'] = "accepted";
            $response['error'] = false;
        } else {
            throw new Exception('Failed to execute SQL statement.');
        }

        // Close the statement
        $stmt->close();

    } catch (Exception $e) {
        $response['message'] = 'Error! Something went Wrong.';
    }
}

echo json_encode($response);

// Close the database connection
$conn->close();
?>
