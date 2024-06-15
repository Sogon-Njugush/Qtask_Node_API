require('dotenv').config();
const express = require('express');
const app = express();
const userRouter = require("./api/users/user.router");

app.use(express.json());
app.use("/api/users", userRouter);

app.listen(process.env.SERVER_PORT, ()=>{
    console.log(`server up and running on Port : ${process.env.SERVER_PORT}`);
});
