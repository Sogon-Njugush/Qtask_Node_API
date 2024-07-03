const pool = require('../../config/database');


module.exports = {
    //create service
    createService: (data) =>{
        const dateTime = new  Date();

        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO project_service(service_name,company_id,service_description,service_status,service_create_date) VALUES (?,?,?,?,?)`,
                [data.service_name,data.company_id,data.service_description,data.service_status,dateTime],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    //get service
    getServices:  (company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT * FROM project_service WHERE company_id=?`, [company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get service by id
    getService: (service_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT * FROM project_service WHERE segment_service_id=?`, [service_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update service
    updateService: (data) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE project_service SET service_name=?,service_description=?,service_status=? WHERE segment_service_id = ?`,
                [data.service_name, data.service_description, data.service_status, data.service_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete service
    deleteService: (data)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE project_service SET service_status='Deleted' WHERE segment_service_id= ?`,[data.service_id],
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
