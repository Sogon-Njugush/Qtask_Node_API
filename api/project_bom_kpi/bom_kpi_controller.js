const {createBomKpi,getBomKpis, getBomKpi,updateBomKpi,deleteBomKpi} = require('./bom_kpi_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project_segment project_bom KPI
    createBomKpi: async (req, res, next) => {
        try {
            const materials = req.body; // Expecting an array of segments
            const result = await createBomKpi(materials);

            return res.json({
                success: true,
                message: "Material KPI created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get project_segment project_bom kpi by id
    getBomKpi: async (req, res, next)=>{
        try{
            const body  = req.query.material_kpi_id;
            const result = await getBomKpi(body);
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

    // get project_bom kpi
    getBomKpis: async (req, res, next)=>{
        try{
            const body = req.query.segment_id;
            const result = await getBomKpis(body);
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

    //update project_segment project_bom kpi
    updateBomKpi: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateBomKpi(body);
            return res.json({
                success:true,
                data: "Material KPI details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_segment project_bom kpi
    deleteBomKpi: async (req, res, next)=>{
        try{
            const data = req.query.material_kpi_id;
            const result = await  deleteBomKpi(data);
            return res.json({
                success:true,
                data: "Material KPI deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
