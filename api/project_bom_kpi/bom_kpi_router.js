const {createBomKpi,deleteBomKpi,getBomKpi, getBomKpis,updateBomKpi} = require('./bom_kpi_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../auth/token_validation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createBomKpi);

//get project_bom
router.get("/getBomKpi",checkToken,getBomKpi);

//get project_bom
router.get("/",checkToken,getBomKpis);

//update project_bom
router.patch("/",checkToken, updateBomKpi);

//delete project_bom
router.delete("/",checkToken, deleteBomKpi);

module.exports = router;
