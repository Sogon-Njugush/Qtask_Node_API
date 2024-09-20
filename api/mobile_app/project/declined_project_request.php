<?php
include "../db_connection.php";

// Initialize response array
$response = [
    'error' => true,
    'message' => '',
    'detailslist' => []
];

try {
    // Check if user_id is set
    if (isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];

        // Prepare SQL query with placeholders for safety
        $sql = "SELECT
                    pa.segment_assign_id,
                    ps.segment_name AS opportunity,
                    pa.date_assigned,
                    pa.request_status
                FROM project_assign_user pa
                INNER JOIN project_segment ps ON ps.segment_id = pa.segment_id
                INNER JOIN project p ON p.project_id = ps.project_id
                WHERE pa.user_id = :user_id
                AND pa.request_status = 'declined'
                ORDER BY pa.segment_assign_id DESC";

        // Prepare the statement
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);

        // Execute the statement
        $stmt->execute();

        // Fetch all results
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($results) {
            $response['Success'] = 1;
            $response['detailslist'] = $results;
            $response['error'] = false;
            $response['message'] = "Request Successful!";
        } else {
            $response['message'] = "No declined projects found for the user.";
        }
    } else {
        throw new Exception("Insufficient Parameters: user_id is required.");
    }
} catch (PDOException $e) {
    // Catch database-related errors
    $response['message'] = "Database error: " . $e->getMessage();
} catch (Exception $e) {
    // Catch general errors
    $response['message'] = $e->getMessage();
}

// Return the response as JSON
echo json_encode($response);
?>
