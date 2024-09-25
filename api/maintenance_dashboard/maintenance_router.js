const {getCount, getMTTR,getRecentUpdate,getTicketTraffic,getBreached,getBreachedAnalysis,getTicketListByStatus,getReportByRegion,
    getReportCounts,getTechnicianReport} = require('./maintenance_controller');
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
//get ticket list by status
router.get("/getTicketListByStatus", checkToken, getTicketListByStatus);
//get report by region
router.get("/getRegionalReport", checkToken, getReportByRegion);
//get report count
router.get("/getReportCount", checkToken, getReportCounts);
//get technician reports
router.get("/getTechnicianReport", checkToken, getTechnicianReport);

module.exports = router;
