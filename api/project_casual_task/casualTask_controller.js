const {createCasualTask,getCasualTask, getCasualTasks,updateCasualTask,deleteCasualTask} = require('./casualTask_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create casual Task
    createCasualTask: async (req, res, next) => {
        try {
            const casualTasks = req.body; // Expecting an array of segments
            const result = await createCasualTask(casualTasks);

            return res.json({
                success: true,
                message: "Casual Task Added successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get casual task by id
    getCasualTask: async (req, res, next)=>{
        try{
            const body  = req.query;
            const result = await getCasualTask(body);
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

    // get all casual task
    getCasualTasks: async (req, res, next)=>{
        try{
            const body = req.query;
            const result = await getCasualTasks(body);
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

    //update casual tasks
    updateCasualTask: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateCasualTask(body);
            return res.json({
                success:true,
                data: "Casual Tasks details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete casual task
    deleteCasualTask: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  deleteCasualTask(data);
            return res.json({
                success:true,
                data: "Casual Tasks Deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
