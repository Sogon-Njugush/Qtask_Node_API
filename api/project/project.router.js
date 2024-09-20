const {createProject,deleteProject,getProjects, getProject,updateProject} = require('./project.controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createProject);

//get project_bom
router.get("/getProject",checkToken,getProject);

//get project_bom
router.get("/",checkToken,getProjects);

//update project_bom
router.patch("/",checkToken, updateProject);

//delete project_bom
router.delete("/",checkToken, deleteProject);

module.exports = router;
