<?php
//                require_once 'iq_things/reset/PHPMailerAutoload.php';
//                require '/usr/share/php/libphp-phpmailer/class.phpmailer.php';
//                require '/usr/share/php/libphp-phpmailer/class.smtp.php';
//                require 'iq_things/reset/credential.php';
                $mail = new PHPMailer;
                // $mail->SMTPDebug = 4;                               // Enable verbose debug output
                $mail->isSMTP();                                      // Set mailer to use SMTP
                $mail->Host = 'smtp.gmail.com';  // Specify main and backup SMTP servers
                $mail->SMTPAuth = true;                               // Enable SMTP authentication
                $mail->Username = "systemsogon@gmail.com";                 // SMTP username
                $mail->Password = "0742895339jnk";                           // SMTP password
                $mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
                $mail->Port = 587;                                    // TCP port to connect to

                $mail->setFrom(EMAIL, 'Q-Task System');
                $mail->addAddress($email);     // Add a recipient

                $mail->addReplyTo(EMAIL);
                // print_r($_FILES['file']); exit;
//            $mail->addAttachment($dest);    // Optional name
                $mail->isHTML(true);                                  // Set email format to HTML
                $mail->Subject = 'PASSWORD RESET';
                $mail->Body = "Dear $username! Your Request for password reset has been Processed <br> Your new Password is <b> $password </b>
                             <br> Remember to keep your password secret and confidential. Access the site via http://192.168.88.147/iq_things/ <br> Regards System Admin. ";
                $mail->AltBody = 'Password reset request has been processed.';
                $mail->send();
?>