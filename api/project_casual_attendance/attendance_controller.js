const {createAttendance,getAttendance, getAttendances,updateAttendance,timeoutCasual} = require('./attendance_service');
require('dotenv').config();
const AppError  = require("../../utils/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create casual
    createAttendance: async (req, res, next) => {
        try {
            const casuals = req.body; // Expecting an array of segments
            const result = await createAttendance(casuals);

            return res.json({
                success: true,
                message: "Attendance registered successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get casual by id
    getAttendance: async (req, res, next)=>{
        try{
            const body  = req.body;
            const result = await getAttendance(body);
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

    // get casual
    getAttendances: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await getAttendances(body);
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

    //update casual
    updateAttendance: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateAttendance(body);
            return res.json({
                success:true,
                data: "Casual Attendance details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete casual
    timeoutCasual: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  timeoutCasual(data);
            return res.json({
                success:true,
                data: "Casual Attendance closed successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
