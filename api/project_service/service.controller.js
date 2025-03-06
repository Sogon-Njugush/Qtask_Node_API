const {createProjectService,deleteProjectService,getProjectService,getProjectServices,updateProjectService} = require('./service.service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project service
    createProjectService: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await createProjectService(body);
            if(!result.length){
                throw new AppError("Error not found!",403);
            }
            return res.json({
                success:true,
                massage: "Project Service created Successfully!",
                data:result
            });
        }catch (e) {
            throw new AppError("Error not found!",e);
            next(e);
        }
    },

    //get project service
    getProjectService: async (req, res, next)=>{
        try{
            const body  = req.query.segment_service_id;
            const result = await getProjectService(body);
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
    // get project services
    getProjectServices: async (req, res, next)=>{
        try{
            const body = req.query.company_id;
            const result = await getProjectServices(body);
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

    //update project servives
    updateProjectService: async (req, res)=>{
        try{
            const body = req.body;
            const result = await updateProjectService(body);
            return res.json({
                success:true,
                data: "Project Service updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_bom
    deleteProjectService: async (req, res)=>{
        try{
            const data = req.query.segment_service_id;
            const result = await  deleteProjectService(data);
            return res.json({
                success:true,
                data: "Project Service deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
