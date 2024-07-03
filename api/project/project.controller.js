const {createProject,getProject, getProjects,updateProject,deleteProject} = require('./project.service');
require('dotenv').config();
const AppError  = require("../../utils/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project
    createProject: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await createProject(body);
            if(!result.length){
                throw new AppError("Error not found!",403);
            }
            return res.json({
                success:true,
                massage: "Project created Successfully!",
                data:result
            });
        }catch (e) {
            next(e);
        }
    },

    //get project
    getProject: async (req, res, next)=>{
        try{
            const body  = req.body;
            const result = await getProject(body.project_id);
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
    // get projects
    getProjects: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await getProjects(body.company_id);
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

    //update project_bom
    updateProject: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateProject(body);
            return res.json({
                success:true,
                data: "BOM details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_bom
    deleteProject: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  deleteProject(data);
            return res.json({
                success:true,
                data: "BOM Details deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
