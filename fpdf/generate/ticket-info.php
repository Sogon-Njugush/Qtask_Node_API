<?php
//date setup
date_default_timezone_set('Africa/Nairobi');

// Include database connection
include "././api/mobile_app/db_connection.php";

require "./fpdf.php";
// Get data from API URL
$ticket_id = isset($_GET['ticket_id']) ? $_GET['ticket_id'] : null;

// Validate the input parameters
if (!$ticket_id) {
    die('Missing required parameters: ticket_id.');
}

$sql="SELECT customer.customer_name, company.company_name,ticket.*  FROM ticket
INNER JOIN customer ON ticket.ticket_customer_id = customer.customer_id
INNER JOIN company ON company.company_id = customer.customer_company_id
WHERE ticket.ticket_id= '$ticket_id'";
$query= mysqli_query($conn,$sql);
$row=mysqli_fetch_assoc($query);
$company_name =  $row['company_name'];
$customer_name =  $row['customer_name'];

class CustomPDF extends FPDF {
    function Header() {
        global $company_name, $startDate, $endDate;

        $this->SetFillColor(230, 230, 230);
        $this->Rect(0, 0, 210, 40, 'F');
        // Add your header design here
        //company name
        $this->SetFont('Arial', 'B', 16);
        $this->Cell(0, 10, strtoupper($company_name), 0, 1, 'C');
        // Add your logo and other header elements here
        $this->SetFont('Arial', '', 6);
        $this->Image('logo.png', 5, 5, 15);
        //ticket information
        $this->SetFont('Helvetica', 'B', 12);
        $this->Cell(0, 10, 'Ticket Details Report', 0, 1, 'C');
        //ticket information
        $this->SetFont('Times', 'B', 10);
        $this->Cell(0, 10, 'Client:  '. $customer_name, 0, 1, 'C');
        $this->Ln(10);
    }
    function Footer() {
        // Set the footer position 1.5 cm from the bottom
        $this->SetY(-10);
        $this->SetFillColor(230, 230, 230); // Light gray background color

        // Set font and color for the footer
        $this->SetFont('Arial', 'I', 8);
        $this->SetTextColor(128, 128, 128);

        // Add page number
        $this->Cell(0, 10, 'Page ' . $this->PageNo(), 0, 0, 'C');

        // Add your company's name
        $this->Cell(0, 10, 'Powered by IQ-Things Ltd', 0, 0, 'R');
    }
}

// Create a new PDF instance
$pdf = new CustomPDF();
$pdf->AliasNbPages();
$pdf->AddPage();
//get users
$technician = 27;
  $query = "SELECT CONCAT(Users.user_firstname, ' ', Users.user_lastname) AS username, company.company_name AS company_name,
Users.user_contact AS technician_contact, Users.user_email_address AS technician_email, roles.role_name AS user_role, Users.user_id AS user_id  FROM Users
INNER JOIN company ON Users.user_company_id = company.company_id
INNER JOIN user_role ON user_role.user_id = Users.user_id
INNER JOIN roles ON role.role_id = user_role.role_id
WHERE Users.user_id='$technician'  ORDER BY Users.user_firstname ASC";

$result = mysqli_query($conn, $query);
while($rows = mysqli_fetch_assoc($result)) {
    $user_id = $rows['user_id'];
    $user_name = $rows['username'];
    $technician_email = $rows['technician_email'];
    $technician_contact = $rows['technician_contact'];
    $user_role = $rows['user_role'];
    // technician details
    //$pdf->Ln(10);
    // Lucida bold 15 for the report title
    $pdf->SetFont('Arial', 'BU', 16);
    // Title
    $pdf->Cell(0, 10, 'Ticket Information', 0, 0, 'C');
    // Line break
    $pdf->Ln(15);
    // Technician details
    $pdf->SetFillColor(240, 240, 240); // Set background color
    $pdf->SetFont('Arial', 'B', 12); // Set font
    // Card title
    $pdf->Cell(0, 10, 'Basic Details:', 0, 1, 'C', true);

    // First column (Name and Role)
    $pdf->Cell(128, 10, 'Ticket No:' . $user_name, 1, 0, 'L', true);
    $pdf->Cell(0, 10, 'Case No:' . $user_role, 1, 1, 'L', true);

    // Second column (Contact and Email)
    $pdf->Cell(45, 10, 'Contact: ' . $technician_contact, 1, 0, 'R', true);
    $pdf->Cell(0, 10, 'Email: ' . $technician_email, 1, 1, 'R', true);

    // Line break
    $pdf->Ln(10);


// end item rows
    $pdf->Ln(7);
}
// Output PDF

    $filename = ucwords($row['ticket_no']) . ' Performance Report.pdf';

// Clear cache headers
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
//force download
$pdf->Output('D', $filename); // 'D' parameter forces download
?>
