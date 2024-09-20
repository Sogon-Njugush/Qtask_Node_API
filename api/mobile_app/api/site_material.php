<?php
include "../includes/db_connection.php";

if($_GET['site_id']){
    $site_id = $_GET['site_id'];
    $sql="SELECT dispensed_material.*, stock.*,item_type.*,unit_of_measure.*,item_category.* FROM dispensed_material
INNER JOIN stock ON stock.stock_id = dispensed_material.stock_id
INNER JOIN item_type ON item_type.item_type_id = stock.stock_item_id
INNER JOIN item_category ON item_category.item_category_id = item_type.item_category_id
INNER JOIN unit_of_measure ON item_type.unit_of_measure_id = unit_of_measure.unit_of_measure_id
WHERE dispensed_material.site_id='$site_id'";
    $result=mysqli_query($conn,$sql);
    $response['detailslist']=array();
    while($row=mysqli_fetch_assoc($result)){
        $stock_owner = $row['stock_owner'];
        if($stock_owner >0) {
            $query = "SELECT * FROM customer WHERE customer_id='$stock_owner'";
            $results = $mysqli->query($query);
            $rows = $results->fetch_assoc();
            $customer_name = ucwords($rows['customer_name']);
            $customer_id = $stock_owner;
        }else{
            $customer_name = "In-House";
            $customer_id = "0";
        }
        //end elapsed time
        $detailslist=array();
        $detailslist['item_name']=$row['item_name'];
        $detailslist['unit']= $row['unit_name'];
        $detailslist['stock_id']= $row['stock_id'];
        $detailslist['item_type']= $row['category_name'];
        $detailslist['source']= $customer_name;
        $detailslist['source_id']= $customer_id;
        $detailslist['stock_quantity']= $row['dispense_status'];
        $detailslist['stock_code']= $row['serial_no'];
        array_push($response['detailslist'],$detailslist);
    }
    $response['error'] = false;
    $response['message'] = "sent";
} else {
    $response['error'] = true;
    $response['message'] = "Insufficient Parameters";
}
echo json_encode($response);
?>
