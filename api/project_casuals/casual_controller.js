const {createCasual,getCasual, getCasuals,updateCasual,deleteCasual} = require('./casual_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create casual
    createCasual: async (req, res, next) => {
        try {
            const casuals = req.body; // Expecting an array of segments
            const result = await createCasual(casuals);

            return res.json({
                success: true,
                message: "Casuals created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get casual by id
    getCasual: async (req, res, next)=>{
        try{
            const body  = req.query;
            const result = await getCasual(body);
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
    getCasuals: async (req, res, next)=>{
        try{
            const body = req.query;
            const result = await getCasuals(body);
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
    updateCasual: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateCasual(body);
            return res.json({
                success:true,
                data: "Casual details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete casual
    deleteCasual: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  deleteCasual(data);
            return res.json({
                success:true,
                data: "Casual deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
