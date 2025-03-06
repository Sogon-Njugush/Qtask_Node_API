const {getServiceChangeRequest,getSegmentBudget,getMaterialUsage, getServiceProgress,getCounts, getMaterialChangeRequest,getSegmentUpdate,
    getMaterialChangeRequestList,getServiceChangeRequestList,getIncidentReport, getUploadedDocument,approveSegment,uploadClosureDocuments,
    uploadSegmentDocuments,getSegmentDocuments,getSegmentMap,
    uploadTest
} = require('./segment_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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
router.post("/closureUploads", checkToken,upload.array('files[]'),uploadClosureDocuments);
//upload segment document
router.post("/segmentUploads", checkToken,upload.array('files[]'),uploadSegmentDocuments);
//get segment file
router.get("/getSegmentDocuments", checkToken, getSegmentDocuments);
//get segment map
router.get("/getSegmentMap", checkToken, getSegmentMap);

module.exports = router;
