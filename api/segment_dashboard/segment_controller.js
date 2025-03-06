const {getCounts, getMaterialChangeRequest, getMaterialUsage, getServiceChangeRequest, getWorkLoad,uploadClosureDocuments,
    getServiceProgress, getSegmentUpdate, getMaterialChangeRequestList, getServiceChangeRequestList, getIncidentReport,
    getUploadedDocument, approveSegment,uploadSegmentDocuments,getSegmentDocuments,getSegmentMap} = require('./segment_service');
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
    // upload closure documents
    uploadClosureDocuments: async (req, res, next) => {
        try {
            const data = req.body; // data from the request body
            const files = req.files; // assuming multiple files upload

            // Check if files are uploaded
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No files uploaded",
                });
            }

            // Extract file information (e.g., file paths)
            const uploadedFiles = files.map(file => file.filename); // array of file names/paths

            // Here you can save the file details (e.g., paths) to your database along with other data
            const result = await uploadClosureDocuments({
                ...data,          // spread other form data
                uploadedFiles     // include uploaded file names/paths in the data object
            });

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },
// upload segment documents
    uploadSegmentDocuments: async (req, res, next) => {
        try {
            const data = req.body; // data from the request body
            const files = req.files; // assuming multiple files upload

            // Check if files are uploaded
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No files uploaded",
                });
            }

            // Extract file information (e.g., file paths)
            const uploadedFiles = files.map(file => file.filename); // array of file names/paths

            // Here you can save the file details (e.g., paths) to your database along with other data
            const result = await uploadSegmentDocuments({
                ...data,          // spread other form data
                uploadedFiles     // include uploaded file names/paths in the data object
            });

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },
    //get segment file
    getSegmentDocuments: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await getSegmentDocuments(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
    // segment map
    getSegmentMap: async (req, res, next) => {
        try {
            const { segment_id, select_status, start_date, end_date } = req.query; // Extract query parameters

            // Validate segment_id
            if (!segment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Segment ID is required',
                });
            }

            // Call the service function
            const result = await getSegmentMap(segment_id, select_status, start_date, end_date);

            // Return the response
            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e); // Pass errors to the error-handling middleware
        }
    },

}
