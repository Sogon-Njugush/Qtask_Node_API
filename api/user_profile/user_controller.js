const {getUserDetails} = require('./user_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    // get users details
    getUserDetails: async (req, res, next)=>{
        try{
            const body = req.query.user_id;
            const result = await getUserDetails(body);
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

    // end
}
