<?php
include_once '../db_connection.php';

// Set timezone
date_default_timezone_set('Africa/Nairobi');

// Initialize response array
$response = [
    'error' => true,
    'message' => ''
];

try {
    // Check if all required parameters are provided
    if (isset($_GET['project_assign_id'], $_GET['user_id'], $_GET['comment'], $_GET['location'])) {
        $project_assign_id = $_GET['project_assign_id'];
        $user_id = $_GET['user_id'];
        $location = $_GET['location'];
        $comment = $_GET['comment'];
        $date = date('Y-m-d H:i:s');

        // Handle file upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] == UPLOAD_ERR_OK) {
            $target_path = "../../../upload/images/";
            $image_name = basename($_FILES['image']['name']);
            $target_path .= $image_name;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
                // Insert data into project_change_request
                $sql = "INSERT INTO project_change_request
                        (project_assign_id, user_id, location, comment, image, request_status, date_created, decline_reason)
                        VALUES
                        (:project_assign_id, :user_id, :location, :comment, :image_name, '', :date_created, '')";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':project_assign_id', $project_assign_id, PDO::PARAM_INT);
                $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $stmt->bindParam(':location', $location, PDO::PARAM_STR);
                $stmt->bindParam(':comment', $comment, PDO::PARAM_STR);
                $stmt->bindParam(':image_name', $image_name, PDO::PARAM_STR);
                $stmt->bindParam(':date_created', $date, PDO::PARAM_STR);

                if ($stmt->execute()) {
                    $response['message'] = "Request sent successfully.";
                    $response['error'] = false;
                } else {
                    throw new Exception("Failed to insert change request.");
                }
            } else {
                throw new Exception("Failed to upload image.");
            }
        } else {
            throw new Exception("No image uploaded or an upload error occurred.");
        }
    } else {
        throw new Exception("Insufficient parameters provided.");
    }
} catch (PDOException $e) {
    // Handle database errors
    $response['message'] = "Connection Error!";
} catch (Exception $e) {
    // Handle general errors
    $response['message'] = 'Something went wrong!';
}

// Output the response as JSON
echo json_encode($response);
?>
