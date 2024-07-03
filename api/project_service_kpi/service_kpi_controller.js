const {createServiceKpi,getServiceKpi, getServiceKpis,updateServiceKpi,deleteServiceKpi} = require('./service_kpi');
require('dotenv').config();
const AppError  = require("../../utils/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project_segment  service KPI
    createServiceKpi: async (req, res, next) => {
        try {
            const materials = req.body; // Expecting an array of segments
            const result = await createServiceKpi(materials);

            return res.json({
                success: true,
                message: "Service KPI created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get project_segment service kpi by id
    getServiceKpi: async (req, res, next)=>{
        try{
            const body  = req.body;
            const result = await getServiceKpi(body);
            // if(!result.length){
            //     throw new AppError("Error Item not found!",403);
            // }
            return res.json({
                success:true,
                data:result,
            });
        }catch (e) {
            next(e);
        }
    },

    // get service kpi
    getServiceKpis: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await getServiceKpis(body);
            // if(!result.length){
            //     throw new AppError("Error Bom not found!",403);
            // }
            return res.json({
                success: true,
                data: result,
            });
        }catch (e) {
            next(e);
        }
    },

    //update project_segment service kpi
    updateServiceKpi: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateServiceKpi(body);
            return res.json({
                success:true,
                data: "Service KPI details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_segment service kpi
    deleteServiceKpi: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  deleteServiceKpi(data);
            return res.json({
                success:true,
                data: "Service KPI deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
