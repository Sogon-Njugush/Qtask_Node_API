const {create,getUsers,getUser,updateUser,deleteUser, getUserByEmail} = require('./user.service');
const {genSaltSync,hashSync,compareSync} = require('bcrypt');
require('dotenv').config();

const {sign} = require('jsonwebtoken');

module.exports = {
    //create user
    createUser: (req, res) =>{
        const body = req.body;
        const salt = genSaltSync(10);
        body.user_password = hashSync(body.user_password, salt);

        create(body, (err, results)=>{
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: true,
                    message:"Database connection error!",
                });
            }
            return  res.status(200).json({
                success:true,
                massage: "User created Successfully!",
                data:results
            });
        });
    },


    //get user
    getUser: (req, res)=>{
        const id  = req.params.id;
        getUser(id, (err, results)=>{
            if(err){
               console.log(err);
               return res.status(500).json({
                   success:false,
                   message:"Error getting User",
               });
            }
            if(!results){
                return res.json({
                    success: false,
                    message: "Record not Found",
                });
            }
            return  res.status(200).json({
                success:true,
                data:results,
            });
        }
        );
    },


    //get users
    getUsers: (req, res)=>{
        getUsers((err, results) => {
            if(err){
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message:"Error getting Users",
                });
            }
            if(!results){
                return res.json({
                    success: false,
                    message: "No Record Found",
                });
            }
            return res.status(200).json({
                success: true,
                data: results,
            });
        });
    },


    //update user
    updateUser: (req, res)=>{
        const body = req.body;
        const salt = genSaltSync(10);
        body.user_password = hashSync(body.user_password, salt);
        updateUser(body, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }
            if(!results){
                return  res.json({
                    success: false,
                    message: "Failed to update use details"
                });
            }
            return res.json({
                success:true,
                message: "Updated successfully"
            });
        });

},

    //delete users
    deleteUser: (req, res)=>{
        const data = req.body;
        deleteUser(data, (err, results)=>{
            if(err){
                console.log(err);
                return;
            }
            if(!results){
                return res.json({
                    success: false,
                    message: 'Record not found',
                });
            }
            return res.json({
                success:true,
                message: "User deleted successfully",
            });
        });
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
                    expiresIn: "1h",
                });

                return res.json({
                    success: true,
                    message: "Login successfully!",
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
