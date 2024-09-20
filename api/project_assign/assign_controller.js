const {createAssign,getAssign, getAssigns,updateAssign,deleteAssign} = require('./assign_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
      //supervisor array
    createAssign: async (req, res, next) => {
        try {
            const supervisors = req.body; // Expecting an array of supervisors
            const result = await createAssign(supervisors);

            return res.json({
                success: true,
                message: "Segment Assigned successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get project
    getAssign: async (req, res, next)=>{
        try{
            const body  = req.query.segment_assign_id;
            const result = await getAssign(body);
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
    getAssigns: async (req, res, next)=>{
        try{
            const body = req.query.segment_id;
            const result = await getAssigns(body);
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

    //update assignment details
    updateAssign: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateAssign(body);
            return res.json({
                success:true,
                data: "Assigment details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete segment assign
    deleteAssign: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  deleteAssign(data);
            return res.json({
                success:true,
                data: "Assigment Details deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
