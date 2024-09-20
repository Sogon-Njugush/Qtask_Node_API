const pool = require('../../config/database');

module.exports = {
    //create a jobcard entry
    createJobCard: (jobCards) => {
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

                    const query = `INSERT INTO project_job_card
                    (segment_id,coordinates,comment,image,user_id,job_type,date_created,service_id,service_quantity)
                    VALUES ?`;

                    const values = jobCards.map(data => [
                        data.segment_id, data.coordinates,data.comment,data.jobcard_image,data.job_type,dateTime,data.service_id,data.quantity
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

    //get project_segment job cards
    getJobCards: (data) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT project_job_card.*,CONCAT(Users.user_firstname,' ',Users.user_lastname) AS user_name,project_service.*,project_segment.segment_name FROM project_job_card
INNER JOIN Users ON Users.user_id=project_job_card.user_id  
INNER JOIN project_service ON project_service.segment_service_id=project_job_card.service_id
INNER JOIN project_segment ON project_segment.segment_id=project_job_card.segment_id
WHERE project_job_card.segment_id=?`,
                [data.segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get Job Card by id
    getJobCard: (data) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT project_job_card.*,CONCAT(Users.user_firstname,' ',Users.user_lastname) AS user_name,project_service.*,project_segment.segment_name FROM project_job_card
INNER JOIN Users ON Users.user_id=project_job_card.user_id  
INNER JOIN project_service ON project_service.segment_service_id=project_job_card.service_id
INNER JOIN project_segment ON project_segment.segment_id=project_job_card.segment_id
WHERE project_job_card.project_job_card_id =?`, [data.project_job_card_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update Attendance
    updateJobCard: (data) =>{
        const dateTime = new Date();
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE project_job_card SET coordinates=?,comment=?,image=?,title=?,job_type=?,date_created=?,service_id=?,service_quantity=? WHERE project_job_card_id=?`,
                [data.coordinates,data.comment,data.jobcard_image,data.jobcard_title,data.job_type,dateTime,data.service_id,data.quantity, data.project_job_card_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete Attendance
    deleteJobCard: (project_job_card_id)=>{
        const dateTimeOut = new Date();
        return new Promise((resolve,reject) => {
            pool.query(
                `DELETE FROM project_job_card WHERE project_job_card_id= ?`,[project_job_card_id],
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
