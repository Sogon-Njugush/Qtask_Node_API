const {getServiceChangeRequest,getSegmentBudget,getMaterialUsage, getServiceProgress,getCounts, getMaterialChangeRequest,getSegmentUpdate,
    getMaterialChangeRequestList,getServiceChangeRequestList,getIncidentReport, getUploadedDocument,approveSegment,uploadClosureDocuments,
    uploadTest
} = require('./segment_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// get dashboard counts
router.get("/newChangeRequest", checkToken,getCounts);

//get project highlight
router.get("/materialData",checkToken,getMaterialUsage);

//get change Request
router.get("/serviceData",checkToken,getServiceProgress);

//recent project
router.get("/serviceChangeRequest",checkToken, getServiceChangeRequest);

//segment Task
router.get("/materialChangeRequest",checkToken, getMaterialChangeRequest);

//recent update
router.get("/userWorkload", checkToken, getSegmentBudget);

//get segment update
router.get("/segmentUpdate", checkToken, getSegmentUpdate);

//get segment change request list
router.get("/materialChangeList", checkToken, getMaterialChangeRequestList);

//get segment service  change request list
router.get("/serviceChangeList", checkToken, getServiceChangeRequestList);

//incident report
router.get("/incidentReport", checkToken, getIncidentReport);

//get uploaded documents
router.get("/uploadedDocuments", checkToken, getUploadedDocument);

//approve segment closure
router.post("/closeSegment", checkToken, approveSegment);
//upload closure document
router.post("/closureUploads", checkToken,uploadClosureDocuments);

module.exports = router;
