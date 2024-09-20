<?php
// Include the database connection
include_once '../db_connection.php';

// Set default timezone
date_default_timezone_set('Africa/Nairobi');

$response = array('error' => true, 'message' => '');

// Check if required GET parameters are set
if ($_GET['project_assign_id'], $_GET['user_id'] $_GET['service_id'], $_GET['service_quantity'])) {

    // Retrieve and sanitize input parameters
    $key_plan_id = mysqli_real_escape_string($conn, $_GET['key_plan_id']);
    $project_assign_id = mysqli_real_escape_string($conn, $_GET['project_assign_id']);
    $user_id = mysqli_real_escape_string($conn, $_GET['user_id']);
    $location = mysqli_real_escape_string($conn, $_GET['location']);
    $comment = mysqli_real_escape_string($conn, $_GET['comment']);
    $title = mysqli_real_escape_string($conn, $_GET['title']);
    $job_type = mysqli_real_escape_string($conn, $_GET['job_type']);
    $service_id = mysqli_real_escape_string($conn, $_GET['service_id']);
    $service_count = mysqli_real_escape_string($conn, $_GET['service_quantity']);
    $detailslist = $_GET['detailslist'];

    // Convert JSON string to an array and check for decoding errors
    $data = json_decode($detailslist, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $response['message'] = "Invalid JSON format.";
        echo json_encode($response);
        exit;
    }

    // Begin transaction
    $conn->begin_transaction();

    try {
        foreach ($data as $item) {
            $material_id = mysqli_real_escape_string($conn, $item['product_id']);
            $quantity = mysqli_real_escape_string($conn, $item['quantity']);

            // Get change request count for material
            $change_sql = "SELECT SUM(material_change_quantity) AS total_change, project_assign_user.segment_id
                           FROM segment_material_change_request
                           INNER JOIN project_assign_user ON project_assign_user.segment_id = segment_material_change_request.segment_id
                           WHERE project_assign_user.segment_assign_id = ?
                             AND segment_material_change_request.material_id = ?
                             AND LOWER(segment_material_change_request.material_change_status) = 'approved'";
            $stmt = $conn->prepare($change_sql);
            if (!$stmt) {
                throw new Exception("Failed to prepare change request SQL!");
            }
            $stmt->bind_param('ii', $project_assign_id, $material_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $total_mat_change = $row['total_change'] ?? 0;
            $segment_id = $row['segment_id'] ?? null;
            $stmt->close();

            // Ensure $segment_id is valid
            if (!$segment_id) {
                throw new Exception("Segment ID not found for project assignment!");
            }

            // Get segment material
            $sql_setmat = "SELECT segment_bom_material.material_quantity
                           FROM segment_bom_material
                           INNER JOIN project_assign_user ON project_assign_user.segment_id = segment_bom_material.segment_id
                           WHERE project_assign_user.segment_assign_id = ?
                             AND segment_bom_material.material_id = ?";
            $stmt = $conn->prepare($sql_setmat);
            if (!$stmt) {
                throw new Exception("Failed to prepare segment material!" . $conn->error);
            }
            $stmt->bind_param('ii', $project_assign_id, $material_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $defined_material = $result->fetch_assoc()['material_quantity'] ?? 0;
            $stmt->close();

            $defined_material += $total_mat_change;

            // Get material used
            $used_materials = 0;
            if ($material_id !== 'null') {
                $sql_countm = "SELECT SUM(material_quantity) AS material_used
                               FROM project_material_dispense
                               WHERE segment_id = ?
                                 AND material_id = ?";
                $stmt = $conn->prepare($sql_countm);
                if (!$stmt) {
                    throw new Exception("Failed to prepare material used!");
                }
                $stmt->bind_param('ii', $segment_id, $material_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $used_materials = $result->fetch_assoc()['material_used'] ?? 0;
                $stmt->close();
            }

            // Check quantities and perform insert
            if (($used_materials + $quantity) <= $defined_material) {
                // Insert record
                $sql = "INSERT INTO project_material_dispense (material_id, material_quantity, segment_id, service_id)
                        VALUES (?, ?, ?, ?)";
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    throw new Exception("Failed to send data!");
                }
                $stmt->bind_param('ssss', $material_id, $quantity, $segment_id, $service_id);
                if ($stmt->execute()) {
                    $response['message'] = "sent";
                    $response['error'] = false;
                } else {
                    throw new Exception("Failed to insert record!" . $stmt->error);
                }
                $stmt->close();
            } else {
                throw new Exception("Quantity exceeds defined limits for material ID!");
            }
        }

        $conn->commit();

    } catch (Exception $e) {
        $conn->rollback();
        $response['message'] = $e->getMessage();
        $response['error'] = true;
    }

} else {
    $response['message'] = "Insufficient parameters provided!";
    $response['error'] = true;
}

echo json_encode($response);
?>
