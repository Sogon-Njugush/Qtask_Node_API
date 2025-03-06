const {getCount, getMTTR, getRecentUpdate, getTicketTraffic,getBreached,getBreachedAnalysis,getTicketListByStatus,getReportByRegion,
    getReportCounts,getTechnicianReport,getTicketSLAStatus,reAssignTicket,holdTicket,updateTicket,activateTicket,
    closeTicket,reOpenTicket,completeTicket,getMap, getHeatMap,createNocComment,getNocComment,deleteNocComment,
    updateNocComment,addNocComment,getMapDistribution,updateSite,deleteTicket,getSiteById,activeTechnician} = require('./maintenance_service');
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
    //sla monitoring query
    getTicketSLAStatusController: async (req, res, next) => {
        try {
            const result = await getTicketSLAStatus();  // No company_id needed

            if (!result.length) {
                return res.status(404).json({
                    success: false,
                    message: "No data found."
                });
            }

            // Return success response
            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);  // Pass error to next middleware (error handler)
        }
    },
    //ticket reassigned
    reAssignTicket: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await reAssignTicket(body);
            return res.json({
                success:true,
                data: "Ticket Re-assigned successfully",
            });
        }catch (e) {
            next(e);
        }
    },
    //hold ticket
    holdTicket: async (req, res, next) => {
        try {
            const body = req.body;
            const result = await holdTicket(body); // Assuming this function is properly imported
            return res.json({
                success: true,
                data: "Ticket hold made successfully!", // Include the success message from the service
            });
        } catch (e) {
            next(e); // Pass the error to the error handling middleware
        }
    },
    //update ticket
    updateTicket: async (req, res, next) => {
        try {
            const body = req.body;
            const result = await updateTicket(body); // Assuming this function is properly imported
            return res.json({
                success: true,
                data: "Ticket details Updated Successfully!", // Include the success message from the service
            });
        } catch (e) {
            next(e); // Pass the error to the error handling middleware
        }
    },
   //close ticket
    closeTicket: async (req, res, next) => {
        try {
            const body = req.body;
            const result = await closeTicket(body); // Assuming this function is properly imported
            return res.json({
                success: true,
                data: "Ticket Closed Successfully!", // Include the success message from the service
            });
        } catch (e) {
            next(e); // Pass the error to the error handling middleware
        }
    },
    //re-open ticket
    reOpenTicket: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await reOpenTicket(body);
            return res.json({
                success:true,
                data: "Ticket Re-Opened successfully",
            });
        }catch (e) {
            next(e);
        }
    },
    //complete ticket
    completeTicket: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await completeTicket(body);
            return res.json({
                success:true,
                data: "Ticket completed successfully",
            });
        }catch (e) {
            next(e);
        }
    },
    //ticket map
    getMap: async (req, res, next)=>{
        try{
            const data = req.query.ticket_id;
            const result = await  getMap(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },

    //activate ticket
    activateTicket: async (req, res, next) => {
        try {
            const body = req.body;
            const result = await activateTicket(body); // Assuming this function is properly imported
            return res.json({
                success: true,
                data: "Ticket Activated Successfully!", // Include the success message from the service
            });
        } catch (e) {
            next(e); // Pass the error to the error handling middleware
        }
    },
    //heat map
    getHeatMap: async (req, res, next)=>{
        try{
            const { from_date, to_date, client_id, service_type } = req.query;
            // Validate required parameters
            if (!from_date || !to_date || !client_id || !service_type) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required query parameters.",
                });
            }

            const result = await getHeatMap(from_date, to_date, client_id, service_type);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
    // create noc ticket comment
    createNocComment: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await createNocComment(body);
            return res.json({
                success:true,
                massage: "Comment Added Successfully!",
                data:result
            });
        }catch (e) {
            next(e);
        }
    },
    //get noc ticket comments
    getNocComment: async (req, res, next)=>{
        try{
            const body = req.query.ticket_id;
            const result = await getNocComment(body);
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
    //update noc ticket comment
    updateNocComment: async (req, res)=>{
        try{
            const body = req.body;
            const result = await updateNocComment(body);
            return res.json({
                success:true,
                data: "Comment updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete noc ticket comment
    deleteNocComment: async (req, res)=>{
        try{
            const data = req.query.ticket_noc_comment_id;
            const result = await  deleteNocComment(data);
            return res.json({
                success:true,
                data: "Comment deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },
    //add comment as a job card
    addNocComment: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await addNocComment(body);
            return res.json({
                success:true,
                massage: "Noc Comment Added Successfully!",
                data:result
            });
        }catch (e) {
            next(e);
        }
    },
    //update  ticket
    // updateTicket: async (req, res)=>{
    //     try{
    //         const body = req.body;
    //         const result = await updateTicket(body);
    //         return res.json({
    //             success:true,
    //             data: "Ticket Info Updated Successfully",
    //         });
    //     }catch (e) {
    //         next(e);
    //     }
    // },
    //tick distribution map
    getMapDistribution: async (req, res, next)=>{
        try{
            const { from_date, to_date, client_id, service_type,sla_status, ticket_status, site } = req.query;
            // Validate required parameters
            if (!from_date || !to_date || !client_id || !service_type || !sla_status || !ticket_status || !site) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required query parameters.",
                });
            }

            const result = await getMapDistribution(from_date, to_date, client_id, service_type,sla_status, ticket_status, site);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
    //update site
    updateSite: async (req, res)=>{
        try{
            const body = req.body;
            const result = await updateSite(body);
            return res.json({
                success:true,
                data: "Site updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },
    //get site by id
    getSiteById: async (req, res)=>{
        try{
            const data = req.query.site_id;
            const result = await getSiteById(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e);
        }
    },
    //delete ticket
    deleteTicket: async (req, res)=>{
        try{
            const data = req.query.ticket_id;
            const result = await deleteTicket(data);
            return res.json({
                success:true,
                data: "Ticket deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },
    activeTechnician: async (req, res)=>{
        try{
            const data = req.query.company_id;
            const result = await activeTechnician(data);
            return res.json({
                success:true,
                data: result,
            });
        }catch (e) {
            next(e)
        }
    },
    // end
}
