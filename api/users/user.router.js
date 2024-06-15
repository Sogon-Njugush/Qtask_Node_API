const {createUser,deleteUser,getUser,getUsers,updateUser, login} = require('./user.controller');
const router = require('express').Router();

//validate token
const { checkToken} = require("../../auth/token_validation")

// create user
router.post("/", checkToken, createUser);

//get users
router.get("/", checkToken, getUsers);

//get user
router.get("/:id",checkToken,getUser);

//update user
router.patch("/",checkToken, updateUser);

//delete user
router.delete("/",checkToken, deleteUser);

//user login
router.post("/login",login)

module.exports = router;
