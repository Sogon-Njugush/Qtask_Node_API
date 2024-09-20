const {closeSegment} = require('./closeSegment_service');
require('dotenv').config();
const AppError  = require("../../util/appError");
// const {sign} = require('jsonwebtoken');

module.exports = {
    //update casual tasks
    closeSegment: async (req, res, next)=>{
        try{
            const body = req.body;
            const result = await closeSegment(body);
            return res.json({
                success:true,
                data: "Segment Closed successfully",
            });
        }catch (e) {
            next(e);
        }
    },

// end
}
