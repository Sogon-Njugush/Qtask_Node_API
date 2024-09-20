const {
    createServiceCategory,
    updateServiceCategory,
    getServiceCategoryByBranchId,
    createService,
    updateService,
    getServiceByBranchId,
} = require("./services.service");

const AppError = require("../../util/appError");
const catchAsync = require("../../util/catchAsync");

module.exports = {
    createServiceCategory : catchAsync(async (req, res, next) => {
        const body = req.body;
        const result = await createServiceCategory(body);
        return res.json({
            success: 1,
            message: "Service Category created Successfully!",
            data: result
        });
    }),
    updateServiceCategory : catchAsync(async (req, res, next) => {
        const body = req.body;
        const result = await updateServiceCategory(body);
        return res.json({
            success: 1,
            message: "Service Category updated Successfully!",
            data: result
        });
    }),
    getServiceCategoryByBranchId : catchAsync(async (req, res, next) => {
        const company_id = req.query.company_id;
        const result = await getServiceCategoryByBranchId(company_id);
        return res.json({
            success: 1,
            message: "Requested Successfully!",
            data: result
        });
    }),
    createService : catchAsync(async (req, res, next) => {
        const body = req.body;
        const result = await createService(body);
        return res.json({
            success: 1,
            message: "Service created Successfully!",
            data: result
        });
    }),
    updateService : catchAsync(async (req, res, next) => {
        const body = req.body;
        const result = await updateService(body);
        return res.json({
            success: 1,
            message: "Service updated Successfully!",
            data: result
        });
    }),
    getServiceByBranchId : catchAsync(async (req, res, next) => {
        const company_id = req.query.company_id;
        const result = await getServiceByBranchId(company_id);
        return res.json({
            success: 1,
            message: "Requested Successfully!",
            data: result
        });
    }),
}

