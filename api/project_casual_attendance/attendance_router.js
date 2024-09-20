const {createAttendance,timeoutCasual,getAttendance, getAttendances,updateAttendance} = require('./attendance_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createAttendance);

//get project_bom
router.get("/getAttendance",checkToken,getAttendance);

//get project_bom
router.get("/",checkToken,getAttendances);

//update project_bom
router.patch("/",checkToken, updateAttendance);

//delete project_bom
router.put("/",checkToken, timeoutCasual);

module.exports = router;
