require("dotenv").config();
const express = require("express");
const upload = require("express-fileupload");
// const cors = require('cors')
const app = express();

//service api
// const userRouter = require("./api/users/user.router");
// const servicesRouter = require("./api/services/services.router");
// const customerRouter = require("./api/customers/customers.router");
// const radarRouter = require("./api/radar/radar.router");
// const companyRouter = require("./api/company/company.router");
// const moduleRouter = require("./api/module/module.router");
// const ticketingRouter = require("./api/ticketing/ticketing.router");
//service api

//projects apis
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
const projectAssign = require("./api/project_assign/assign_router");
const projectMainDashboard = require("./api/project_main_dashboard/project_router");
const projectDashboard = require("./api/project_dashboard/project_router");
const segmentDashboard = require("./api/segment_dashboard/segment_router");
const customerDashboard = require("./api/customer_project_dashboard/project_router");
//end of project Apis
const logger = require("./config/logger");
const AppError = require("./util/appError");
// const errorController = require("./util/errorController");


app.use(express.json());
// app.use(cors());
app.use(upload());

app.use((req, res, next) => {
    let oldSend = res.send;
    res.send = function (data) {
        if(JSON.parse(data).success === 0){
            logger.error(JSON.parse(data));
        }
        logger.info(JSON.parse(data));
        oldSend.apply(res, arguments);
    }
    next();
})



//service router
// app.use("/api/users", userRouter);
// app.use("/api/services", servicesRouter);
// app.use("/api/customers", customerRouter);
// app.use("/api/radar", radarRouter);
// app.use("/api/company", companyRouter);
// app.use("/api/module", moduleRouter);
// app.use("/api/ticketing", ticketingRouter);
//service router

// project file routers
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
//project assign
app.use("/api/project_assign",projectAssign);
//project main dashboard
app.use("/api/project_main_dashboard",projectMainDashboard);
//project dashboard
app.use("/api/project_dashboard",projectDashboard);
//segment dashboard
app.use("/api/segment_dashboard",segmentDashboard);
//clients dashboard
app.use("/api/customer_dashboard",customerDashboard);


app.all('*', (req, res, next) => {
    const  err = new AppError(`Requested URL ${req.path} not found!`, 404);
    next(err);
})


app.use((err, req, res, next)=>{
    const statusCode = err.statusCode || 600;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: err.stack
    })
})
// app.use(errorController);

app.listen(process.env.SERVER_PORT, ()=>{
    logger.log('info',`server up and running on Port : ${process.env.SERVER_PORT}`);
});
