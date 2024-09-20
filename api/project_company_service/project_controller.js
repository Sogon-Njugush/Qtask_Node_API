const {createService,getService, getServices,updateService,deleteService} = require('./project_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create service
    createService: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await createService(body);
            // if(!result.length){
            //     throw new AppError("Error not found!",403);
            // }
            return res.json({
                success:true,
                massage: "Service created Successfully!",
                data:result
            });
        }catch (e) {
            next(e);
        }
    },

    //get service
    getService: async (req, res, next)=>{
        try{
            const body  = req.query;
            const result = await getService(body.service_id);
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

    // get services
    getServices: async (req, res, next)=>{
        try{
            const body = req.query;
            const result = await getServices(body.company_id);
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

    //update service
    updateService: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateService(body);
            return res.json({
                success:true,
                data: "Service details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete service
    deleteService: async (req, res, next)=>{
        try{
            const data = req.query.service_id;
            const result = await  deleteService(data);
            return res.json({
                success:true,
                data: "Service deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
