const {createSegment,deleteSegment,getSegment, getSegments,updateSegment} = require('./segment.controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createSegment);

//get project_bom
router.get("/getSegment",checkToken,getSegment);

//get project_bom
router.get("/",checkToken,getSegments);

//update project_bom
router.patch("/",checkToken, updateSegment);

//delete project_bom
router.delete("/",checkToken, deleteSegment);

module.exports = router;
