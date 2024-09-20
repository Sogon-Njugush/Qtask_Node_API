const {getCount, getTopClients,getServiceReport} = require('./project_controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.get("/count", checkToken,getCount);
//get project_bom
router.get("/topClients",checkToken,getTopClients);
//get segment_data report
router.get("/serviceReport",checkToken,getServiceReport);

module.exports = router;
