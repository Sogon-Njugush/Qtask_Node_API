const { createProjectClosureParameter, deleteProjectClosureParameter, getProjectClosureParameters, getProjectClosureParameter,
    updateProjectClosureParameter, createSegmentAcceptance, deleteSegmentAcceptance,getAllSegmentAcceptances,getSegmentAcceptanceById
,updateSegmentAcceptance,createSegmentClosureCheck,deleteSegmentClosureCheck,getAllSegmentClosureChecks,getSegmentClosureCheckById,
    updateSegmentClosureCheck,getAllSegmentClosureWithPassChecks,approveSegmentAcceptance,declineSegmentAcceptance} = require('./segment_closure.controller');
const router = require('express').Router();

// Validate token
const { checkToken } = require("../../authentication/tokenValidation");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define Upload Directory
const uploadDir = path.join(__dirname, "../../upload/acceptanceFiles");

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files in the correct directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Create Project Closure Parameter
router.post("/createClosureParameter", checkToken, createProjectClosureParameter);

// Get Project Closure Parameter by ID
router.get("/getClosureParameterById", checkToken, getProjectClosureParameter);

// Get Project Closure Parameters
router.get("/getClosureParameters", checkToken, getProjectClosureParameters);

// Update Project Closure Parameter
router.patch("/updateClosureParameter", checkToken, updateProjectClosureParameter);

// Delete Project Closure Parameter
router.delete("/deleteClosureParameter", checkToken, deleteProjectClosureParameter);

// Create Segment Acceptance
router.post("/createSegmentAcceptance", checkToken, createSegmentAcceptance);

// Get Segment Acceptance by ID
router.get("/getSegmentAcceptanceById", checkToken, getSegmentAcceptanceById);

// Get All Segment Acceptances
router.get("/getAllSegmentAcceptances", checkToken, getAllSegmentAcceptances);

// Update Segment Acceptance
router.patch("/updateSegmentAcceptance", checkToken, updateSegmentAcceptance);

// Soft Delete Segment Acceptance
router.delete("/deleteSegmentAcceptance", checkToken, deleteSegmentAcceptance);


// Create Segment Closure Check
router.post("/createSegmentClosureCheck", checkToken, createSegmentClosureCheck);

// Get Segment Closure Check by ID
router.get("/getSegmentClosureCheckById", checkToken, getSegmentClosureCheckById);

// Get All Segment Closure Checks
router.get("/getAllSegmentClosureChecks", checkToken, getAllSegmentClosureChecks);

// Update Segment Closure Check
router.patch("/updateSegmentClosureCheck", checkToken, updateSegmentClosureCheck);

// Soft Delete Segment Closure Check
router.delete("/deleteSegmentClosureCheck", checkToken, deleteSegmentClosureCheck);

//get all segment closures with pass checks
router.get("/getAllSegmentClosureWithPassChecks", checkToken, getAllSegmentClosureWithPassChecks);

//segment closure approval
router.patch("/approveSegmentAcceptance", checkToken, approveSegmentAcceptance);

//segment closure decline
router.patch("/declineSegmentAcceptance", checkToken, declineSegmentAcceptance);

module.exports = router;
