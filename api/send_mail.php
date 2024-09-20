<?php
if ($_GET['email'] && $_GET['message'] && $_GET['title']) {
    //date setup
    date_default_timezone_set('Africa/Nairobi');
    $date = date('Y-m-d H:i:s');
    $response = array();
    $email= $_GET['email'];
    $message = $_GET['message'];
    $title = $_GET['title'];
        //send mail
        require '../mails/phpmailer/PHPMailerAutoload.php';
        require_once '../mails/credential.php';
        $mail = new PHPMailer;
        //$mail->SMTPDebug = 4;                               // Enable verbose debug output
        $mail->isSMTP();                                      // Set mailer to use SMTP
        $mail->Host = 'smtp.gmail.com';  // Specify main and backup SMTP servers
        $mail->SMTPAuth = true;                               // Enable SMTP authentication
        $mail->Username = EMAIL;                 // SMTP username
        $mail->Password = PASS;                           // SMTP password
        $mail->SMTPSecure = 'tsl';                            // Enable TLS encryption, `ssl` also accepted
        $mail->Port = 587;                                    // TCP port to connect to
        $mail->setFrom(EMAIL,'Qu-Work App');
        $mail->addAddress($email);     // Add a recipient
//        $mail->ClearReplyTos();
//        $mail->addReplyTo($company_email, $company_name);
       $mail->AddCC('support@iq-things.com');
        // print_r($_FILES['file']); exit;
//        $mail->addAttachment("files/".$file);    // Optional name
//        $mail->addAttachment('IQ-THINGS Smart Factory.pdf');    // Optional name
//        $mail->addAttachment('tech.jpeg');    // Optional name
        $mail->isHTML(true);                                  // Set email format to HTML
        $mail->Subject = $title;
//        $mail->AddEmbeddedImage('iq_logo_transparent.png', 'logo','IQ-THINGS');
        $mail->Body = $message;
//        $mail->AltBody = '';
       if($mail->send()){
        $response['message'] = "sent";
       }else{
        $response['message'] = "error sending mail";
       }        
      }
      echo json_encode($response);
?>