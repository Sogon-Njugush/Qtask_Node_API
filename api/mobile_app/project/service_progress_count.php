<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');

include "../db_connection.php";

$sql="SELECT * FROM service_completion_percentage";
$query=mysqli_query($conn,$sql);
while($row=mysqli_fetch_assoc($query)){
    $segment_id=$row['segment_id'];
    $service_id=$row['service_id'];
    $completion_id=$row['completion_id'];
    // echo "Segment id = ".$segment_id.' '.' Service Id = '.$service_id;

    // get the total quantity set
    $material_sql="SELECT * FROM segment_implemetation_service WHERE segment_id='$segment_id' AND service_type='$service_id'";
    $material_query=mysqli_query($conn,$material_sql);
    $material_row=mysqli_fetch_assoc($material_query);
    $bom_count=$material_row['quantity'];
    // echo 'Bom total is '.$bom_count.'   ';

    // the total quantity  used
    $total_sql="SELECT SUM(job_card.service_quantity) FROM job_card
    INNER JOIN project_assign_user ON project_assign_user.project_assign_id=job_card.segment_id
     WHERE project_assign_user.segment_id='$segment_id' AND job_card.service_id='$service_id'";
    $total_query=mysqli_query($conn,$total_sql);
    $row_total = mysqli_fetch_row($total_query);
    $total_used = $row_total[0]; 

    // echo 'total used is = '. $total_used .'<br>';
      
    if($total_used !=''){
        $percentage_used= ($total_used/$bom_count)*100;
        $average= number_format((float)$percentage_used, 2, '.', '');
    }else{
        $average=0;
    }

    $sql_update="UPDATE service_completion_percentage SET completion_percentage='$average' WHERE completion_id='$completion_id'";
    mysqli_query($conn, $sql_update);
}
?>
