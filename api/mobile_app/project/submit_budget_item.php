<?php
include "../db_connection.php"; // Include the database connection

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

try {
    // Check if required parameters are set
    if (!isset($_POST['segment_budget_id'], $_POST['dispensed_item_quantity'], $_POST['dispensed_item_location'],
    $_POST['user_id'], $_POST['dispensed_item_comment'])) {
        throw new Exception("Insufficient Parameters");
    }

    // Retrieve and sanitize input values
    $segment_budget_id = $_POST['segment_budget_id'];
    $dispensed_item_quantity = $_POST['dispensed_item_quantity'];
    $dispensed_item_location = $_POST['dispensed_item_location'];
    $dispensed_item_status = 'Active';
    $dispensed_item_by = $_POST['user_id'];
    $dispensed_item_comment = $_POST['dispensed_item_comment'];

    // Date setup
    date_default_timezone_set('Africa/Nairobi');
    $dispensed_item_date = date('Y-m-d H:i:s'); // 24-hour format

    // Prepare the SQL insert statement
    $sql = "
        INSERT INTO dispensed_budget_item (
            segment_budget_id,
            dispensed_item_quantity,
            dispensed_item_location,
            dispensed_item_status,
            dispensed_item_by,
            dispensed_item_date,
            dispensed_item_comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ";

    // Prepare the statement
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param("sssssss", $segment_budget_id, $dispensed_item_quantity, $dispensed_item_location, $dispensed_item_status, $dispensed_item_by, $dispensed_item_date, $dispensed_item_comment);

    // Execute the statement
    if (!$stmt->execute()) {
        throw new Exception("Failed to insert data: " . $stmt->error);
    }

    // Set response to success
    $response['error'] = false;
    $response['message'] = "sent";
    //$response['inserted_id'] = $stmt->insert_id; // Get the last inserted ID

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
