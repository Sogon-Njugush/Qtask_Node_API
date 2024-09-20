const {
    createServiceCategory,
    updateServiceCategory,
    getServiceCategoryByBranchId,
    createService,
    updateService,
    getServiceByBranchId,
} = require("./services.controller");
const { checkToken } = require("../../authentication/tokenValidation");

const router = require("express").Router();


router.post("/serviceCategory", checkToken, createServiceCategory);
router.patch("/serviceCategory", checkToken, updateServiceCategory);
router.get("/serviceCategory", checkToken, getServiceCategoryByBranchId);
router.post("/", checkToken, createService);
router.patch("/", checkToken, updateService);
router.get("/", checkToken, getServiceByBranchId);


module.exports = router;