const {getSegmentTask,getCurrentProject,getChangeRequest, getProjectHighlight,getCounts, getRecentUpdate} = require('./admin_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// get dashboard counts
router.get("/service", checkToken,getServices);

//get project highlight
router.get("/projects",checkToken,getProjects);

//get change Request
router.get("/clients",checkToken,getClients);

//recent project
router.get("/budget",checkToken, getBudget);

//segment Task
router.get("/users",checkToken, getUsers);

//recent update
router.get("/recentUpdates", checkToken, getRecentUpdate )

module.exports = router;
