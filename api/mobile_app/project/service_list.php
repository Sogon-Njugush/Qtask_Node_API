<?php
include "../db_connection.php"; // Include the database connection

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

try {
    // Check if 'project_assign_id' is set
    if (!isset($_GET['project_assign_id'])) {
        throw new Exception("Insufficient Parameters");
    }

    $project_assign_id = $_GET['project_assign_id'];

    // Prepare the SQL query to fetch details
    $sql = "
        SELECT
            sis.implementation_service_id,
            st.service_name,
            pau.segment_id,
            pau.date_assigned
        FROM segment_implemetation_service sis
        INNER JOIN service_type st ON st.service_type_id = sis.service_type
        INNER JOIN project_assign_user pau ON pau.segment_id = sis.segment_id
        WHERE pau.segment_assign_id = ?
        ORDER BY pau.segment_assign_id DESC
    ";

    // Prepare the statement
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param('i', $project_assign_id);

    // Execute the statement
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute query: " . $stmt->error);
    }

    // Get the result
    $result = $stmt->get_result();
    $response['detailslist'] = array();

    // Fetch results and build the response
    while ($row = $result->fetch_assoc()) {
        $detailslist = array(
            'segment_id' => (string)$row['segment_id'],
            'service_name' => $row['service_name'],
            'segment_service_id' => (string)$row['implementation_service_id'],
            'assigned_date' => $row['date_assigned'],
            'business_need' => 'need...',
        );
        $response['detailslist'][] = $detailslist;
    }

    // Check if any data is found
    if (empty($response['detailslist'])) {
        throw new Exception("No data found for the provided project.");
    }

    // Set response to success
    $response['error'] = false;
    $response['message'] = "Request Successful!";

    // Close the statement
    $stmt->close();

} catch (Exception $e) {
    // Catch general exceptions
    $response['error'] = true;
    $response['message'] = $e->getMessage();
} finally {
    // Ensure the connection is closed
    $conn->close();
}

// Output the response as JSON
echo json_encode($response);
?>
