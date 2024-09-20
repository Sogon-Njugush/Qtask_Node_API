<?php
include "../db_connection.php";

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'ticket_id' is set
if (isset($_GET['ticket_id'])) {
    $ticket_id = $_GET['ticket_id'];

    // Prepare the SQL query with placeholders
    $sql = "SELECT
                ticket.ticket_no,
                ticket_service.service_title,
                ticket_service.ticket_update_time,
                ticket_service.ticket_action AS description,
                ticket_service.activity_location AS ticket_location,
                CONCAT(users.user_surname, ' ', users.user_othernames) AS technician_name,
                service_category.service_category_name AS service_category,
                ticket_service_image.ticket_service_image AS image
            FROM ticket_service
            INNER JOIN ticket_service_image ON ticket_service_image.ticket_service_id = ticket_service.ticket_service_id
            INNER JOIN ticket ON ticket.ticket_id = ticket_service.ticket_id
            INNER JOIN users ON users.user_id = ticket_service.ticket_agent_id
            INNER JOIN service_category ON service_category.service_category_id = ticket_service.service_category_id
            WHERE ticket.ticket_id = ?";

    // Using prepared statements for secure queries
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $ticket_id);
    $stmt->execute();
    $result = $stmt->get_result();

    // Initialize details list
    $response['detailslist'] = array();

    // Fetch results and build response
    while ($row = $result->fetch_assoc()) {
        $detailslist = array(
            'ticket_no' => $row['ticket_no'],
            'service_title' => $row['service_title'],
            'ticket_update_time' => $row['ticket_update_time'],
            'description' => $row['description'],
            'ticket_location' => $row['ticket_location'],
            'technician_name' => $row['technician_name'],
            'service_category' => $row['service_category'],
            'image' => $row['image']
        );

        $response['detailslist'][] = $detailslist;
    }

    // Close the statement
    $stmt->close();

    // Set success response
    $response['error'] = false;
    $response['message'] = "Sent";
}

// Output JSON response
echo json_encode($response);

// Close the database connection
$conn->close();
?>
