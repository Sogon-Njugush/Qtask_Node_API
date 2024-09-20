<?php
include "../db_connection.php";

// Initialize response array
$response = [
    'error' => true,
    'message' => '',
    'detailslist' => []
];

try {
    // Check if user_id is provided
    if (isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];

        // Combined query to fetch all counts in one go
        $query = "
            SELECT
                COUNT(*) AS assigned,
                SUM(CASE WHEN request_status = '' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN request_status = 'accepted' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN request_status = 'declined' THEN 1 ELSE 0 END) AS declined
            FROM project_assign_user
            WHERE user_id = :user_id";

        // Prepare and execute the query
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();

        // Fetch the result
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            // Populate response with the query result
            $response['detailslist'] = [
                'assigned' => $result['assigned'],
                'pending' => $result['pending'],
                'in_progress' => $result['in_progress'],
                'declined' => $result['declined']
            ];
            $response['error'] = false;
            $response['message'] = "Request Successful!";
        } else {
            $response['message'] = "No data found.";
        }
    } else {
        throw new Exception("Insufficient Parameters: user_id is required.");
    }
} catch (PDOException $e) {
    // Handle database errors
    $response['message'] = "Connection Error!";
} catch (Exception $e) {
    // Handle general errors
    $response['message'] = 'Something went wrong';
}

// Output the response as JSON
echo json_encode($response);
?>
