const {createBom,deleteBom,getBom, getBoms,updateBom,approveMaterialChangeRequest,getMaterialByItemCode,getAllMaterials,createWarehouse} = require('./bom.controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../authentication/tokenValidation");
//get validation
// const {addUserValidation} = require('../../validation/users/user.validation');


// create project_bom
router.post("/", checkToken,createBom);

//get project_bom
router.get("/getBom",checkToken,getBom);

//get project_bom
router.get("/",checkToken,getBoms);

//update project_bom
router.patch("/",checkToken, updateBom);

//delete project_bom
router.delete("/",checkToken, deleteBom);
//approved material change request
router.post("/approveMaterialChangeRequest", checkToken, approveMaterialChangeRequest);
//get all material details from warehouse
router.post("/getMaterialByItemCode", checkToken, getMaterialByItemCode);
//get all materials from warehouse
router.post("/getAllMaterials", checkToken, getAllMaterials);
//create a virtual warehouse
router.post("/createWarehouse", checkToken, createWarehouse);


module.exports = router;
