<?php
include '../db_connection.php';

// Set timezone and date
date_default_timezone_set('Africa/Nairobi');
$date = date('Y-m-d h:i:sa');

$response = array();

try {
    if (!isset($_GET['segment_id']) || !isset($_GET['user_id']) || !isset($_GET['detailslist'])) {
        throw new Exception("Missing required parameters.");
    }

    $segment_id = $_GET['segment_id'];
    $user_id = $_GET['user_id'];
    $detailslist = $_GET['detailslist'];

    // Convert the JSON string to an array
    $data = json_decode($detailslist, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format.");
    }

    // Prepare the SQL statement for insertion
    $sql = "INSERT INTO segment_service_change_request
            (segment_id, service_id, service_change_quantity, service_change_requested_by, service_change_request_date,
             service_change_status, service_change_decline_reason, service_change_approve_date, service_change_approved_by)
            VALUES (?, ?, ?, ?, ?, '', '', '', '')";
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        throw new Exception("Failed to prepare SQL statement: " . $conn->error);
    }

    // Insert each JSON object into the database
    foreach ($data as $item) {
        $stmt->bind_param("iiiss", $segment_id, $item['id'], $item['quantity'], $user_id, $date);

        if (!$stmt->execute()) {
            throw new Exception("Error processing the request for service ID: " . $item['id'] . " - " . $stmt->error);
        }
    }

    $response['error'] = false;
    $response['message'] = "sent";
} catch (Exception $e) {
    $response['error'] = true;
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>
