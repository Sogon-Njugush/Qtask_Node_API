const {getRoles,getSlaTracking} = require('./other.service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
//get roles
    getRoles: async (req, res, next)=>{
        try{
            const body  = req;
            const result = await getRoles(body);
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
    //sla tracking
    getSlaTracking: async (req, res, next)=>{
        try{
            //const body  = req;
            const result = await getSlaTracking();
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
    }
// end
}
