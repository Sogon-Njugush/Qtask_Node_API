require('dotenv').config();
const express = require('express');
const app = express();
const userRouter = require("./api/users/user.router");
const bomRouter = require("./api/project_bom/bom.router");
const projectRouter = require("./api/project/project.router");
const segmentRouter = require("./api/project_segment/segment.router");
const projectServiceRouter = require("./api/project_company_service/project_router");
const segmentServiceRouter = require("./api/project_segment_service/segment_router");
const segmentBomRouter = require("./api/project_segment_bom/bom_router");
const bomKpiRouter = require("./api/project_bom_kpi/bom_kpi_router");
const serviceKpiRouter = require("./api/project_service_kpi/service_kpi_router");
const segmentJobCard = require("./api/project_job_card/jobCard_router");
const casualTask = require("./api/project_casual_task/casualTask_router");
const closeSegment = require("./api/project_close_segment/closeSegment_router");

const logger = require("./config/logger");
const AppError = require("./utils/appError");

app.use(express.json());

app.use((req,res, next)=>{
   logger.info(req.body);
   let oldSend = res.send;
   res.send = function (data) {
      logger.info(JSON.parse(data)),
          oldSend.apply(res, arguments);
   }
   next();
})
// project file folders
//users
app.use("/api/users", userRouter);
//project_bom
app.use("/api/project_bom", bomRouter);
//project
app.use("/api/project",projectRouter);
//project_segment
app.use("/api/project_segment",segmentRouter);
//company services
app.use("/api/project_company_service", projectServiceRouter);
//segment_services
app.use("/api/project_segment_service", segmentServiceRouter);
// project_segment_bom
app.use("/api/project_segment_bom", segmentBomRouter);
//project_bom kpi
app.use("/api/project_bom_kpi",bomKpiRouter);
//service kpi
app.use("/api/project_service_kpi", serviceKpiRouter);
//project_segment Job card
app.use("/api/project_job_card", segmentJobCard);
//casual task
app.use("/api/project_casual_task", casualTask);
// close project_segment
app.use("project_close_segment", closeSegment);


app.all("*", (req, res, next)=>{
   const  err = new AppError(`Requested URL ${req.path} not found!`, 404);
   next(err);
});

app.use((err, req, res, next)=>{
   const statusCode = err.statusCode || 600;
   res.status(statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack
   })
})

app.listen(process.env.SERVER_PORT, ()=>{
   logger.log('info',`server up and running on Port : ${process.env.SERVER_PORT}`);
});
