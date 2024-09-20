require('dotenv').config();
const {verify} = require("jsonwebtoken");

module.exports ={
    checkToken: (req, res, next) =>{
        let token = req.get("authorization");
           if(token){
               token = token.slice(7);
               verify(token,process.env.AUTH_Token_KEY,(err, decoded) =>{
                   if(err){
                       res.json({
                           success: false,
                           message:"Invalid Token"
                       });
                   }
                   else {
                       next();
                   }
               });

        }else{
            res.json({
                success: false,
                message: "Access denied! Unauthorized user"
            })
        }
    }
}
