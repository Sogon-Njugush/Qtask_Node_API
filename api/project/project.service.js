const pool = require('../../config/database');


module.exports = {
    //create Project
    createProject: (data) =>{
        const dateTime = new  Date();
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO project
(project_name,project_code,company_id,project_customer_id,project_start_date,project_end_date,project_segment_number,project_description,project_region_id,project_po_file,project_ehs_file,project_permit,project_design,project_certificate_of_workers,project_manager_id,project_create_date,project_created_by,project_status) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
[data.project_name,data.project_code,data.company_id,data.customer_id,data.start_date,data.end_date,data.segment_number,data.project_description,data.region_id,
    data.po_file, data.ehs_file, data.permit_file, data.design_file, data.worker_cert,data.manager_id,dateTime,data.user_id,data.project_status],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    //get projects
    getProjects:  (company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT project.*, region.region_name, customer.customer_name FROM project 
INNER JOIN Company ON Company.company_id=project.company_id
INNER JOIN customer ON customer.customer_id = project.project_customer_id
INNER JOIN region ON region.region_id = project.project_region_id WHERE project.project_status!='Deleted' AND project.company_id=?`,
                [company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get Project by id
    getProject: (project_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT project.*, region.region_name, customer.customer_name FROM project 
INNER JOIN Company ON Company.company_id=project.company_id
INNER JOIN customer ON customer.customer_id = project.project_customer_id
INNER JOIN region ON region.region_id = project.project_region_id WHERE project.project_status!='Deleted' AND  project.project_id=?`, [project_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update project_bom
    updateProject: (data) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE project SET project_name=?,company_id=?,project_customer_id=?,project_start_date=?,project_end_date=?,project_segment_number=?,project_description=?,project_region_id=?,project_po_file=?,project_ehs_file=?,project_permit=?,project_design=?,project_certificate_of_workers=?,project_manager_id=?,project_created_by=?,project_status=? WHERE project_id = ?`,
                [data.project_name,data.company_id,data.customer_id,data.start_date,data.end_date,data.segment_number,data.project_description,data.region_id,
                    data.po_file, data.ehs_file, data.permit_file, data.design_file, data.worker_cert,data.manager_id,data.user_id,data.project_status,data.project_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete project_bom
    deleteProject: (data)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE project SET project_status= "Deleted" WHERE project_id= ?`,[data.project_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //end
};
