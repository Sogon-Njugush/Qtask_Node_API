const {createBom,getBom, getBoms,updateBom,deleteBom} = require('./bom.service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project_bom
    createBom: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await createBom(body);
            if(!result.length){
                throw new AppError("Error not found!",403);
            }
            return res.json({
                success:true,
                massage: "Segment Bom created Successfully!",
                data:result
            });
        }catch (e) {
            next(e);
        }
    },

    //get project_bom
    getBom: async (req, res, next)=>{
        try{
            const body  = req.query.bom_id;
            const result = await getBom(body);
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
    // get boms
    getBoms: async (req, res, next)=>{
        try{
            const body = req.query.segment_id;
            const result = await getBoms(body);
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

    //update project_bom
    updateBom: async (req, res)=>{
        try{
            const body = req.body;
            const result = await updateBom(body);
            return res.json({
                success:true,
                data: "BOM details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_bom
    deleteBom: async (req, res)=>{
        try{
            const data = req.query.bom_id;
            const result = await  deleteBom(data);
            return res.json({
                success:true,
                data: "BOM Details deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
