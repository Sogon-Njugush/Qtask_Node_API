const {createCasual,deleteCasual,getCasual, getCasuals,updateCasual} = require('./casual_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../auth/token_validation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createCasual);

//get project_bom
router.get("/getCasual",checkToken,getCasual);

//get project_bom
router.get("/",checkToken,getCasuals);

//update project_bom
router.patch("/",checkToken, updateCasual);

//delete project_bom
router.delete("/",checkToken, deleteCasual);

module.exports = router;
