<?php
include_once '../db_connection.php';

$response = array('error' => true, 'message' => '');

try {
    // Check if all required parameters are provided
    if (isset($_GET['project_assign_id'], $_GET['location'], $_GET['comment'], $_GET['user_id'], $_GET['service_id'], $_GET['service_quantity'])) {

        // Date setup
        date_default_timezone_set('Africa/Nairobi');
        $date = date('Y-m-d H:i:s');

        // Sanitize and assign input parameters
        $key_plan_id = mysqli_real_escape_string($conn, $_GET['key_plan_id']);
        $project_assign_id = intval($_GET['project_assign_id']);
        $user_id = intval($_GET['user_id']);
        $location = mysqli_real_escape_string($conn, $_GET['location']);
        $comment = mysqli_real_escape_string($conn, $_GET['comment']);
        $title = mysqli_real_escape_string($conn, $_GET['title']);
        $job_type = mysqli_real_escape_string($conn, $_GET['job_type']);
        $quantity = intval($_GET['quantity']);
        $material_id = intval($_GET['material']);
        $service_id = intval($_GET['service_id']);
        $service_count = intval($_GET['service_quantity']);

        // Get change request count
        $change_sql = "SELECT SUM(service_change_quantity) AS total_change
                       FROM segment_service_change_request
                       INNER JOIN project_assign_user
                       ON project_assign_user.segment_id = segment_service_change_request.segment_id
                       WHERE project_assign_user.segment_assign_id = ?
                       AND segment_service_change_request.service_id = ?
                       AND segment_service_change_request.service_change_status = 'Approved'";

        $stmt = $conn->prepare($change_sql);
        if (!$stmt) {
            throw new Exception("Prepare statement failed: " . $conn->error);
        }
        $stmt->bind_param('ii', $project_assign_id, $service_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $change_row = $result->fetch_assoc();
        $total_change = !empty($change_row['total_change']) ? (int)$change_row['total_change'] : 0;
        $stmt->close();

        // Get segment service
        $sql_set = "SELECT segment_implemetation_service.*
                    FROM segment_implemetation_service
                    INNER JOIN project_assign_user
                    ON project_assign_user.segment_id = segment_implemetation_service.segment_id
                    WHERE project_assign_user.segment_assign_id = ?
                    AND segment_implemetation_service.service_type = ?";

        $stmt = $conn->prepare($sql_set);
        if (!$stmt) {
            throw new Exception("Prepare statement failed: " . $conn->error);
        }
        $stmt->bind_param('ii', $project_assign_id, $service_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row_set = $result->fetch_assoc();
        $defined_service = !empty($row_set['quantity']) ? (int)$row_set['quantity'] + $total_change : $total_change;
        $stmt->close();

        // Count service dispensed
        $sql_count = "SELECT SUM(service_quantity) AS total_used
                      FROM job_card
                      WHERE segment_id = ? AND service_id = ?";

        $stmt = $conn->prepare($sql_count);
        if (!$stmt) {
            throw new Exception("Prepare statement failed: " . $conn->error);
        }
        $stmt->bind_param('ii', $project_assign_id, $service_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row_count = $result->fetch_assoc();
        $total_used = !empty($row_count['total_used']) ? (int)$row_count['total_used'] : 0;
        $stmt->close();

        // Check if the service quantity to be used does not exceed the defined limit
        if (($total_used + $service_count) <= $defined_service) {
            // Upload image
            if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
                $target_path = "../../../upload/images/";
                $image_name = basename($_FILES['image']['name']);
                $target_path .= $image_name;

                if (!move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
                    throw new Exception("Failed to upload image.");
                }
            } else {
                throw new Exception("Image upload failed or no image provided.");
            }

            // Insert into job_card
            $sql = "INSERT INTO job_card(segment_id, location, comment, image, user_id, title, job_type, date_created, quantity, material_id, service_id, service_quantity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Prepare statement failed: " . $conn->error);
            }
            $stmt->bind_param('issssssssiii', $project_assign_id, $location, $comment, $image_name, $user_id, $title, $job_type, $date, $quantity, $material_id, $service_id, $service_count);

            if ($stmt->execute()) {
                $response['message'] = "sent";
                $response['error'] = false;
            } else {
                throw new Exception("Failed to upload data!");
            }
            $stmt->close();
        } else {
            throw new Exception("Service quantity exceeds expected value.");
        }
    } else {
        throw new Exception("Insufficient parameters provided.");
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Output the response as JSON
echo json_encode($response);
?>
