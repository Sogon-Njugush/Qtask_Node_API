const pool = require('../../config/database');

module.exports = {
    //create project_segment service
    createService: (services) => {
        const dateTime = new Date();

        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    return reject(err);
                }

                connection.beginTransaction((err) => {
                    if (err) {
                        connection.release();
                        return reject(err);
                    }

                    const query = `INSERT INTO segment_implemetation_service
                    (service_type,quantity,service_rate,start_date,end_date,segment_id,user_id,service_create_date,service_status)
                    VALUES ?`;

                    const values = services.map(data => [
                        data.service_id, data.service_quantity,data.service_rate, data.service_start_date, data.service_end_date, data.service_segment_id, data.service_user_id,dateTime,data.service_status
                    ]);

                    connection.query(query, [values], (error, results, fields) => {
                        if (error) {
                            return connection.rollback(() => {
                                connection.release();
                                return reject(error);
                            });
                        }

                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return reject(err);
                                });
                            }

                            connection.release();
                            return resolve(results);
                        });
                    });
                });
            });
        });
    },

    //get services
    getServices:  (segment_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    project_service.service_name,
    segment_implemetation_service.*,
    COALESCE((
        SELECT SUM(service_change_quantity)
        FROM segment_service_change_request 
        WHERE 
            segment_service_change_request.segment_id = segment_implemetation_service.segment_id
            AND segment_service_change_request.service_id = segment_implemetation_service.service_type
            AND segment_service_change_request.service_change_status = 'Approved'
    ), 0) AS change_request
FROM 
    segment_implemetation_service
INNER JOIN 
    project_service 
ON 
    segment_implemetation_service.service_type = project_service.segment_service_id
WHERE 
    segment_implemetation_service.segment_id = ?`,
                [segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get Service by id
    getService: (implementation_service_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT project_service.service_name,segment_implemetation_service.* FROM segment_implemetation_service
INNER JOIN project_service ON segment_implemetation_service.service_type=project_service.segment_service_id
WHERE segment_implemetation_service.implementation_service_id=?`, [implementation_service_id],
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
                `UPDATE segment_implemetation_service SET service_type=?,quantity=?,start_date=?,end_date=? WHERE implementation_service_id=?`,
                [data.service_id,data.service_quantity,data.service_start_date,data.service_end_date,data.implementation_service_id],
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
    deleteService: (implementation_service_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE segment_implemetation_service SET service_status= "Deleted" WHERE implementation_service_id= ?`,[implementation_service_id],
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
