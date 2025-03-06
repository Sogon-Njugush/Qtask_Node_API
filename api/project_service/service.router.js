const {createProjectService,deleteProjectService,getProjectService, getProjectServices, updateProjectService} = require('./service.controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project service
router.post("/createProjectService", checkToken,createProjectService);

//get project service
router.get("/getProjectService",checkToken,getProjectService);

//get project services
router.get("/getProjectServices",checkToken,getProjectServices);

//update project_bom
router.patch("/updateProjectService",checkToken, updateProjectService);

//delete project_bom
router.delete("/deleteProjectService",checkToken, deleteProjectService);

module.exports = router;
