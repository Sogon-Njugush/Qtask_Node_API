const pool = require('../../config/database');

module.exports = {
    //create service kpi
    createServiceKpi: (materials) => {
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

                    const query = `INSERT INTO service_kpi
                    (segment_id,service_implementation_id,user_id,kpi_create_date,service_kpi_status)
                    VALUES ?`;

                    const values = materials.map(data => [
                        data.segment_id, data.service_id,data.user_id,dateTime,data.service_status
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

    //get service kpi
    getServiceKpis: (segment_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT project_segment.segment_name,service_type.service_name, service_kpi.* FROM service_kpi
INNER JOIN project_segment ON project_segment.segment_id=service_kpi.segment_id
INNER JOIN service_type ON service_type.service_type_id = service_kpi.service_implementation_id
WHERE service_kpi.segment_id=?`,
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
    //get service Kpi by id
    getServiceKpi: (service_kpi_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT project_segment.segment_name,project_service.service_name, service_kpi.* FROM service_kpi
INNER JOIN project_segment ON project_segment.segment_id=service_kpi.segment_id
INNER JOIN project_service ON project_service.segment_service_id = service_kpi.service_implementation_id
WHERE service_kpi.service_kpi_id=?`, [service_kpi_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update service kpi
    updateServiceKpi: (data) =>{
        const dateTime = new Date();
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE service_kpi SET service_implementation_id=?,user_id=?,kpi_create_date=?, service_kpi_status=? WHERE service_kpi_id=?`,
                [data.service_id,data.user_id,dateTime,data.service_status, data.service_kpi_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete project_segment service kpi
    deleteServiceKpi: (service_kpi_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE service_kpi SET service_kpi_status= "Deleted" WHERE service_kpi_id= ?`,[service_kpi_id],
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
