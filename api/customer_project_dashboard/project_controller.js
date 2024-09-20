const {getInfo, getProjects} = require('./project_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project
    getInfo: async (req, res, next) =>{
        try{
            const body = req.query.customer_id;
            const result = await getInfo(body);
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

    //get project
    getProjects: async (req, res, next)=>{
        try{
            const body  = req.query.customer_id;
            const result = await getProjects(body);
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
