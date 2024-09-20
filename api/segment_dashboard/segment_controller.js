const {getCounts, getMaterialChangeRequest, getMaterialUsage, getServiceChangeRequest, getWorkLoad,uploadClosureDocuments,
    getServiceProgress, getSegmentUpdate, getMaterialChangeRequestList, getServiceChangeRequestList, getIncidentReport, getUploadedDocument, approveSegment} = require('./segment_service');
require('dotenv').config();


const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //get dashboard count
    getCounts: async (req, res, next) => {
        try {
            const body = req.query.segment_id;
            const result = await getCounts(body);

            return res.json({
                success: true,
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get material change request
    getMaterialChangeRequest: async (req, res, next)=>{
        try{
            const body  = req.query.segment_id;
            const result = await getMaterialChangeRequest(body);
            return res.json({
                success:true,
                data:result,
            });
        }catch (e) {
            next(e);
        }
    },

    // get service change request
    getServiceChangeRequest: async (req, res, next)=>{
        try{
            const body = req.query.segment_id;
            const result = await getServiceChangeRequest(body);
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
            const body = req.query.segment_id;
            const result = await getSegmentBudget(body);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e);
        }
    },

    //get material usage
    getMaterialUsage: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await  getMaterialUsage(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },

// get service progress
    getServiceProgress: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await  getServiceProgress(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
 //segment updates
    getSegmentUpdate: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await  getSegmentUpdate(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
// material change request
    getMaterialChangeRequestList: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await getMaterialChangeRequestList(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
    // service change request
    getServiceChangeRequestList: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await getServiceChangeRequestList(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
// get incident report
    getIncidentReport: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await getIncidentReport(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
   //get uploaded documents
    getUploadedDocument: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await getUploadedDocument(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
    //approve segment
    approveSegment: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await approveSegment(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
    //upload closure documents
    uploadClosureDocuments: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await uploadClosureDocuments(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },

}
