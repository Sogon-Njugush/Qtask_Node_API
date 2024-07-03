const {createJobCard,deleteJobCard,getJobCards, getJobCard,updateJobCard} = require('./jobCard_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../auth/token_validation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createJobCard);

//get project_bom
router.get("/getJobCard",checkToken,getJobCard);

//get project_bom
router.get("/",checkToken,getJobCards);

//update project_bom
router.patch("/",checkToken, updateJobCard);

//delete project_bom
router.delete("/",checkToken, deleteJobCard);

module.exports = router;
