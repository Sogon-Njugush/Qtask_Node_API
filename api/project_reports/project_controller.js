const {getCount, getTopClients, getServiceReport} = require('./project_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project
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

    //get top clients
    getTopClients: async (req, res, next)=>{
        try{
            const body  = req.query.company_id;
            const result = await getTopClients(body);
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
    //get service management data
    getServiceReport:async (req, res, next)=>{
        try{
            const body  = req.query.company_id;
            const result = await getServiceReport(body);
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
