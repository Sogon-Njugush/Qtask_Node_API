<?php
// Include necessary files for DB connection and token
include '../db_connection.php';
include '../includes/token.php';

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
    if (!isset($_GET['project_assign_id'])) {
        throw new Exception("Project assignment ID is missing.");
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
        throw new Exception("Failed to fetch data!");
    }

    $stmt->bind_param("s", $project_assign_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        throw new Exception("Something went wrong!");
    }

    $response = [];
    $response['detailslist'] = [];

    if ($row = $result->fetch_assoc()) {
        $segment_id = (string)$row['segment_id'];
        $date_assigned = $row['date_assigned'];
        $segment_code = $row['segment_code'];

        // Get warehouse items
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://erp.quavatel.com/api/resource/Item?fields=["name","item_code","item_name","item_group","stock_uom","is_sub_contracted_item","total_projected_qty","has_expiry_date","sample_quantity","serial_no_series","min_order_qty","total_projected_qty","sample_quantity","disabled"]&limit=2000000');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: token ' . $token
        ]);

        $response_data = curl_exec($ch);

        if ($response_data === false) {
            curl_close($ch);
            throw new Exception("cURL error: " . curl_error($ch));
        }

        curl_close($ch);

        $data = json_decode($response_data, true);

        if (isset($data['data']) && is_array($data['data'])) {
            foreach ($data['data'] as $item) {
                $detailslist = [
                    'bom_material_id' => '1x', // Placeholder value
                    'item_id' => $item['item_code'],
                    'item_name' => $item['item_name'] . '  { ' . $item['stock_uom'] . ' }'
                ];
                $response['detailslist'][] = $detailslist;
            }
            $response['segment_id'] = $segment_id;
            $response['message'] = "Request Successful!";
        } else {
            $response['error'] = true;
            $response['message'] = "No data retrieved from the API.";
        }
    } else {
        $response['error'] = true;
        $response['message'] = "No data found for the given project.";
    }

    echo json_encode($response);

} catch (Exception $e) {
    respond(false, $e->getMessage());
}
?>
