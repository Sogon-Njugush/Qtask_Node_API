<?php
include "../db_connection.php"; // Include the database connection

// Initialize response array
$response = [
    'error' => true,
    'message' => 'Insufficient Parameters',
    'detailslist' => []
];

try {
    // Check if 'user_id' is provided
    if (!isset($_GET['user_id'])) {
        throw new Exception("Insufficient Parameters: user_id is required.");
    }

    $user_id = $_GET['user_id'];

    // Prepare the SQL query to fetch accepted project assignments
    $sql = "
        SELECT
            pa.segment_assign_id,
            ps.segment_name AS opportunity,
            pa.date_assigned,
            ps.segment_code AS business_need
        FROM project_assign_user pa
        INNER JOIN project_segment ps ON ps.segment_id = pa.segment_id
        INNER JOIN project p ON p.project_id = ps.project_id
        WHERE pa.user_id = ? AND LOWER(pa.request_status) = 'accepted'
        ORDER BY pa.segment_assign_id DESC
    ";

    // Prepare the statement
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param('i', $user_id);

    // Execute the statement
    if (!$stmt->execute()) {
        throw new Exception("Failed to execute query: " . $stmt->error);
    }

    // Get the result
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $response['Success'] = 1;
        // Fetch all results and build the response
        while ($row = $result->fetch_assoc()) {
            $detailslist = [
                'project_assign_id' => (string)$row['segment_assign_id'],
                'key_plan_id' => '',
                'opportunity' => $row['opportunity'],
                'assigned_date' => $row['date_assigned'],
                'business_need' => $row['business_need'],
                'contact_person' => '',
                'phone_number' => '',
                'email' => '',
                'location' => '',
                'description' => '',
                'task_name' => '',
                'status' => 'accepted'
            ];
            array_push($response['detailslist'], $detailslist);
        }
        $response['error'] = false;
        $response['message'] = "Request Successful!";
    } else {
        $response['message'] = "No projects found for the user.";
    }

    // Close the statement
    $stmt->close();

} catch (Exception $e) {
    // Handle general exceptions
    $response['message'] = $e->getMessage();
} finally {
    // Ensure the connection is closed
    $conn->close();
}

// Output the response as JSON
echo json_encode($response);
?>
