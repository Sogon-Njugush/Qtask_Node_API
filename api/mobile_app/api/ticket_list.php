<?php
include "../db_connection.php";

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'user_id' and 'status' are set
if (isset($_GET['user_id']) && isset($_GET['status'])) {
    $user_id = $_GET['user_id'];
   $status_response = $_GET['status'];

   // Handle 'new' status as an empty string for the query and 'closed' status as 'completed'
   if ($status_response === 'new') {
       $status = '';  // Set to empty string for 'new'
   } elseif ($status_response === 'closed') {
       $status = 'completed';  // Set to 'completed' for 'closed'
   } else {
       $status = $status_response;  // Use the original status if neither 'new' nor 'closed'
   }

    try {
        // Prepare the SQL query with placeholders
        $sql = "
            SELECT
                ticket.*,
                ticket_assign.*,
                customer.*,
                `site`.*,
                sla.*,
                service_type.*,
                `priority`.*
            FROM
                ticket
            INNER JOIN
                service_type ON service_type.service_type_id = ticket.ticket_service_type_id
            INNER JOIN
                customer ON customer.customer_id = ticket.ticket_customer_id
            INNER JOIN
                sla ON sla.sla_id = ticket.ticket_sla_id
            INNER JOIN
                `site` ON `site`.site_id = ticket.ticket_site_id
            INNER JOIN
                ticket_assign ON ticket_assign.ticket_id = ticket.ticket_id
            INNER JOIN
                `priority` ON priority.priority_id = service_type.service_type_priority_id
            WHERE
                ticket_assign.ticket_user_status = ?
                AND ticket_assign.agent_id = ?
                AND ticket_assign.reassign_status = ''
            ORDER BY
                ticket.ticket_create_time
        ";

        // Using prepared statements for secure queries
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Connection Error!');
        }

        $stmt->bind_param('si', $status, $user_id);

        if (!$stmt->execute()) {
            throw new Exception('Please try again!');
        }

        $result = $stmt->get_result();
        if (!$result) {
            throw new Exception('Sorry! Connection broken!');
        }

        $response['detailslist'] = array();

        while ($row = $result->fetch_assoc()) {
        // Clean up the date strings to be in a format that DateTime can parse
            $ticket_create_time_str = preg_replace('/\s*\(.+\)$/', '', $row['ticket_create_time']);  // Removes '(East Africa Time)' part
            $ticket_actual_time_str = preg_replace('/\s*\(.+\)$/', '', $row['ticket_actual_time']);  // Removes '(East Africa Time)' part
            // Calculate elapsed time
            $ticket_create_time = new DateTime($ticket_create_time_str);
            $ticket_actual_time = new DateTime($ticket_actual_time_str);
            $interval = $ticket_actual_time->diff($ticket_create_time);

            $elapsed_time = $interval->format('%h Hrs %i Mins');
            if ($ticket_create_time > $ticket_actual_time) {
                $elapsed_time = "-$elapsed_time";
            } elseif ($ticket_create_time == $ticket_actual_time) {
                $elapsed_time = "0 Hrs 0 Min";
            }

            // Prepare details list
            $detailslist = array(
                'ticket_id' => (string)$row['ticket_id'],
                'ticket_number' => $row['ticket_no'],
                'ticket_subject' => $row['ticket_subject'],
                'ticket_description' => $row['ticket_description'],
                'ticket_create_time' => $row['ticket_create_time'],
                'site_name' => $row['site_name'],
                'site_long' => $row['site_longtitude'],
                'site_lat' => $row['site_latitude'],
                'sla_time' => $row['sla_time_hrs'] . 'hrs ' . $row['sla_time_min'] . 'min',
                'customer_name' => $row['customer_name'],
                'ticket_priority' => $row['priority_level'],
                'service_type' => $row['service_name'],
                'elapsed_time' => $elapsed_time,
                'ticketStatus' => $status_response
            );

            $response['detailslist'][] = $detailslist;
        }

        $response['error'] = false;
        $response['message'] = "sent";

        // Close statement
        $stmt->close();

    } catch (Exception $e) {
        $response['message'] = 'Something Went Wrong!';
    }
} else {
    $response['error'] = true;
    $response['message'] = "Insufficient Parameters!";
}

echo json_encode($response);

// Close the database connection
$conn->close();
?>
