<?php
if (isset($_GET['project_assign_id'], $_GET['location'], $_GET['comment'], $_GET['user_id']) && isset($_FILES['image'])) {
    include_once '../db_connection.php';

    // Date setup
    date_default_timezone_set('Africa/Nairobi');
    $date = date('Y-m-d H:i:s');

    $response = array();
    $project_assign_id = $_GET['project_assign_id'];
    $user_id = $_GET['user_id'];
    $location = $_GET['location'];
    $comment = $_GET['comment'];

    try {
        // Get segment service
        $sql_set = "SELECT segment_id FROM project_assign_user WHERE segment_assign_id = '$project_assign_id'";
        $result = mysqli_query($conn, $sql_set);

        if ($result === false) {
            throw new Exception("Failed to execute SQL statement: " . mysqli_error($conn));
        }

        $row_set = mysqli_fetch_assoc($result);

        if ($row_set) {
            $segment_id = $row_set['segment_id'];

            // Upload image
            $target_path1 = "../../../upload/images/";
            $image_name = basename($_FILES['image']['name']);
            $target_path1 .= $image_name;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $target_path1)) {
                // Insert record into segment_file_upload
                $sql = "INSERT INTO segment_file_upload (segment_id, file_description, upload_location, upload_file_name, upload_supervisor_id, file_upload_date)
                        VALUES ('$segment_id', '$comment', '$location', '$image_name', '$user_id', '$date')";

                $insert_result = mysqli_query($conn, $sql);

                if ($insert_result) {
                    $response['message'] = "sent";
                    $response['error'] = false;
                } else {
                    throw new Exception("Failed to insert data: " . mysqli_error($conn));
                }
            } else {
                throw new Exception("Failed to upload image.");
            }
        } else {
            throw new Exception("Invalid project_assign_id.");
        }
    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
        $response['error'] = true;
    }
} else {
    $response['error'] = true;
    $response['message'] = "Insufficient Parameters or File Not Uploaded.";
}

echo json_encode($response);
?>
