<?php
include '../includes/db_connection.php';
//date setup
date_default_timezone_set('Africa/Nairobi');
$date = date('Y-m-d h:i:sa');
$request_code= time();
if($_GET['user_id'] && $_GET['ticket_id']) {
    $response['detailslist'] = array();
    $user_id = $_GET['user_id'];
    $ticket_id = $_GET['ticket_id'];
    $site_id = $_GET['site_id'];
    $detailslist = $_GET['detailslist'];
// Convert the JSON string to an array
    $data = json_decode($detailslist, true);
    // Insert each JSON object into the database
    foreach ($data as $item) {
        $stock_id = $item['stock_id'];
        $quantity = $item['quantity'];
        $recovery_reason = $item['recovery_reason'];

        $sql = "INSERT INTO recover_stock(recover_date,recover_quantity,recover_user_id,recover_status,recover_ticket_id,recover_stock_item_id,recover_site_id,recover_finding) VALUES 
        ('$date','$quantity','$user_id','','$ticket_id','$stock_id','$site_id','$recovery_reason')";
        if ($conn->query($sql) === TRUE) {

            $response['error'] = false;
            $response['message'] = "sent";
        } else {
            $response['error'] = true;
            $response['message'] = "Error processing the request!";
        }
    }

}else{
    $response['error'] = true;
    $response['message'] = "Error receiving request!";
}
echo json_encode($response);
mysqli_close($conn)
?>
