<?php
include "../db_connection.php"; // Include the database connection

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

try {
    // Check if 'project_assign_id' is set
    if (!isset($_GET['segment_id'])) {
        throw new Exception("Insufficient Parameters");
    }

    $segment_id = $_GET['segment_id'];

    // Prepare the SQL query to fetch details
    $sql = "
        SELECT
            sb.segment_budget_id,
            bi.budget_item_name,
            sb.segment_id
        FROM segment_budget sb
        INNER JOIN budget_item bi ON bi.budget_item_id = sb.budget_item_id
        WHERE sb.segment_id = ? AND sb.budget_item_type='Labour' AND sb.budget_item_status='Active'
        ORDER BY sb.segment_budget_id DESC
    ";

    // Prepare the statement
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param('i', $segment_id);

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
            'budget_item_name' => $row['budget_item_name'],
            'segment_budget_id' => (string)$row['segment_budget_id'],
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
