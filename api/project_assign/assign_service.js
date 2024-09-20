const pool = require('../../config/database');


module.exports = {
    //create Project
    //create Project
    createAssign: (supervisors) => {
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

                    const query = `INSERT INTO project_assign_user
                (segment_id, user_id, assigned_by, date_assigned, request_status, reject_reason, accept_date)
                VALUES ?`;

                    const values = supervisors.flatMap(data =>
                        data.supervisor_id.map(supervisor_id => [
                            data.segment_id,
                            supervisor_id,
                            data.user_id,
                            dateTime,
                            data?.assign_status ?? "",
                            data?.reject_reason ?? "",
                            data?.accept_date ?? ""
                        ])
                    );

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

    //get Assigns
    getAssigns:  (segment_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT project_assign_user.*, Users.user_firstname AS firstname,Users.user_lastname AS lastname FROM project_assign_user 
INNER JOIN project_segment ON project_segment.segment_id=project_assign_user.segment_id
INNER JOIN Users ON Users.user_id = project_assign_user.user_id
WHERE project_assign_user.segment_id=?`,
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

    //get segment_assign by id
    getAssign: (segment_assign_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT project_assign_user.*, Users.user_firstname.' '.Users.user_lastname AS username FROM project_assign_user 
INNER JOIN project_segment ON project_segment.segment_id=project_assign_user.company_id
INNER JOIN Users ON Users.user_id = project_assign_user.user_id
WHERE project_assign_user.segment_id=?`, [segment_assign_id],
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
    updateAssign: (data) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE project_assign_user SET segment_id=?,user_id=?,assigned_by=?,date_assigned=?,request_status=?,reject_reason=?,accept_date=? WHERE segment_assign_id= ?`,
                [data.segment_id,data.supervisor_id,data.user_id,dateTime,data.assign_status,data.reject_reason, data.accept_date,data.segment_assign_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete segment assign
    deleteAssign: (data)=>{
        const dateTime = new Date();
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE project_assign_user SET request_status= "Deleted", reject_reason=?, accept_date=? WHERE segment_assign_id= ?`,[data.reject_reason,dateTime, data.segment_assign_id],
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
