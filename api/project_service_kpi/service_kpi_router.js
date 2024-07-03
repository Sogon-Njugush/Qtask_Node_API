const {createServiceKpi,deleteServiceKpi,getServiceKpi, getServiceKpis,updateServiceKpi} = require('./service_kpi_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../auth/token_validation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createServiceKpi);

//get project_bom
router.get("/getServiceKpi",checkToken,getServiceKpi);

//get project_bom
router.get("/",checkToken,getServiceKpis);

//update project_bom
router.patch("/",checkToken, updateServiceKpi);

//delete project_bom
router.delete("/",checkToken, deleteServiceKpi);

module.exports = router;
