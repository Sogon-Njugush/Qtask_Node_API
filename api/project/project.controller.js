const {createProject,getProject, getProjects,updateProject,deleteProject} = require('./project.service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project
    createProject: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await createProject(body);
            // if(!result.length){
            //     throw new AppError("Error not found!",403);
            // }
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
            const body  = req.query.project_id;
            const result = await getProject(body);
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
            const body = req.query.company_id;
            const result = await getProjects(body);
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
            await updateProject(body);
            return res.json({
                success:true,
                data: "Project details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_bom
    deleteProject: async (req, res, next)=>{
        try{
            const data = req.query.project_id;
            await  deleteProject(data);
            return res.json({
                success:true,
                data: "project Details deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
