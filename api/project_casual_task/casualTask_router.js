const {createCasualTask,deleteCasualTask,getCasualTask, getCasualTasks,updateCasualTask} = require('./casualTask_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createCasualTask);

//get project_bom
router.get("/getCasualTask",checkToken,getCasualTask);

//get project_bom
router.get("/",checkToken,getCasualTasks);

//update project_bom
router.patch("/",checkToken, updateCasualTask);

//delete project_bom
router.delete("/",checkToken, deleteCasualTask);

module.exports = router;
