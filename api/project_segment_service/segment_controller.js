const {createService,getService, getServices,updateService,deleteService} = require('./segment_service');
require('dotenv').config();
const AppError  = require("../../utils/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project_segment
    createService: async (req, res, next) => {
        try {
            const services = req.body; // Expecting an array of segments
            const result = await createService(services);

            return res.json({
                success: true,
                message: "Segments created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get service
    getServices: async (req, res, next)=>{
        try{
            const body  = req.body;
            const result = await getServices(body.segment_id);
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

    //
    // get project_segment services
    getService: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await getService(body);
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

    //update project_segment service
    updateService: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateService(body);
            return res.json({
                success:true,
                data: "Segment details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_segment service
    deleteService: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  deleteService(data);
            return res.json({
                success:true,
                data: "Segment deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
