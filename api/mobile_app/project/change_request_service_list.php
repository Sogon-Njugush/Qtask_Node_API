<?php
include "../db_connection.php";

// Helper function to respond with JSON
function respond($success, $message, $data = []) {
    echo json_encode([
        'error' => !$success,
        'message' => $message,
        'detailslist' => $data
    ]);
    exit;
}

try {
    // Check if project_assign_id is set
    if (!isset($_GET['project_assign_id'])) {
        throw new Exception("Insufficient Parameters");
    }

    $project_assign_id = $_GET['project_assign_id'];

    // Use prepared statements to prevent SQL injection
    $stmt = $conn->prepare("
        SELECT project_assign_user.*, project_segment.*
        FROM project_assign_user
        INNER JOIN project_segment ON project_segment.segment_id = project_assign_user.segment_id
        WHERE project_assign_user.segment_assign_id = ?
    ");

    if ($stmt === false) {
        throw new Exception("Failed to prepare SQL statement: " . $conn->error);
    }

    $stmt->bind_param("s", $project_assign_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        throw new Exception("Failed to execute SQL statement: " . $stmt->error);
    }

    $response = [];
    $response['detailslist'] = [];

    if ($row = $result->fetch_assoc()) {
        $segment_id = (string)$row['segment_id'];
        $date_assigned = $row['date_assigned'];
        $segment_code = $row['segment_code'];

        // Fetch active segment services
        $stmt_services = $conn->prepare("
            SELECT *
            FROM service_type
            WHERE LOWER(service_type_status) = 'active'
            ORDER BY service_type_id DESC
        ");

        if ($stmt_services === false) {
            throw new Exception("Failed to prepare SQL statement: ");
        }

        $stmt_services->execute();
        $result_services = $stmt_services->get_result();

        if (!$result_services) {
            throw new Exception("Failed to execute SQL statement: ");
        }

        while ($row_service = $result_services->fetch_assoc()) {
            $detailslist = [
                'service_name' => $row_service['service_name'],
                'segment_service_id' => (string)$row_service['service_type_id'],
                'assigned_date' => $date_assigned,
                'business_need' => $segment_code
            ];
            $response['detailslist'][] = $detailslist;
        }

        $response['segment_id'] = (string)$segment_id;
        $response['error'] = false;
        $response['message'] = "Request Successful!";
    } else {
        $response['error'] = true;
        $response['message'] = "No data found for the given project.";
    }

} catch (Exception $e) {
    respond(false, $e->getMessage());
}

echo json_encode($response);
?>
