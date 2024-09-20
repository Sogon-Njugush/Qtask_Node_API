<?php
include "../db_connection.php";

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'ticket_id' is set
if (isset($_GET['ticket_id'])) {
    $ticket_id = $_GET['ticket_id'];

    try {
        // Prepare the SQL query with placeholders
        $sql = "SELECT
                    ticket.*,
                    service_category.*,
                    service_type.*,
                    IF(service_category.photo_required = 'true', 'true', 'false') AS photo_status
                FROM service_category
                INNER JOIN service_type ON service_type.service_type_id = service_category.service_category_type_id
                INNER JOIN ticket ON ticket.ticket_service_type_id = service_type.service_type_id
                WHERE ticket.ticket_id = ?
                ORDER BY service_category.service_category_id ASC";

        // Using prepared statements for secure queries
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Connection failed');
        }

        $stmt->bind_param('i', $ticket_id);

        if (!$stmt->execute()) {
            throw new Exception('Failed to Execute Request.');
        }

        $result = $stmt->get_result();
        if (!$result) {
            throw new Exception('Failed to retrieve results from the query.');
        }

        $response['detailslist'] = array();

        while ($row = $result->fetch_assoc()) {
            $detailslist = array();
            $detailslist['service_category_id'] = (string)$row['service_category_id'];
            $detailslist['service_category_name'] = $row['service_category_name'];
            $detailslist['service_type_id'] = (string)$row['service_category_type_id'];
            $detailslist['assigned_date'] = $row['ticket_create_time'];
            $detailslist['ticket_no'] = $row['ticket_no'];
            $detailslist['take_photo'] = $row['photo_status'];
            $response['detailslist'][] = $detailslist;
        }

        $response['error'] = false;
        $response['message'] = "Request Successful!";

        // Close statement
        $stmt->close();

    } catch (Exception $e) {
        $response['message'] = 'Something Went Wrong';
    }
} else {
    $response['error'] = true;
    $response['message'] = "Insufficient Parameters";
}

echo json_encode($response);

// Close the database connection
$conn->close();
?>
