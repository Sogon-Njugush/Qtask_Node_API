<?php
include '../db_connection.php';

// Date setup
date_default_timezone_set('Africa/Nairobi');
$date = date('Y-m-d h:i:sa');

$response = array('error' => true, 'message' => 'Error receiving request!');

try {
    if (isset($_GET['user_id'], $_GET['ticket_id'], $_GET['site_id'], $_GET['detailslist'])) {
        $user_id = mysqli_real_escape_string($conn, $_GET['user_id']);
        $ticket_id = mysqli_real_escape_string($conn, $_GET['ticket_id']);
        $site_id = mysqli_real_escape_string($conn, $_GET['site_id']);
        $detailslist = $_GET['detailslist'];

        // Convert the JSON string to an array
        $data = json_decode($detailslist, true);

        if (json_last_error() === JSON_ERROR_NONE && !empty($data)) {
            $stmt = $conn->prepare("INSERT INTO dispensed_material (stock_id, site_id, dispensed_quantity, dispense_ticket_id, dispense_status, dispense_date, dispensed_by)
                                    VALUES (?, ?, ?, ?, '', ?, ?)");

            foreach ($data as $item) {
                $stock_id = mysqli_real_escape_string($conn, $item['stock_id']);
                $quantity = mysqli_real_escape_string($conn, $item['quantity']);

                $stmt->bind_param('iiissi', $stock_id, $site_id, $quantity, $ticket_id, $date, $user_id);

                if ($stmt->execute()) {
                    $response['error'] = false;
                    $response['message'] = "sent";
                } else {
                    throw new Exception("Error processing the request: " . $stmt->error);
                }
            }

            // Close the prepared statement
            $stmt->close();
        } else {
            throw new Exception("Invalid JSON data.");
        }
    }
} catch (Exception $e) {
    error_log("Error occurred: " . $e->getMessage());
    $response['error'] = true;
    $response['message'] = "Error processing the request!";
}

echo json_encode($response);

// Close the database connection
$conn->close();
?>
