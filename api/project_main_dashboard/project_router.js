const {getSegmentTask,getCurrentProject,getChangeRequest, getProjectHighlight,getCounts, getRecentUpdate} = require('./project_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// get dashboard counts
router.get("/counts", checkToken,getCounts);

//get project highlight
router.get("/highLights",checkToken,getProjectHighlight);

//get change Request
router.get("/changeRequest",checkToken,getChangeRequest);

//recent project
router.get("/recentProject",checkToken, getCurrentProject);

//segment Task
router.get("/segmentTask",checkToken, getSegmentTask);

//recent update
router.get("/recentUpdates", checkToken, getRecentUpdate )

module.exports = router;
