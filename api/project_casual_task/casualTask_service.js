const pool = require('../../config/database');

module.exports = {
    //create a casual task entry
    createCasualTask: (casualTasks) => {
        const payDate = 'Pending';
        const payBy = 'Pending';

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

                    const query = `INSERT INTO Casual_task
                    (Casual_attendance_id,Casual_rate,Casual_service_id,Casual_service_quantity,Casual_payment_status,Casual_payment_date,Casual_payed_by,Casual_supervised_by)
                    VALUES ?`;

                    const values = casualTasks.map(data => [
                        data.casual_attendance_id, data.casual_rate,data.casual_service_id,data.casual_service_quantity,data.casual_payment_status,payDate,payBy,data.user_id
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

    //get casual tasks
    getCasualTasks: (data) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT Casual_task.*, Casual_account.*,project_service.*,Casual_attendance.* FROM Casual_task
INNER JOIN Casual_attendance ON Casual_attendance.Casual_attendance_id=Casual_task.Casual_attendance_id
INNER JOIN Users ON Users.user_id=Casual_attendance.Casual_registered_by 
INNER JOIN Casual_account ON Casual_attendance.Casual_Id=Casual_account.Casual_account_id
INNER JOIN project_service ON project_service.Casual_Id=Casual_task.Casual_service_id
WHERE Casual_attendance.Casual_segment_id=?`,
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
    //get Casual Task by id
    getCasualTask: (data) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT Casual_task.*, Casual_account.*,project_service.*,Casual_attendance.* FROM Casual_task
INNER JOIN Casual_attendance ON Casual_attendance.Casual_attendance_id=Casual_task.Casual_attendance_id
INNER JOIN Users ON Users.user_id=Casual_attendance.Casual_registered_by 
INNER JOIN Casual_account ON Casual_attendance.Casual_Id=Casual_account.Casual_account_id
INNER JOIN project_service ON project_service.Casual_Id=Casual_task.Casual_service_id
WHERE Casual_task.Casual_task_id =?`, [data.Casual_task_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update casual Task
    updateCasualTask: (data) =>{
        const dateTime = new Date();
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE Casual_task SET Casual_rate=?,Casual_service_id=?,Casual_service_quantity=? WHERE Casual_task_id=?`,
                [data.casual_rate,data.casual_service_id,data.service_quantity,data.Casual_task_id],
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
    deleteCasualTask: (data)=>{
        const dateTimeOut = new Date();
        return new Promise((resolve,reject) => {
            pool.query(
                `DELETE FROM Casual_task WHERE Casual_task_id= ?`,[data.Casual_task_id],
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
