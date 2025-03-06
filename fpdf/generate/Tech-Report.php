<?php
//date setup
date_default_timezone_set('Africa/Nairobi');

// Include database connection
include "././api/mobile_app/db_connection.php";

require "./fpdf.php";
// Get data from API URL
$technician = isset($_GET['technician']) ? $_GET['technician'] : null;
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
$company_id = isset($_GET['company_id']) ? $_GET['company_id'] : null;

// Validate the input parameters
if (!$technician || !$startDate || !$endDate || !$branch_id) {
    die('Missing required parameters: technician, startDate, endDate, or branch_id.');
}

$sql="SELECT company_name FROM company WHERE company_id= '$company_id'";
$query= mysqli_query($conn,$sql);
$row=mysqli_fetch_assoc($query);
$company_name =  $row['company_name'];

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
        $this->Cell(0, 10, 'Technicians Performance Report', 0, 1, 'C');
        //ticket information
        $this->SetFont('Times', '', 12);
        $this->Cell(0, 10, 'From '. $startDate.'  To  '. $endDate, 0, 1, 'C');
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
if($technician== strtoupper('ALL') {
    $query = "SELECT CONCAT(Users.user_firstname, ' ', Users.user_lastname) AS username, company.company_name AS company_name,
Users.user_contact AS technician_contact, Users.user_email_address AS technician_email, roles.role_name AS user_role, Users.user_id AS user_id  FROM Users
INNER JOIN company ON Users.user_company_id = company.company_id
INNER JOIN user_role ON user_role.user_id = Users.user_id
INNER JOIN roles ON role.role_id = user_role.role_id
WHERE Users.user_company_id='$company_id' AND `roles`.role_name='Technician' AND Users.user_account_status='Active' ORDER BY Users.user_firstname ASC";
}else{
    $query = "SELECT CONCAT(Users.user_firstname, ' ', Users.user_lastname) AS username, company.company_name AS company_name,
Users.user_contact AS technician_contact, Users.user_email_address AS technician_email, roles.role_name AS user_role, Users.user_id AS user_id  FROM Users
INNER JOIN company ON Users.user_company_id = company.company_id
INNER JOIN user_role ON user_role.user_id = Users.user_id
INNER JOIN roles ON role.role_id = user_role.role_id
WHERE Users.user_id='$technician'  ORDER BY Users.user_firstname ASC";
}
$result = mysqli_query($conn, $query);
while($rows = mysqli_fetch_assoc($result)) {
    $user_id = $rows['user_id'];
    $user_name = $rows['username'];
    $technician_email = $rows['technician_email'];
    $technician_contact = $rows['technician_contact'];
    $user_role = $rows['user_role'];
    // technician details
    $pdf->Ln(10);
    // Lucida bold 15 for the report title
    $pdf->SetFont('Arial', 'BU', 16);
    // Title
    $pdf->Cell(0, 10, 'Performance Report', 0, 0, 'C');
    // Line break
    $pdf->Ln(15);
    // Technician details
    $pdf->SetFillColor(240, 240, 240); // Set background color
    $pdf->SetFont('Arial', 'B', 12); // Set font
    // Card title
    $pdf->Cell(0, 10, 'Technician Details:', 0, 1, 'C', true);

    // First column (Name and Role)
    $pdf->Cell(128, 10, 'Name: ' . $user_name, 0, 0, 'L', true);
    $pdf->Cell(0, 10, 'Role: ' . $user_role, 0, 1, 'L', true);

    // Second column (Contact and Email)
    $pdf->Cell(45, 10, 'Contact: ' . $technician_contact, 0, 0, 'R', true);
    $pdf->Cell(0, 10, 'Email: ' . $technician_email, 0, 1, 'R', true);

    // Line break
    $pdf->Ln(10);

// Set font for table
    $pdf->SetFont('Helvetica', 'B', 12);
// Table header
    $pdf->Cell(48, 10, 'Service Name', 1, 0, 'C');
    $pdf->Cell(38, 10, 'Priority', 1, 0, 'C');
    $pdf->Cell(38, 10, 'SLA', 1, 0, 'C');
    $pdf->Cell(33, 10, 'No of Tickets', 1, 0, 'C');
    $pdf->Cell(35, 10, 'AVG MTTR (Hrs)', 1, 1, 'C');

// Fetch ticket information
    $sql = "SELECT service_type.service_name AS Service_name,
            priority.priority_level AS Priority,
            ticket.ticket_id AS ticket_id,
            CONCAT(sla.sla_time_hrs, 'hrs ', sla.sla_time_min, 'min') AS SLA,
            COUNT(*) AS Total_Count,
            ticket.ticket_actual_time AS Start_date,
            agent_closed_ticket.date_closed AS Close_date,
            ticket.ticket_service_type_id AS service_type_id
            FROM  ticket
            INNER JOIN ticket_assign ON ticket_assign.ticket_id = ticket.ticket_id
            INNER JOIN agent_closed_ticket ON agent_closed_ticket.ticket_id = ticket.ticket_id
            INNER JOIN sla ON sla.sla_id = ticket.ticket_sla_id
            INNER JOIN service_type ON service_type.service_type_id = ticket.ticket_service_type_id
            INNER JOIN priority ON priority.priority_id = service_type.service_type_priority_id
            WHERE  ticket_assign.agent_id = '$user_id'
            AND DATE_FORMAT(ticket.ticket_actual_time, '%Y-%m-%d') BETWEEN '$startDate' AND '$endDate'
            GROUP BY service_type.service_type_id";

    $ticketResult = $mysqli->query($sql);

    // Check if query was successful
    if(mysqli_num_rows($ticketResult)>0){
        // Fetch associative array
        while ($ticket = mysqli_fetch_assoc($ticketResult)) {
            //SLA CALCULATION
            $service_type_id = $ticket['service_type_id'];
            $slaSql = "SELECT COUNT(*) AS total_count,
                              SUM(TIMESTAMPDIFF(MINUTE,
                                  CASE
                                      WHEN ticket_actual_time LIKE '%Z' THEN
                                          STR_TO_DATE(SUBSTRING_INDEX(ticket_actual_time, '.', 1), '%Y-%m-%dT%H:%i:%s')
                                      ELSE
                                          STR_TO_DATE(ticket_actual_time, '%Y-%m-%d %h:%i:%s%p')
                                  END,
                                  CASE
                                      WHEN noc_close_time LIKE '%Z' THEN
                                          STR_TO_DATE(SUBSTRING_INDEX(noc_close_time, '.', 1), '%Y-%m-%dT%H:%i:%s')
                                      ELSE
                                          STR_TO_DATE(noc_close_time, '%Y-%m-%d %h:%i:%s%p')
                                  END
                              )) AS avg_hrs
                       FROM ticket
                       INNER JOIN noc_close_ticket ON noc_close_ticket.ticket_id = ticket.ticket_id
                       INNER JOIN ticket_assign ON ticket_assign.ticket_id = ticket.ticket_id
                       WHERE ticket_assign.agent_id = '$user_id'
                         AND ticket.ticket_status = 'closed'
                         AND ticket.ticket_service_type_id = '$service_type_id'
                         AND DATE_FORMAT(
                                 CASE
                                     WHEN ticket_actual_time LIKE '%Z' THEN
                                         STR_TO_DATE(SUBSTRING_INDEX(ticket_actual_time, '.', 1), '%Y-%m-%dT%H:%i:%s')
                                     ELSE
                                         STR_TO_DATE(ticket_actual_time, '%Y-%m-%d %h:%i:%s%p')
                                 END, '%Y-%m-%d'
                             ) BETWEEN '$startDate' AND '$endDate'";
            $slaQuery = mysqli_query($conn, $slaSql);
            $slaRow = mysqli_fetch_assoc($slaQuery);
            $total_count = $slaRow['total_count'];

            //check if the ticket was on hold
            $holdSql = "SELECT SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)) AS hold_min
                        FROM (
                            SELECT
                                CASE
                                    WHEN ticket_hold_time LIKE '%Z' THEN
                                        STR_TO_DATE(SUBSTRING_INDEX(ticket_hold_time, '.', 1), '%Y-%m-%dT%H:%i:%s')
                                    ELSE
                                        STR_TO_DATE(ticket_hold_time, '%Y-%m-%d %h:%i:%s%p')
                                END AS start_time,
                                CASE
                                    WHEN ticket_release_time LIKE '%Z' THEN
                                        STR_TO_DATE(SUBSTRING_INDEX(ticket_release_time, '.', 1), '%Y-%m-%dT%H:%i:%s')
                                    ELSE
                                        STR_TO_DATE(ticket_release_time, '%Y-%m-%d %h:%i:%s%p')
                                END AS end_time
                            FROM ticket_hold
                            INNER JOIN ticket ON ticket.ticket_id = ticket_hold.ticket_id
                            INNER JOIN ticket_assign ON ticket_assign.ticket_id = ticket.ticket_id
                            WHERE ticket_assign.agent_id = '$user_id'
                              AND ticket.ticket_status = 'closed'
                              AND ticket.ticket_service_type_id = '$service_type_id'
                              AND DATE_FORMAT(
                                  CASE
                                      WHEN ticket.ticket_actual_time LIKE '%Z' THEN
                                          STR_TO_DATE(SUBSTRING_INDEX(ticket.ticket_actual_time, '.', 1), '%Y-%m-%dT%H:%i:%s')
                                      ELSE
                                          STR_TO_DATE(ticket.ticket_actual_time, '%Y-%m-%d %h:%i:%s%p')
                                  END, '%Y-%m-%d'
                              ) BETWEEN '$startDate' AND '$endDate'
                        ) AS times";
            $holdQuery = mysqli_query($conn, $holdSql);
            $holdRow = mysqli_fetch_assoc($holdQuery);
            $total_hold = $holdRow['hold_min'];

            if ($total_hold != '') {
                $total_hold = $total_hold;
            } else {
                $total_hold = 0;
            }

            if ($total_count != 0) {
                $total_min = ($slaRow['avg_hrs'] - $total_hold) / $total_count;
                $avg_min = round($total_min / 60, 3);
            } else {
                $avg_min = 0;
            }

            // Populate table with ticket information
            $pdf->SetFont('Courier', '', 12);
            $pdf->Cell(48, 10, $ticket['Service_name'], 1, 0, 'C');
            $pdf->Cell(38, 10, $ticket['Priority'], 1, 0, 'C');
            $pdf->Cell(38, 10, $ticket['SLA'], 1, 0, 'C');
            $pdf->Cell(33, 10, $ticket['Total_Count'], 1, 0, 'C');
            $pdf->Cell(34, 10, $avg_min, 1, 1, 'C');
        }
    } else {
        $pdf->Cell(48, 10, 'N/A', 1, 0, 'C');
        $pdf->Cell(38, 10, 'N/A', 1, 0, 'C');
        $pdf->Cell(38, 10, 'N/A', 1, 0, 'C');
        $pdf->Cell(33, 10, '0', 1, 0, 'C');
        $pdf->Cell(34, 10, '0', 1, 1, 'C');
    }
// end item rows
    $pdf->Ln(7);
}
// Output PDF
if($technician=="ALL"){
    $filename = 'Technicians Performance Report.pdf';
}else {
    $filename = ucwords($user_name) . ' Performance Report.pdf';
}
// Clear cache headers
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
//force download
$pdf->Output('D', $filename); // 'D' parameter forces download
?>
