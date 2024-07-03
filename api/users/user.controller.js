const {create,getUsers,getUser,updateUser,deleteUser, getUserByEmail} = require('./user.service');
const {genSaltSync,hashSync,compareSync} = require('bcrypt');
require('dotenv').config();
const AppError  = require("../../utils/appError");
const {sign} = require('jsonwebtoken');

module.exports = {
    //create user
    createUser: async (req, res, next) =>{
        try{
            const body = req.body;
            const salt = genSaltSync(10);
            body.user_password = hashSync(body.user_password, salt);
            const result = await create(body);
            return res.json({
                success:true,
                massage: "User created Successfully!",
                data:result
            });
        }catch (e) {
          next(e);
        }
       },


    //get user
    getUser: async (req, res, next)=>{
        try{
            const id  = req.params.id;
            const result = await getUser(id);
            if(!result.length){
                throw new AppError("Error not found!",403);
            }
            return res.json({
                success:true,
                data:result,
            });
        }catch (e) {
          next(e);
        }
    },


    //get users
    getUsers: async (req, res, next)=>{
        try{
            const result = await getUsers();
            return res.json({
                success: true,
                data: result,
            });
        }catch (e) {
            next(e);
        }
    },

    //update user
    updateUser: async (req, res)=>{
        try{
            const body = req.body;
            const salt = genSaltSync(10);
            body.user_password = hashSync(body.user_password, salt);
            const result = await updateUser(body);
            return res.json({
                success:true,
                data: "User details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete users
    deleteUser: async (req, res)=>{
        try{
            const data = req.body;
            const result = await  deleteUser(data);
            return res.json({
                success:true,
                data: "User deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },
    //login controller
    login: (req, res) =>{
        const body = req.body;
        getUserByEmail(body.user_email, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message:"internal server error!"
                })
            }
            if(!results){
                return res.status(500).json({
                    success:false,
                    data: "Invalid email or password!"
                });
            }
            const  result = compareSync(body.user_password, results.user_password);
            if(result){
                results.user_password = undefined;
                const payload ={user:results};
                const jsontoken = sign(payload,process.env.AUTH_Token_KEY, {
                    expiresIn: "6h",
                });

                return res.json({
                    success: true,
                    message: "Login successfully!",
                    data: results,
                    token: jsontoken
                });
            }else{
                return res.json({
                    success: false,
                    message: "Invalid email or password!",
                });
            }
        });
    }
// end
}
