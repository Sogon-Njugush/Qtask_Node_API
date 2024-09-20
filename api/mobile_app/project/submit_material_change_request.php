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
    $sql = "INSERT INTO segment_material_change_request
            (segment_id, material_id, material_change_quantity, material_change_requested_by, material_change_request_date,
             material_change_status, material_change_decline_reason, material_change_approve_date, material_change_approved_by)
            VALUES (:segment_id, :material_id, :material_change_quantity, :material_change_requested_by, :material_change_request_date, '', '', '', '')";
    $stmt = $pdo->prepare($sql);

    // Insert each JSON object into the database
    foreach ($data as $item) {
        $stmt->bindParam(':segment_id', $segment_id, PDO::PARAM_INT);
        $stmt->bindParam(':material_id', $item['id'], PDO::PARAM_INT);
        $stmt->bindParam(':material_change_quantity', $item['quantity'], PDO::PARAM_INT);
        $stmt->bindParam(':material_change_requested_by', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':material_change_request_date', $date);

        if (!$stmt->execute()) {
            throw new Exception("Error processing the request for material ID: " . $item['id']);
        }
    }

    $response['error'] = false;
    $response['message'] = "Request processed successfully!";
} catch (PDOException $e) {
    $response['error'] = true;
    $response['message'] = "Something went wrong";
} catch (Exception $e) {
    $response['error'] = true;
    $response['message'] = "Connection Error!";
}

echo json_encode($response);
?>
