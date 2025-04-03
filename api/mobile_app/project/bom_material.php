<?php
include "../db_connection.php";

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
    if (!isset($_GET['project_assign_id']) || !isset($_GET['company_id'])) {
        throw new Exception("Project assignment ID or Company ID is missing.");
    }

    $assign_id = $_GET['project_assign_id'];
    $company_id = $_GET['company_id'];

    // Fetch company warehouse URL and token from the company table
    $company_stmt = $conn->prepare("SELECT company_warehouse_url, company_warehouse_token FROM company WHERE company_id = ?");
    if ($company_stmt === false) {
        throw new Exception("Failed to prepare SQL statement for company details: " . $conn->error);
    }

    $company_stmt->bind_param("s", $company_id);
    $company_stmt->execute();
    $company_result = $company_stmt->get_result();

    if (!$company_result || $company_result->num_rows === 0) {
        throw new Exception("Company not found or failed to fetch company details.");
    }

    $company_data = $company_result->fetch_assoc();
    $company_warehouse_url = $company_data['company_warehouse_url'];
    $company_warehouse_token = $company_data['company_warehouse_token'];

    // Use prepared statements to prevent SQL injection
    $stmt = $conn->prepare("
        SELECT segment_bom_material.*
        FROM segment_bom_material
        INNER JOIN project_assign_user ON project_assign_user.segment_id = segment_bom_material.segment_id
        WHERE project_assign_user.segment_assign_id = ?
        ORDER BY segment_bom_material.bom_material_id DESC");

    if ($stmt === false) {
        throw new Exception("Failed to prepare SQL statement: " . $conn->error);
    }

    $stmt->bind_param("s", $assign_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result) {
        throw new Exception("Failed to execute SQL statement: " . $stmt->error);
    }

    $response = [];
    $response['detailslist'] = [];

    while ($row = $result->fetch_assoc()) {
        $item_code = $row['material_id'];

        // Prepare cURL request for ERP API using dynamic URL and token
        $url = $company_warehouse_url.'api/resource/Item?fields=["name","item_code","item_name","item_group","stock_uom","is_sub_contracted_item","total_projected_qty","has_expiry_date","sample_quantity","serial_no_series","min_order_qty","total_projected_qty","sample_quantity","disabled"]&filters=[["Item","item_code","=","' . urlencode($item_code) . '"]]';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: token ' . $company_warehouse_token]);

        $curl_response = curl_exec($ch);

        if ($curl_response === false) {
            curl_close($ch);
            throw new Exception("cURL error: " . curl_error($ch));
        }

        curl_close($ch);

        $data = json_decode($curl_response, true);

        if (isset($data['data']) && is_array($data['data']) && count($data['data']) > 0) {
            $product_name = $data['data'][0]['item_name'];
        } else {
            // Handle case where data is not retrieved
            $product_name = "Unknown"; // Or any other default value
        }

        $detailslist = [
            'product_id' => $row['bom_material_id'],
            'product_name' => $product_name,
            'available_quantity' => (int)$row['material_quantity'],
            'product_unit' => 'n/a'
        ];

        $response['detailslist'][] = $detailslist;
    }

    respond(true, "Request Successful!", $response['detailslist']);

} catch (Exception $e) {
    respond(false, $e->getMessage());
}
?>
