<?php
include "../includes/db_connection.php";
$response = array();
if($_GET['email'] && $_GET['password']){
    $email = $_GET['email'];
    $post_password = $_GET['password'];
    $sql="SELECT `role`.*,users.* FROM users
INNER JOIN `role` ON role.role_id=users.user_role_id
WHERE users.user_email ='$email' AND users.user_status='Active' AND role.role_name='Supervisor'";
    $query=mysqli_query($conn,$sql);
    if(mysqli_num_rows($query)>0){
        $row=mysqli_fetch_assoc($query);
        $db_password=$row['user_password'];
        $user_id=$row['user_id'];
        if(password_verify($post_password, $db_password)){
            $response['error'] = false;
            $response['username'] = $row['user_email'];
            $response['email'] = $row['user_email'];
            $response['last_name'] = $row['user_surname'];
            $response['first_name'] = $row['user_othernames'];
            $response['profile_image'] = 'null';
            $response['org_name'] = 'Quavatel';
            $response['Id_number'] = 'null';
            $response['user_id'] = $row['user_id'];
            $response['role_id'] = $row['role_id'];
            $response['phone'] = $row['user_contact'];
            $response['org_id'] = '1';
            $response['password_status'] = $row['user_password_status'];
            $response['authentication_id'] = $row['user_id'];;
            $response['attendance'] = 'null';
            $response['company_slug'] = 'quavatel';
            $response['license_number'] = 'null';
            $response['license_expiry_date'] = 'null';
            $response['message'] = "Login Successful";
        }
        }else{
            $response['error'] = true;
            $response['message'] = "Please Check Your Username and Password";
        }
    }else{
        $response['error'] = true;
        $response['message'] = "Please Check Your Username and Password";
    }
echo json_encode($response);
?>