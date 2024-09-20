<?php
include "../db_connection.php";

// Initialize response array
$response = array('error' => true, 'message' => 'Insufficient Parameters');

// Check if 'user_id' is set
if (isset($_GET['user_id'])) {
    // Sanitize and assign the user_id
    $user_id = $_GET['user_id'];

    // Prepare the SQL query with placeholders
    $sql = "
        SELECT
            project_assign_user.*,
            project_segment.*,
            project.*
        FROM
            project_assign_user
        INNER JOIN
            project_segment ON project_segment.segment_id = project_assign_user.segment_id
        INNER JOIN
            project ON project.project_id = project_segment.project_id
        WHERE
            project_assign_user.user_id = ?
        GROUP BY
            project_segment.segment_id
        ORDER BY
            project_assign_user.segment_assign_id DESC
    ";

    try {
        // Prepare the statement
        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            throw new Exception('Failed to prepare SQL statement.');
        }

        // Bind parameters
        $stmt->bind_param('i', $user_id);

        // Execute the statement
        $stmt->execute();
        $result = $stmt->get_result();

        // Initialize the details list
        $response['detailslist'] = array();

        // Fetch the results
        while ($row = $result->fetch_assoc()) {
            // Handle status
            $status = $row['request_status'] ?: 'pending';

            // Prepare details list
            $detailslist = array(
                'project_assign_id' => (string)$row['segment_assign_id'],
                'key_plan_id' => '',
                'opportunity' => $row['segment_name'],
                'assigned_date' => $row['date_assigned'],
                'business_need' => $row['segment_code'],
                'contact_person' => '',
                'phone_number' => '',
                'email' => '',
                'location' => '',
                'description' => '',
                'task_name' => '',
                'status' => $status
            );

            $response['detailslist'][] = $detailslist;
        }

        // Close the statement
        $stmt->close();

        $response['error'] = false;
        $response['message'] = "Request Successful!";

    } catch (Exception $e) {
        $response['message'] = 'Error! Something went Wrong.';
    }
}

echo json_encode($response);

// Close the database connection
$conn->close();
?>
