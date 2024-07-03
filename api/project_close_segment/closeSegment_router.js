const {closeSegment} = require('./closeSegment_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../auth/token_validation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');

//update
router.patch("/",checkToken, closeSegment);

module.exports = router;
