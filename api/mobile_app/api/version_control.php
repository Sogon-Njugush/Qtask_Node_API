<?php
include_once '../db_connection.php';

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters', 'expiry' => false);

// Check if 'version_code' is set
if (isset($_GET['version_code'])) {
    $version_code = $_GET['version_code'];

    try {
        // Prepare the SQL query with placeholders
        $sql = "SELECT * FROM version_control WHERE `version` = ?";
        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            throw new Exception('Failed to prepare SQL statement.');
        }

        // Bind parameters
        $stmt->bind_param('s', $version_code);

        // Execute the statement
        if (!$stmt->execute()) {
            throw new Exception('Failed to execute SQL statement.');
        }

        // Get the result
        $result = $stmt->get_result();
        if (!$result) {
            throw new Exception('Failed to retrieve results from the query.');
        }

        // Check if any rows are returned
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $detailslist = array(
                'version_status' => $row['status']
            );
            $response['detailslist'][] = $detailslist;
            $response['error'] = false;
            $response['message'] = "Data retrieved successfully";
            $response['expiry'] = true;
        } else {
            $response['message'] = "No matching version found";
        }

        // Close the statement
        $stmt->close();

    } catch (Exception $e) {
        $response['message'] = 'Error! Something went wrong';
    }
}

echo json_encode($response);

// Close the database connection
$conn->close();
?>
