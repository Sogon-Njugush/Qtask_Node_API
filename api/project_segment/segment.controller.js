const {createSegment,getSegment, getSegments,updateSegment,deleteSegment} = require('./segment.service');
require('dotenv').config();
const AppError  = require("../../util/appError");
const {createProject} = require("../project/project.service");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project_segment
    createSegment: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await createSegment(body);
            // if(!result.length){
            //     throw new AppError("Error not found!",403);
            // }
            return res.json({
                success:true,
                massage: "Project created Successfully!",
                data:result
            });
        }catch (e) {
            next(e);
        }
    },

    //segment array
    // createSegment: async (req, res, next) => {
    //     try {
    //         const segments = req.body; // Expecting an array of segments
    //         const result = await createSegment(segments);
    //
    //         return res.json({
    //             success: true,
    //             message: "Segments created successfully!",
    //             data: result
    //         });
    //     } catch (e) {
    //         next(e);
    //     }
    // },

    //get project_segment
    getSegment: async (req, res, next)=>{
        try{
            const body  = req.query.segment_id;
            const result = await getSegment(body);
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
    // get project_segment
    getSegments: async (req, res, next)=>{
        try{
            const body = req.query.project_id;
            const result = await getSegments(body);
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

    //update project_segment
    updateSegment: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateSegment(body);
            return res.json({
                success:true,
                data: "Segment details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_segment
    deleteSegment: async (req, res, next)=>{
        try{
            const data = req.query.segment_id;
            const result = await  deleteSegment(data);
            return res.json({
                success:true,
                data: "Segment deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
