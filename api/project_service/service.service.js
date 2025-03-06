const pool = require('../../config/database');


module.exports = {
    //create project service
    createProjectService: (data) =>{
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO project_service(service_name,company_id,service_description,service_status,service_create_date) VALUES (?,?,?,?,?)`,
                [data.service_name,data.company_id,data.service_description,'Active',data.create_date],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    //get project service
    getProjectServices:  (company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT * FROM project_service WHERE company_id= ? AND service_status='Active'`, [company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get project service by id
    getProjectService: (segment_service_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT * FROM project_service WHERE segment_service_id = ?`, [segment_service_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update project service
    updateProjectService: (data) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE project_service SET service_name=?,service_description=? WHERE segment_service_id = ?`,
                [data.service_name, data.service_description,data.segment_service_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete project service
    deleteProjectService: (project_service_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE project_service SET service_status=? WHERE bom_material_id= ?`,['Deleted',project_service_id],
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
