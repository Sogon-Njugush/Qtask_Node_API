const {createProject,getProject, getProjects,updateProject,deleteProject} = require('./project.service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
//create project
    createProject: async (req, res, next) => {
        try {
            const body = req.body;

            // Check if files are uploaded
            const files = req.files;
            if (!files) {
                return res.status(400).json({
                    success: false,
                    message: "No files were uploaded!"
                });
            }

            // Extract file paths from the uploaded files
            const projectData = {
                ...body, // Spread the rest of the project details from req.body
                po_file: files.project_po_file ? files.project_po_file[0].path : null,
                ehs_file: files.project_ehs_file ? files.project_ehs_file[0].path : null,
                permit_file: files.project_permit ? files.project_permit[0].path : null,
                design_file: files.project_design ? files.project_design[0].path : null,
                worker_cert: files.project_certificate_of_workers ? files.project_certificate_of_workers[0].path : null
            };

            // Insert project data into the database
            const result = await createProject(projectData);

            return res.json({
                success: true,
                message: "Project created successfully!",
                data: result
            });
        } catch (e) {
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
