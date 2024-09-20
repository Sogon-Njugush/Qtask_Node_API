const {getSegmentHighlight,getCounts, getSegmentProgress,getSegmentBudget,getTaskWeight,getWorkLoad} = require('./project_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //get dashboard count
    getCounts: async (req, res, next) => {
        try {
            const body = req.query.project_id;
            const result = await getCounts(body);

            return res.json({
                success: true,
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get segment highlight
    getSegmentHighlight: async (req, res, next)=>{
        try{
            const body  = req.query.project_id;
            const result = await getSegmentHighlight(body);
            return res.json({
                success:true,
                data:result,
            });
        }catch (e) {
            next(e);
        }
    },

    // get Task Weight
    getTaskWeight: async (req, res, next)=>{
        try{
            const body = req.query.project_id;
            const result = await getTaskWeight(body);
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

    //get segment Budget
    getSegmentBudget: async (req, res, next)=>{
        try{
            const body = req.query.project_id;
            const result = await getSegmentBudget(body);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e);
        }
    },

    //get segment workload
    getWorkLoad: async (req, res, next)=>{
        try{
            const data = req.query.project_id;
            const result = await  getWorkLoad(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },

// get segment progress
    getSegmentProgress: async (req, res, next)=>{
        try{
            const data = req.query.project_id;
            const result = await  getSegmentProgress(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
}
