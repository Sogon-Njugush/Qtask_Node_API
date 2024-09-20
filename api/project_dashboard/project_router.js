const {getSegmentHighlight,getSegmentBudget,getSegmentProgress, getTaskWeight,getCounts, getWorkLoad} = require('./project_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// get dashboard counts
router.get("/counts", checkToken,getCounts);

//get project highlight
router.get("/projectHighlight",checkToken,getSegmentHighlight);

//get change Request
router.get("/segmentBudget",checkToken,getSegmentBudget);

//recent project
router.get("/taskProgress",checkToken, getSegmentProgress);

//segment Task
router.get("/taskWeight",checkToken, getTaskWeight);

//recent update
router.get("/userWorkload", checkToken, getWorkLoad);

module.exports = router;
