const {getRoles,getSlaTracking} = require('./other.controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');

//get user roles
router.get("/roles",checkToken,getRoles);
router.get("/sla_tracking",checkToken,getSlaTracking);


module.exports = router;
