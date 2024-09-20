const {createAssign,deleteAssign,getAssigns, getAssign,updateAssign} = require('./assign_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createAssign);

//get project_bom
router.get("/getSupervisor",checkToken,getAssign);

//get project_bom
router.get("/",checkToken,getAssigns);

//update project_bom
router.patch("/",checkToken, updateAssign);

//delete project_bom
router.delete("/",checkToken, deleteAssign);

module.exports = router;
