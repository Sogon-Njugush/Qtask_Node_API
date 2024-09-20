<?php
include_once '../db_connection.php';

$response = array('error' => true, 'message' => 'Insufficient Parameters');

try {
    if (isset($_GET['ticket_id'], $_GET['location'], $_GET['comment'], $_GET['user_id'], $_GET['title'], $_GET['service_id'])) {
        // Date setup
        date_default_timezone_set('Africa/Nairobi');
        $date = date('Y-m-d H:i:s');

        // Prepare SQL query
        $stmt = $conn->prepare("INSERT INTO ticket_service (ticket_id, ticket_agent_id, ticket_action_description, activity_location, service_title, service_category_id, ticket_update_time)
                                VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('iisssis', $_GET['ticket_id'], $_GET['user_id'], $_GET['comment'], $_GET['location'], $_GET['title'], $_GET['service_id'], $date);

        if ($stmt->execute()) {
            $ticket_service_id = $stmt->insert_id;
            $response['message'] = "sent";
            $response['error'] = false;

            // Check if an image was uploaded
            if (!empty($_FILES['image']['name'])) {
                $target_path = "../../../upload/images/";
                $image_name = basename($_FILES['image']['name']);
                $target_path .= $image_name;

                if (move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
                    // Insert image into ticket_service_image
                    $stmt_img = $conn->prepare("INSERT INTO ticket_service_image (ticket_service_id, ticket_service_name, ticket_service_image, ticket_service_update_time)
                                                VALUES (?, ?, ?, ?)");
                    $empty_service_name = $_GET['title']; // Assuming service_name is optional and can be empty
                    $stmt_img->bind_param('isss', $ticket_service_id, $empty_service_name, $image_name, $date);

                    if ($stmt_img->execute()) {
                        $response['message'] = "sent";
                        $response['error'] = false;
                    } else {
                        $response['message'] = "Failed to insert image data.";
                        throw new Exception($stmt_img->error);
                    }

                    // Close the image statement
                    $stmt_img->close();
                } else {
                    $response['message'] = "Failed to move uploaded file.";
                    throw new Exception("Failed to move uploaded file.");
                }
            }
        } else {
            $response['message'] = "Failed to insert ticket service.";
            throw new Exception($stmt->error);
        }

        // Close the main statement
        $stmt->close();
    }
} catch (Exception $e) {
    error_log("Error occurred: " . $e->getMessage());
    $response['message'] = "Something went Wrong!";
    $response['error'] = true;
}

echo json_encode($response);

$conn->close();
?>
