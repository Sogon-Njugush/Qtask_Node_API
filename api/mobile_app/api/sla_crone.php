<?php
include '../db_connection.php';

// Date setup
date_default_timezone_set('Africa/Nairobi');
$current_date = new DateTime();

// Fetch ticket and SLA details
$query = "
SELECT
    t.ticket_id,
    t.ticket_status,
    t.ticket_actual_time,
    s.sla_time_hrs,
    s.sla_time_min,
    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, th.ticket_hold_time, th.ticket_release_time)), 0) AS total_hold
FROM
    ticket t
JOIN
    sla s ON t.ticket_sla_id = s.sla_id
LEFT JOIN
    ticket_hold th ON t.ticket_id = th.ticket_id
WHERE
    t.ticket_status NOT IN ('On-hold', 'closed')
    AND YEAR(t.ticket_actual_time) = YEAR(CURDATE())
    AND MONTH(t.ticket_actual_time) = MONTH(CURDATE())
GROUP BY
    t.ticket_id";

$result = mysqli_query($conn, $query);

while ($row = mysqli_fetch_assoc($result)) {
    $ticket_id = $row['ticket_id'];
    $ticket_status = $row['ticket_status'];
    $ticket_create_time = new DateTime($row['ticket_actual_time']);
    $total_sla_minutes = ($row['sla_time_hrs'] * 60) + $row['sla_time_min'];
    $total_hold_minutes = $row['total_hold'];

    // Calculate spent time
    if ($ticket_status === 'closed') {
        $close_query = "
        SELECT TIMESTAMPDIFF(MINUTE, t.ticket_actual_time, n.noc_close_time) AS total_time_spent
        FROM
            ticket t
        JOIN
            noc_close_ticket n ON t.ticket_id = n.ticket_id
        WHERE
            t.ticket_id = '$ticket_id'";
        $close_result = mysqli_query($conn, $close_query);
        $close_data = mysqli_fetch_assoc($close_result);
        $total_time_spent = $close_data['total_time_spent'] - $total_hold_minutes;
    } else {
        $total_time_spent = $ticket_create_time->diff($current_date)->i + ($ticket_create_time->diff($current_date)->h * 60) - $total_hold_minutes;
    }

    // Determine SLA status
    $sla_status = "waiting";
    if ($current_date >= $ticket_create_time) {
        $sla_status = ($total_time_spent > $total_sla_minutes) ? "breached" : "within";
    }

    // Update ticket SLA status
    $update_query = "UPDATE ticket SET ticket_state = '$sla_status' WHERE ticket_id = '$ticket_id'";
    mysqli_query($conn, $update_query);
}

$conn->close();
?>
