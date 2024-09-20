const {getChangeRequest,getCounts, getCurrentProject,getProjectHighlight,getSegmentTask,getRecentUpdate} = require('./project_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //get dashboard count
    getCounts: async (req, res, next) => {
        try {
            const body = req.query.company_id;
            const result = await getCounts(body);

            return res.json({
                success: true,
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get project highlight
    getProjectHighlight: async (req, res, next)=>{
        try{
            const body  = req.query.company_id;
            const result = await getProjectHighlight(body);
            return res.json({
                success:true,
                data:result,
            });
        }catch (e) {
            next(e);
        }
    },

    // get change request
    getChangeRequest: async (req, res, next)=>{
        try{
            const body = req.query.company_id;
            const result = await getChangeRequest(body);
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

    //get current projects
    getCurrentProject: async (req, res, next)=>{
        try{
            const body = req.query.company_id;
            const result = await getCurrentProject(body);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e);
        }
    },

    //get segment task
    getSegmentTask: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  getSegmentTask(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },

// get recent updates
    getRecentUpdate: async (req, res, next)=>{
        try{
            const data = req.query.company_id;
            const result = await  getRecentUpdate(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
}
