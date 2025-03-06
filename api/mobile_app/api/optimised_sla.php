<?php
include '../db_connection.php';

// Set timezone and current date
date_default_timezone_set('Africa/Nairobi');
$current_date = new DateTime();

// Fetch tickets and SLA details
$query = "
    SELECT ticket.ticket_id, ticket.ticket_status, ticket.ticket_actual_time,
           sla.sla_time_hrs, sla.sla_time_min
    FROM ticket
    INNER JOIN sla ON sla.sla_id = ticket.ticket_sla_id
    WHERE ticket.ticket_status NOT IN ('On-hold', 'closed')
      AND YEAR(ticket.ticket_actual_time) = YEAR(CURDATE())
      AND MONTH(ticket.ticket_actual_time) = MONTH(CURDATE())
      AND DATE_ADD(ticket.ticket_actual_time,
          INTERVAL sla.sla_time_hrs HOUR + sla.sla_time_min MINUTE) >= CURDATE()
";

$result = $conn->query($query);

if ($result->num_rows > 0) {
    $update_stmt = $conn->prepare("UPDATE ticket SET ticket_state = ? WHERE ticket_id = ?");

    while ($row = $result->fetch_assoc()) {
        $ticket_id = $row['ticket_id'];
        $ticket_status = $row['ticket_status'];
        $ticket_create_time = new DateTime($row['ticket_actual_time']);
        $sla_minutes = ($row['sla_time_hrs'] * 60) + $row['sla_time_min'];

        // Calculate total hold time
        $hold_query = "
            SELECT SUM(TIMESTAMPDIFF(MINUTE, STR_TO_DATE(ticket_hold_time, '%Y-%m-%dT%H:%i:%s'),
                                                STR_TO_DATE(ticket_release_time, '%Y-%m-%dT%H:%i:%s'))) AS hold_min
            FROM ticket_hold WHERE ticket_id = ?
        ";
        $hold_stmt = $conn->prepare($hold_query);
        $hold_stmt->bind_param("i", $ticket_id);
        $hold_stmt->execute();
        $hold_result = $hold_stmt->get_result();
        $total_hold = $hold_result->fetch_assoc()['hold_min'] ?? 0;
        $hold_stmt->close();

        // Calculate time spent
        $time_spent_query = ($ticket_status === 'closed') ? "
            SELECT TIMESTAMPDIFF(MINUTE, STR_TO_DATE(ticket_actual_time, '%Y-%m-%dT%H:%i:%s'),
                                                 STR_TO_DATE(noc_close_time, '%Y-%m-%dT%H:%i:%s')) AS total_min
            FROM noc_close_ticket
            INNER JOIN ticket ON ticket.ticket_id = noc_close_ticket.ticket_id
            WHERE ticket.ticket_id = ?
        " : "
            SELECT TIMESTAMPDIFF(MINUTE, STR_TO_DATE(ticket_actual_time, '%Y-%m-%dT%H:%i:%s'), NOW()) AS total_min
            FROM ticket WHERE ticket_id = ?
        ";

        $time_stmt = $conn->prepare($time_spent_query);
        $time_stmt->bind_param("i", $ticket_id);
        $time_stmt->execute();
        $time_result = $time_stmt->get_result();
        $total_time_spent = ($time_result->fetch_assoc()['total_min'] ?? 0) - $total_hold;
        $time_stmt->close();

        // Determine SLA status
        if ($ticket_create_time > $current_date) {
            $sla_status = "waiting";
        } else {
            $sla_status = ($total_time_spent > $sla_minutes) ? "breached" : "within";
        }

        // Update ticket state
        $update_stmt->bind_param("si", $sla_status, $ticket_id);
        $update_stmt->execute();
    }

    $update_stmt->close();
}

$conn->close();
?>
