const {getUserDetails} = require('./user_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');

//get project_bom
router.get("/",checkToken,getUserDetails);

module.exports = router;
