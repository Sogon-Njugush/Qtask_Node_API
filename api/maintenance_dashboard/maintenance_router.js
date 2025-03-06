const {getCount, getMTTR,getRecentUpdate,getTicketTraffic,getBreached,getBreachedAnalysis,getTicketListByStatus,getReportByRegion,
    getReportCounts,getTechnicianReport, getTicketSLAStatusController,reAssignTicket,holdTicket,updateTicket,activateTicket,
    closeTicket,reOpenTicket,completeTicket,getMap,getHeatMap,createNocComment,getNocComment,deleteNocComment,
    updateNocComment,addNocComment,getMapDistribution,updateSite,deleteTicket,getSiteById,activeTechnician} = require('./maintenance_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
const {updateBom, deleteBom} = require("../project_bom/bom.controller");
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
//sla monitoring
router.get('/getTicketSLAStatus', checkToken, getTicketSLAStatusController);
// ticket re-assigned
router.post('/reAssignTicket', checkToken, reAssignTicket);
//ticket hold
router.post('/holdTicket', checkToken, holdTicket);
//ticket update
router.post('/updateTicket', checkToken, updateTicket);
//close ticket
router.post('/closeTicket', checkToken, closeTicket);
//re-open ticket
router.post('/reOpenTicket', checkToken, reOpenTicket);
//complete ticket
router.post('/completeTicket', checkToken, completeTicket);
//map Data
router.get('/getMap', checkToken, getMap);
//ticket activation
router.post('/activateTicket', checkToken, activateTicket);
//ticket heat map
router.get('/getHeatMap', checkToken, getHeatMap);
//add noc comment
router.post('/addNocComment', checkToken, createNocComment);
//get noc comments
router.get('/getNocComment', checkToken, getNocComment);
//update noc comment
router.patch("/updateNocComment",checkToken, updateNocComment);
//delete noc comment
router.delete("/deleteNocComment",checkToken, deleteNocComment);
//new noc comment creation
router.post('/newCreatNocComment', checkToken, addNocComment);
//ticket distribution map
router.post('/distributionMap ', checkToken, getMapDistribution);
//update site
router.patch('/updateSite ', checkToken, updateSite);
//get site
router.patch('/getSiteById ', checkToken, getSiteById);
//delete ticket
router.delete('/deleteTicket', checkToken, deleteTicket);
//active users
router.get('/activeTechnician', checkToken, activeTechnician);

module.exports = router;
