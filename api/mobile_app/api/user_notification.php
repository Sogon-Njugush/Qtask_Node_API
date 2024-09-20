<?php
include "../db_connection.php";

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'user_id' is set
if (isset($_GET['user_id'])) {
    $user_id = $_GET['user_id'];

    try {
        // Prepare the SQL query with a placeholder
        $sql = "SELECT * FROM user_logs WHERE user_id = ?";

        // Using prepared statements for secure queries
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Failed to prepare SQL statement.');
        }

        // Bind the user_id parameter
        $stmt->bind_param('i', $user_id);

        if (!$stmt->execute()) {
            throw new Exception('Failed to execute SQL statement.');
        }

        // Get the result
        $result = $stmt->get_result();
        if (!$result) {
            throw new Exception('Failed to retrieve results from the query.');
        }

        // Initialize the details list
        $response['detailslist'] = array();

        // Fetch the results
        while ($row = $result->fetch_assoc()) {
            $detailslist = array(
                'log_title' => $row['log_title'],
                'log_message' => $row['log_message'],
                'log_time' => $row['log_time'],
                'log_id' => $row['log_id']
            );
            $response['detailslist'][] = $detailslist;
        }

        // Set response to success
        $response['error'] = false;
        $response['message'] = "sent";

        // Close statement
        $stmt->close();

    } catch (Exception $e) {
        $response['message'] = 'Something Went Wrong!';
    }
}

echo json_encode($response);

// Close the database connection
$conn->close();
?>

