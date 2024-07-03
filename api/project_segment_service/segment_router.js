const {createService,deleteService,getService, getServices,updateService} = require('./segment_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../auth/token_validation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createService);

//get project_bom
router.get("/getService",checkToken,getService);

//get project_bom
router.get("/",checkToken,getServices);

//update project_bom
router.patch("/",checkToken, updateService);

//delete project_bom
router.delete("/",checkToken, deleteService);

module.exports = router;
