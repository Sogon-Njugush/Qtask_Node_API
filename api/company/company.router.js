const {
    createCompany,
    getCompany,
    updateCompany,
} = require("./company.controller");
const { checkToken } = require("../../authentication/tokenValidation");
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
//set storage engine
const storage = multer.diskStorage({
    destination: './upload/companyImages',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})

// multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10000000
    }
});



router.post("/", checkToken, upload.single('company_logo'), createCompany);
router.get("/", checkToken, getCompany);
router.patch("/", checkToken, updateCompany);


module.exports = router;