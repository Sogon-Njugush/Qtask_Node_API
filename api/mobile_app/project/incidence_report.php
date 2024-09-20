<?php
include_once '../db_connection.php';

// Set timezone
date_default_timezone_set('Africa/Nairobi');

// Initialize response array
$response = [
    'error' => true,
    'message' => ''
];

// Check if all required parameters are provided
if (isset($_GET['project_assign_id'], $_GET['location'], $_GET['comment'], $_GET['user_id'])) {
    $project_assign_id = $_GET['project_assign_id'];
    $user_id = $_GET['user_id'];
    $location = $_GET['location'];
    $comment = $_GET['comment'];
    $date = date('Y-m-d H:i:s');

    try {
        // Retrieve segment_id from project_assign_user
        $sql_set = "SELECT segment_id FROM project_assign_user WHERE segment_assign_id = ?";
        $stmt_set = $conn->prepare($sql_set);

        if ($stmt_set === false) {
            throw new Exception("Failed to prepare SQL statement: " . $conn->error);
        }

        $stmt_set->bind_param('i', $project_assign_id);
        $stmt_set->execute();
        $result_set = $stmt_set->get_result();
        $row_set = $result_set->fetch_assoc();

        if ($row_set) {
            $segment_id = $row_set['segment_id'];

            // Handle file upload
            if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
                $target_path = "../../../upload/images/";
                $image_name = basename($_FILES['image']['name']);
                $target_path .= $image_name;

                if (move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
                    // Insert into report_incidence
                    $sql = "INSERT INTO report_incidence
                            (segment_id, incidence_message, incidence_location, incidence_image, incidence_file, incidence_supervisor_id, incidence_date)
                            VALUES (?, ?, ?, ?, '', ?, ?)";
                    $stmt = $conn->prepare($sql);

                    if ($stmt === false) {
                        throw new Exception("Failed to prepare SQL statement: " . $conn->error);
                    }

                    $stmt->bind_param('isssis', $segment_id, $comment, $location, $image_name, $user_id, $date);

                    if ($stmt->execute()) {
                        $response['message'] = "sent";
                        $response['error'] = false;
                    } else {
                        throw new Exception("Failed to insert incident report: " . $stmt->error);
                    }
                } else {
                    throw new Exception("Failed to upload image.");
                }
            } else {
                throw new Exception("No image uploaded or upload error occurred.");
            }
        } else {
            throw new Exception("Project assignment not found.");
        }
    } catch (Exception $e) {
        // Handle errors
        $response['message'] = $e->getMessage();
    }
} else {
    $response['message'] = "Insufficient parameters provided.";
}

// Output the response as JSON
echo json_encode($response);
?>
