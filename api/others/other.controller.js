const {getRoles,getSlaTracking,updateUser,createUserRole,deleteUserRole,getUserRoles,getUserRole,updateUserRole,activateUserRole} = require('./other.service');
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
    },
    //update user controller remains the same
    updateUser: async (req, res, next) => {
        try {
            const body = req.body;

            const result = await updateUser(body);
            return res.json({
                success: true,
                data: "User details and roles updated successfully",
            });
        } catch (e) {
            next(e);
        }
    },
    // Create user role relationship
    createUserRole: async (req, res, next) => {
        try {
            const body = req.body; // Expecting user_id, role_id, and user_role_status
            const result = await createUserRole(body);

            return res.json({
                success: true,
                message: "User role created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    // Get user role relationship by ID
    getUserRole: async (req, res, next) => {
        try {
            const { user_role_id } = req.query;
            const result = await getUserRole(user_role_id);

            if (!result) {
                throw new AppError("User role not found!", 404);
            }

            return res.json({
                success: true,
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    // Get all user role relationships (optionally filtered by user_id or role_id)
    getUserRoles: async (req, res, next) => {
        try {
            const {user_id} = req.query;
            const result = await getUserRoles(user_id);

            return res.json({
                success: true,
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    // Update user role relationship
    updateUserRole: async (req, res, next) => {
        try {
            const body = req.body;
            const result = await updateUserRole(body);

            return res.json({
                success: true,
                message: "User role  updated successfully",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    // Delete user role relationship
    deleteUserRole: async (req, res, next) => {
        try {
            const { user_role_id } = req.query;
            const result = await deleteUserRole(user_role_id);

            return res.json({
                success: true,
                message: "User role deactivated successfully",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },
    // Activate user role relationship
    activateUserRole: async (req, res, next) => {
        try {
            const { user_role_id } = req.query;
            const result = await activateUserRole(user_role_id);

            return res.json({
                success: true,
                message: "User role activated successfully",
                data: result
            });
        } catch (e) {
            next(e);
        }
    }

// end
}
