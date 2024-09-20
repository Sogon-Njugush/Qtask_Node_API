<?php
$response = array('message' => 'failed', 'error' => true);

try {
    if (isset($_GET['ticket_id'], $_GET['user_id'], $_GET['location'])) {
        include '../db_connection.php';

        // Date setup
        date_default_timezone_set('Africa/Nairobi');
        $date = date('Y-m-d H:i:s a');

        // Sanitize input to prevent SQL injection
        $user_id = mysqli_real_escape_string($conn, $_GET['user_id']);
        $ticket_id = mysqli_real_escape_string($conn, $_GET['ticket_id']);
        $location = mysqli_real_escape_string($conn, $_GET['location']);

        // Prepare and execute the first update query
        $stmt1 = $conn->prepare("UPDATE ticket_assign SET ticket_user_status='completed' WHERE ticket_id=?");
        $stmt1->bind_param('i', $ticket_id);
        $stmt1->execute();

        // Prepare and execute the second update query
        $stmt2 = $conn->prepare("UPDATE ticket SET ticket_status='monitoring' WHERE ticket_id=?");
        $stmt2->bind_param('i', $ticket_id);
        $stmt2->execute();

        // Check if an image was uploaded
        if (!empty($_FILES['image']['name'])) {
            $target_path = "../../../upload/images/";
            $image_name = basename($_FILES['image']['name']);
            $target_path .= $image_name;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
                // Insert data into agent_closed_ticket
                $stmt3 = $conn->prepare("INSERT INTO agent_closed_ticket (ticket_id, closed_by, close_status, close_location, close_sign, date_closed)
                                         VALUES (?, ?, 'completed', ?, ?, ?)");
                $stmt3->bind_param('iisss', $ticket_id, $user_id, $location, $image_name, $date);

                if ($stmt3->execute()) {
                    $response['message'] = "sent";
                    $response['error'] = false;
                } else {
                    throw new Exception("Failed to close the ticket!");
                }

                // Close the third statement
                $stmt3->close();
            } else {
                throw new Exception("Failed to move uploaded file.");
            }
        } else {
            throw new Exception("No image was uploaded.");
        }

        // Close the first two statements
        $stmt1->close();
        $stmt2->close();
    } else {
        throw new Exception("Required parameters are missing!");
    }
} catch (Exception $e) {
    error_log("Error occurred: " . $e->getMessage());
    $response['message'] = "An error occurred while processing your request.";
    $response['error'] = true;
}

echo json_encode($response);

$conn->close();
?>
