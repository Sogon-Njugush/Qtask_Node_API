<?php
if($_GET['user_id'] && $_GET['status'] && $_GET['role_id'] && $_GET['location'] && $_GET['device']){
    include '../includes/db_connection.php';
    $response=array();
    //date setup
    date_default_timezone_set('Africa/Nairobi');
    $date = date('Y-m-d H:i:s');
    $time = date('H:i:s');
    // $vehicle=$mysqli->real_escape_string($_REQUEST['vehicle']);
    $user_id=$_GET['user_id'];
    $role_id=$_GET['role_id'];
    $device=$_GET['device'];
    $location=$_GET['location'];
    $status=$_GET['status'];
    // Attempt insert query execution
    $sql = "INSERT INTO attendance(user_id,attendance_time,status,attendance_date)VALUES('$user_id','$time','$status','$date')";
    if(mysqli_query($conn,$sql)==true){
        $response['message'] = "completed";
        $response['error'] = false;
        //send message to client
    }else{
        $response['message'] = "Please Try Again";
        $response['error'] = true;
    }
}
echo json_encode($response);
?>