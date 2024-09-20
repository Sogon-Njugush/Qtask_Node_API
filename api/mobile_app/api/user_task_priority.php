<?php
include "../db_connection.php";

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'user_id' and 'priority' are set
if (isset($_GET['user_id']) && isset($_GET['priority'])) {
    $user_id = $_GET['user_id'];
    $priority = $_GET['priority'];

    try {
        // Prepare the SQL query with placeholders
        $sql = "
            SELECT ticket.*, ticket_assign.*, customer.*, site.*, sla.*, service_type.*, priority.*
            FROM ticket
            INNER JOIN service_type ON service_type.service_type_id = ticket.ticket_service_type_id
            INNER JOIN customer ON customer.customer_id = ticket.ticket_customer_id
            INNER JOIN sla ON sla.sla_id = ticket.ticket_sla_id
            INNER JOIN site ON site.site_id = ticket.ticket_site_id
            INNER JOIN ticket_assign ON ticket_assign.ticket_id = ticket.ticket_id
            INNER JOIN priority ON priority.priority_id = service_type.service_type_priority_id
            WHERE priority.priority_level = ? AND ticket_assign.agent_id = ? AND ticket_assign.reassign_status = ''
            ORDER BY ticket.ticket_create_time DESC
        ";

        // Prepare the statement
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Failed to prepare the SQL statement.');
        }

        // Bind parameters
        $stmt->bind_param('si', $priority, $user_id);

        // Execute the statement
        if (!$stmt->execute()) {
            throw new Exception('SQL execution error. Please try again.');
        }

        // Get the result
        $result = $stmt->get_result();
        if (!$result) {
            throw new Exception('Error fetching data from the database.');
        }

        // Initialize the details list
        $response['detailslist'] = array();

        // Fetch results
        while ($row = $result->fetch_assoc()) {
            // Clean up the date strings to be in a format that DateTime can parse
            $ticket_create_time_str = preg_replace('/\s*\(.+\)$/', '', $row['ticket_create_time']);  // Removes '(East Africa Time)' part
            $ticket_actual_time_str = preg_replace('/\s*\(.+\)$/', '', $row['ticket_actual_time']);  // Removes '(East Africa Time)' part

            // Create DateTime objects
            $ticket_create_time = new DateTime($ticket_create_time_str);
            $ticket_actual_time = new DateTime($ticket_actual_time_str);

            // Calculate elapsed time
            $interval = $ticket_actual_time->diff($ticket_create_time);
            $elapsed_time = $interval->format('%h Hrs %i Mins');

            if ($ticket_create_time > $ticket_actual_time) {
                $elapsed_time = "-$elapsed_time";
            } else {
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
                'sla_time' => (!is_null($row['sla_time_hrs']) && !is_null($row['sla_time_min'])) ? ($row['sla_time_hrs'] . 'hrs ' . $row['sla_time_min'] . 'min') : 'N/A',
                'customer_name' => $row['customer_name'],
                'service_type' => $row['service_name'],
                'ticketStatus' => !empty($row['ticket_user_status']) ? $row['ticket_user_status'] : 'new', // Default to 'new' if status is empty
                'elapsed_time' => $elapsed_time
            );

            // Add to the response details list
            $response['detailslist'][] = $detailslist;
        }

        // Set response to success
        $response['error'] = false;
        $response['message'] = "sent";

        // Close statement
        $stmt->close();

    } catch (Exception $e) {
        error_log("Error: " . $e->getMessage());
        $response['message'] = "Error something went wrong!";
    } finally {
        // Ensure the connection is closed
        $conn->close();
    }
}

echo json_encode($response);
?>
