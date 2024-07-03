const {createBom,getBom, getBoms,updateBom,deleteBom} = require('./bom_service');
require('dotenv').config();
const AppError  = require("../../utils/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project_segment
    createBom: async (req, res, next) => {
        try {
            const materials = req.body; // Expecting an array of segments
            const result = await createBom(materials);

            return res.json({
                success: true,
                message: "Material created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    //get project_segment project_bom by id
    getBom: async (req, res, next)=>{
        try{
            const body  = req.body;
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

    // get project_bom
    getBoms: async (req, res, next)=>{
        try{
            const body = req.body;
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

    //update project_segment project_bom
    updateBom: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await updateBom(body);
            return res.json({
                success:true,
                data: "material details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_segment project_bom
    deleteBom: async (req, res, next)=>{
        try{
            const data = req.body;
            const result = await  deleteBom(data);
            return res.json({
                success:true,
                data: "Material deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },

// end
}
