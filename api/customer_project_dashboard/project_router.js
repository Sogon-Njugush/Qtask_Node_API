const {getInfo, getProjects} = require('./project_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.get("/info", checkToken,getInfo);

//get project_bom
router.get("/projects",checkToken,getProjects);


module.exports = router;
