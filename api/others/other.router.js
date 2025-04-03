const {getRoles,getSlaTracking,updateUser,getUserRoles,createUserRole,deleteUserRole,getUserRole,updateUserRole,activateUserRole} = require('./other.controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');

//get user roles
router.get("/roles",checkToken,getRoles);

router.get("/sla_tracking",checkToken,getSlaTracking);

router.patch("/update_user",checkToken,updateUser);

router.post("/createUserRole",checkToken,createUserRole);

router.get("/getUserRoles",checkToken,getUserRoles);

router.get("/getUserRolesById",checkToken,getUserRole);

router.patch("/updateUserRole",checkToken,updateUserRole);

router.delete("/disableUserRole",checkToken,deleteUserRole);

router.delete("/activateUserRole",checkToken,activateUserRole);


module.exports = router;
