<?php
include "../db_connection.php";

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'user_id' is set
if (isset($_GET['user_id'])) {
    $user_id = $_GET['user_id'];

    try {
        // Prepare main query to fetch projects and their segment counts
        $sql = "
            SELECT
                p.project_id,
                p.project_name,
                p.project_code,
                pa.request_status,
                COUNT(DISTINCT ps.segment_id) AS segment_count
            FROM project_assign_user pa
            INNER JOIN project_segment ps ON ps.segment_id = pa.segment_id
            INNER JOIN project p ON p.project_id = ps.project_id
            WHERE pa.user_id = ?
            GROUP BY p.project_id
        ";

        // Prepare and execute statement for main query
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);

        if (!$stmt->execute()) {
            throw new Exception('Failed to execute request!');
        }

        // Fetch results
        $result = $stmt->get_result();
        $response['detailslist'] = array();

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $status = ($row['request_status'] == '') ? 'pending' : $row['request_status'];
                $project_id = $row['project_id'];

                // Prepare details list for each project
                $detailslist = array(
                    'project_name' => ucwords($row['project_name']),
                    'project_code' => ucwords($row['project_code']),
                    'segment_count' => $row['segment_count'],
                    'status' => $status,
                    'segments' => array() // Initialize segments array
                );

                // Fetch segments for each project
                $sql_seg = "
                    SELECT
                        pa.segment_assign_id,
                        ps.segment_name AS opportunity,
                        pa.date_assigned,
                        ps.segment_code AS business_need,
                        ps.start_point,
                        ps.end_point,
                        ps.est_distance
                    FROM project_assign_user pa
                    INNER JOIN project_segment ps ON ps.segment_id = pa.segment_id
                    WHERE pa.user_id = ? AND ps.project_id = ?
                    ORDER BY pa.segment_assign_id DESC
                ";

                // Prepare and execute statement for segments
                $stmt_seg = $conn->prepare($sql_seg);
                $stmt_seg->bind_param('ii', $user_id, $project_id);

                if (!$stmt_seg->execute()) {
                    throw new Exception('Failed to execute request!');
                }

                // Fetch segment details
                $result_seg = $stmt_seg->get_result();
                while ($row_seg = $result_seg->fetch_assoc()) {
                    $segment = array(
                        'project_assign_id' => (string)$row_seg['project_assign_id'],
                        'key_plan_id' => '',
                        'opportunity' => $row_seg['opportunity'],
                        'assigned_date' => $row_seg['date_assigned'],
                        'business_need' => $row_seg['business_need'],
                        'start_point' => $row_seg['start_point'],
                        'end_point' => $row_seg['end_point'],
                        'est_distance' => $row_seg['est_distance'],
                    );
                    // Push segment details into segments array
                    $detailslist['segments'][] = $segment;
                }
                $stmt_seg->close();  // Close segment statement

                // Add project details to response
                $response['detailslist'][] = $detailslist;
            }

            $response['error'] = false;
            $response['message'] = "Request Successful!";
        } else {
            $response['message'] = "No projects found for you!";
        }

        $stmt->close(); // Close main statement
    } catch (Exception $e) {
        error_log("Error: " . $e->getMessage());
        $response['message'] = "Something went wrong!";
    } finally {
        // Ensure the connection is closed
        $conn->close();
    }
}

echo json_encode($response);
?>
