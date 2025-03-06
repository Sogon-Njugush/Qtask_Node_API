const {createProject,deleteProject,getProjects, getProject,updateProject} = require('./project.controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');
const multer = require("multer");
const path = require("path");

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: '../../upload/projectImages',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

// multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10000000
    }
});
// Define the fields for uploading multiple files with different field names
const fileFields = upload.fields([
    { name: 'project_po_file', maxCount: 1 },
    { name: 'project_ehs_file', maxCount: 1 },
    { name: 'project_permit', maxCount: 1 },
    { name: 'project_design', maxCount: 1 },
    { name: 'project_certificate_of_workers', maxCount: 1 }
]);


// create project_bom
router.post("/", checkToken,fileFields, createProject);

//get project_bom
router.get("/getProject",checkToken,getProject);

//get project_bom
router.get("/",checkToken,getProjects);

//update project_bom
router.patch("/",checkToken, updateProject);

//delete project_bom
router.delete("/",checkToken, deleteProject);

module.exports = router;
