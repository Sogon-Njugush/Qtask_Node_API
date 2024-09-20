const {createJobCard,getJobCard, getJobCards,updateJobCard,deleteJobCard} = require('./jobCard_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project Job card
    createJobCard: async (req, res, next) => {
        try {
            const jobCards = req.body; // Expecting an array of segments
            const result = await createJobCard(jobCards);

            return res.json({
                success: true,
                message: "Job card Added successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get project_segment job card by id
    getJobCard: async (req, res, next)=>{
        try{
            const body  = req.query;
            const result = await getJobCard(body);
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

    // get all project_segment job Cards
    getJobCards: async (req, res, next)=>{
        try{
            const body = req.query;
            const result = await getJobCards(body);
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

    //update job card
    updateJobCard: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateJobCard(body);
            return res.json({
                success:true,
                data: "Segment Job card details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete  project_segment job card
    deleteJobCard: async (req, res, next)=>{
        try{
            const data = req.query.project_job_card_id;
            const result = await  deleteJobCard(data);
            return res.json({
                success:true,
                data: "Segment Job Card Deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
