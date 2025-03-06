<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

date_default_timezone_set('Africa/Nairobi');
include "../../../api/mobile_app/db_connection.php";
require "../fpdf.php";

// Get data from API URL
$technician = isset($_GET['technician']) ? $_GET['technician'] : null;
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
$company_id = isset($_GET['company_id']) ? $_GET['company_id'] : null;

if (!$technician || !$startDate || !$endDate || !$company_id) {
    die('Missing required parameters: technician, startDate, endDate, or branch_id.');
}

$sql = "SELECT company_name FROM company WHERE company_id= '$company_id'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$company_name = $row['company_name'];

class CustomPDF extends FPDF {
    function Header() {
        global $company_name, $startDate, $endDate;

        $this->SetFillColor(230, 230, 230);
        $this->Rect(0, 0, 297, 40, 'F'); // Adjusted for landscape
        $this->SetFont('Arial', 'B', 16);
        $this->Cell(0, 10, strtoupper($company_name), 0, 1, 'C');
        $this->SetFont('Arial', '', 6);
        $this->Image('logo.png', 5, 5, 15);
        $this->SetFont('Helvetica', 'B', 12);
        $this->Cell(0, 10, 'Technicians Performance Report', 0, 1, 'C');
        $this->SetFont('Times', '', 12);
        $this->Cell(0, 10, 'From ' . $startDate . ' To ' . $endDate, 0, 1, 'C');
        $this->Ln(10);
    }

    function Footer() {
        $this->SetY(-10);
        $this->SetFillColor(230, 230, 230);
        $this->SetFont('Arial', 'I', 8);
        $this->SetTextColor(128, 128, 128);
        $this->Cell(0, 10, 'Page ' . $this->PageNo(), 0, 0, 'C');
        $this->Cell(0, 10, 'Powered by IQ-Things Ltd', 0, 0, 'R');
    }
}

// Create a new PDF instance in landscape mode
$pdf = new CustomPDF('L');
$pdf->AliasNbPages();
$pdf->AddPage();

// Fetch data from the Excel sheets (assuming you have parsed the Excel data into arrays)
$excelData = [
    ['Region' => 'Bungoma', 'Violated SJA' => 0, 'Completed SJA' => 0, 'Equipment failure/Beyond scope/Aid/restored' => 3, 'Total Faults' => 3, 'TOTAL FAULTS' => 49, 'SLA Adherence %' => 100],
    ['Region' => 'Eldoret', 'Violated SJA' => 1, 'Completed SJA' => 4, 'Equipment failure/Beyond scope/Aid/restored' => 1, 'Total Faults' => 6, 'TOTAL FAULTS' => '', 'SLA Adherence %' => 80],
    ['Region' => 'Kakamega', 'Violated SJA' => 3, 'Completed SJA' => 5, 'Equipment failure/Beyond scope/Aid/restored' => 2, 'Total Faults' => 10, 'TOTAL FAULTS' => '', 'SLA Adherence %' => 42],
    ['Region' => 'Kerlobo', 'Violated SJA' => 0, 'Completed SJA' => 1, 'Equipment failure/Beyond scope/Aid/restored' => 1, 'Total Faults' => 2, 'TOTAL FAULTS' => '', 'SLA Adherence %' => 100],
    ['Region' => 'Kisili', 'Violated SJA' => 2, 'Completed SJA' => 3, 'Equipment failure/Beyond scope/Aid/restored' => 1, 'Total Faults' => 6, 'TOTAL FAULTS' => '', 'SLA Adherence %' => 60],
    ['Region' => 'Kisumu', 'Violated SJA' => 0, 'Completed SJA' => 9, 'Equipment failure/Beyond scope/Aid/restored' => 3, 'Total Faults' => 12, 'TOTAL FAULTS' => '', 'SLA Adherence %' => 100],
    ['Region' => 'Nakuru', 'Violated SJA' => 2, 'Completed SJA' => 3, 'Equipment failure/Beyond scope/Aid/restored' => 0, 'Total Faults' => 5, 'TOTAL FAULTS' => '', 'SLA Adherence %' => 60],
    ['Region' => 'Mau Summit', 'Violated SJA' => 0, 'Completed SJA' => 0, 'Equipment failure/Beyond scope/Aid/restored' => 0, 'Total Faults' => 0, 'TOTAL FAULTS' => '', 'SLA Adherence %' => 100],
];

// Set font for table
$pdf->SetFont('Helvetica', 'B', 12);

// Table header
$pdf->Cell(30, 10, 'Region', 1, 0, 'C');
$pdf->Cell(30, 10, 'Violated SJA', 1, 0, 'C');
$pdf->Cell(30, 10, 'Completed SJA', 1, 0, 'C');
$pdf->Cell(50, 10, 'Equipment failure/Beyond scope/Aid/restored', 1, 0, 'C');
$pdf->Cell(30, 10, 'Total Faults', 1, 0, 'C');
$pdf->Cell(30, 10, 'TOTAL FAULTS', 1, 0, 'C');
$pdf->Cell(30, 10, 'SLA Adherence %', 1, 1, 'C');

// Populate table with data from Excel
$pdf->SetFont('Courier', '', 12);
foreach ($excelData as $row) {
    $pdf->Cell(30, 10, $row['Region'], 1, 0, 'C');
    $pdf->Cell(30, 10, $row['Violated SJA'], 1, 0, 'C');
    $pdf->Cell(30, 10, $row['Completed SJA'], 1, 0, 'C');
    $pdf->Cell(50, 10, $row['Equipment failure/Beyond scope/Aid/restored'], 1, 0, 'C');
    $pdf->Cell(30, 10, $row['Total Faults'], 1, 0, 'C');
    $pdf->Cell(30, 10, $row['TOTAL FAULTS'], 1, 0, 'C');
    $pdf->Cell(30, 10, $row['SLA Adherence %'], 1, 1, 'C');
}

// Output PDF
$filename = 'Monthly SLA Report.pdf';
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
$pdf->Output('D', $filename);
?>
