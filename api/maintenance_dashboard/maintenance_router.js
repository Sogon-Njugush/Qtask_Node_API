const {getCount, getMTTR,getRecentUpdate,getTicketTraffic,getBreached,getBreachedAnalysis} = require('./maintenance_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.get("/count", checkToken,getCount);
//get mttr
router.get("/mttr",checkToken,getMTTR);
//get recent update
router.get("/getRecentUpdate",checkToken,getRecentUpdate);
//get traffic data
router.get("/getTicketTraffic", checkToken, getTicketTraffic);
//get breached tickets
router.get("/getBreached", checkToken, getBreached);
//get breached tickets analysis
router.get("/getBreachedAnalysis", checkToken, getBreachedAnalysis);

module.exports = router;
