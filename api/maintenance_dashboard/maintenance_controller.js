const {getCount, getMTTR, getRecentUpdate, getTicketTraffic,getBreached,getBreachedAnalysis,getTicketListByStatus,getReportByRegion,
    getReportCounts,
    getTechnicianReport
} = require('./maintenance_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //get count
    getCount: async (req, res, next) =>{
        try{
            const body = req.query.company_id;
            const result = await getCount(body);
            // if(!result.length){
            //     throw new AppError("Error not found!",403);
            // }
            return res.json({
                success:true,
                data:result,
            });
        }catch (e) {
            next(e);
        }
    },

    //get MTTR
    getMTTR: async (req, res, next)=>{
        try{
            const body  = req.query.company_id;
            const result = await getMTTR(body);
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
    //get recent update
    getRecentUpdate:async (req, res, next)=>{
        try{
            const body  = req.query.company_id;
            const result = await getRecentUpdate(body);
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
    // get ticket traffic
    getTicketTraffic:async (req, res, next)=>{
        try{
            const body  = req.query.company_id;
            const result = await getTicketTraffic(body);
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
   //get breached tickets
    getBreached:async (req, res, next)=>{
        try{
            const body  = req.query.company_id;
            const result = await getBreached(body);
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
    //get breached analysis
    getBreachedAnalysis:async (req, res, next)=>{
        try{
            const body  = req.query.company_id;
            const result = await getBreachedAnalysis(body);
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
    //get breached analysis
    getTicketListByStatus:async (req, res, next)=>{
        try{
            const { company_id, status } = req.query;
            const result = await getTicketListByStatus(company_id, status);
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
    // reports by region
    getReportByRegion:async (req, res, next)=>{
        try{
            const body = req.query.company_id;
            const result = await getReportByRegion(body);
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
    //report counts
    getReportCounts:async (req, res, next)=>{
        try{
            const body = req.query.company_id;
            const result = await getReportCounts(body);
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
    // technician reports
    getTechnicianReport:async (req, res, next)=>{
        try{
            const body = req.query.company_id;
            const result = await getTechnicianReport(body);
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
   // end
}
