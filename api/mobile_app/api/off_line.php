<?php
include "../db_connection.php";

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'user_id' is set
if (isset($_GET['user_id'])) {
    $user_id = $_GET['user_id'];

    try {
        // Prepare the SQL query with placeholders
        $sql = "SELECT
                    t.ticket_id, t.ticket_no, t.ticket_subject, t.ticket_description, t.ticket_create_time,
                    s.site_name, s.site_longtitude, s.site_latitude,
                    sla.sla_time_hrs, sla.sla_time_min,
                    c.customer_name,
                    p.priority_level,
                    st.service_name,
                    ta.ticket_user_status,
                    t.ticket_actual_time
                FROM ticket t
                INNER JOIN service_type st ON st.service_type_id = t.ticket_service_type_id
                INNER JOIN customer c ON c.customer_id = t.ticket_customer_id
                INNER JOIN sla sla ON sla.sla_id = t.ticket_sla_id
                INNER JOIN site s ON s.site_id = t.ticket_site_id
                INNER JOIN ticket_assign ta ON ta.ticket_id = t.ticket_id
                INNER JOIN priority p ON p.priority_id = st.service_type_priority_id
                WHERE ta.ticket_user_status NOT IN ('closed', 'completed')
                  AND ta.agent_id = ?
                  AND ta.reassign_status = ''
                ORDER BY t.ticket_create_time DESC";

        // Using prepared statements for secure queries
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('Failed to prepare SQL statement.');
        }

        $stmt->bind_param('i', $user_id);

        if (!$stmt->execute()) {
            throw new Exception('Failed to execute SQL statement.');
        }

        $result = $stmt->get_result();
        if (!$result) {
            throw new Exception('Failed to retrieve results from the query.');
        }

        $response['detailslist'] = array();

        while ($row = $result->fetch_assoc()) {
            // Calculate elapsed time
            $ticket_create_time = new DateTime($row['ticket_create_time']);
            $ticket_actual_time = new DateTime($row['ticket_actual_time']);
            $interval = $ticket_actual_time->diff($ticket_create_time);

            $hours = $interval->h;
            $minutes = $interval->i;

            $elapsed_time = ($ticket_create_time > $ticket_actual_time)
                            ? "-$hours Hrs $minutes Mins"
                            : ($ticket_create_time < $ticket_actual_time)
                              ? "$hours Hrs $minutes Mins"
                              : "0 Hrs 0 Min";

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
                'ticketStatus' => $row['ticket_user_status']
            );

            $response['detailslist'][] = $detailslist;
        }

        // Combine counts of breaches and within SLA
        $query_count = "SELECT
                            SUM(CASE WHEN t.ticket_state = 'breached' THEN 1 ELSE 0 END) AS outside_sla,
                            SUM(CASE WHEN t.ticket_state = 'within' THEN 1 ELSE 0 END) AS inside_sla
                        FROM ticket t
                        INNER JOIN ticket_assign ta ON ta.ticket_id = t.ticket_id
                        WHERE ta.agent_id = ? AND ta.reassign_status = ''";

        $stmt_count = $conn->prepare($query_count);
        if (!$stmt_count) {
            throw new Exception('Failed to prepare SQL statement for count query.');
        }

        $stmt_count->bind_param('i', $user_id);

        if (!$stmt_count->execute()) {
            throw new Exception('Failed to execute SQL statement for count query.');
        }

        $result_count = $stmt_count->get_result();
        if (!$result_count) {
            throw new Exception('Failed to retrieve results from the count query.');
        }

        $row_count = $result_count->fetch_assoc();

        $response['outside_sla'] = $row_count['outside_sla'];
        $response['inside_sla'] = $row_count['inside_sla'];

        // Close statements
        $stmt->close();
        $stmt_count->close();

        $response['error'] = false;
        $response['message'] = "sent";
    } catch (Exception $e) {
        $response['message'] = 'Connection Error!';
    }
}

echo json_encode($response);

// Close the database connection
$conn->close();
?>
