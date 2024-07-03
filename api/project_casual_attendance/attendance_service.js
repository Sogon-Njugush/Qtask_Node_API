const pool = require('../../config/database');

module.exports = {
    //create casual attendance
    createAttendance: (casuals) => {
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

                    const query = `INSERT INTO Casual_attendance
                    (Casual_id,Casual_profile_image,Casual_PPE_image,Casual_time_in,Casual_segment_id,Casual_time_out,Casual_registered_by)
                    VALUES ?`;

                    const values = casuals.map(data => [
                        data.casual_id, data.casual_profile,data.ppe,dateTime,data.segment_id,data.time_out,data.user_id
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

    //get attendance
    getAttendances: (data) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT Casual_attendance.*,Users.*,Casual_attendance.* FROM Casual_attendance 
INNER JOIN Users ON Users.user_id=Casual_attendance.Casual_registered_by  
INNER JOIN Casual_account ON Casual_account.Casual_account_id =Casual_attendance.Casual_Id
WHERE Users.user_company_id=?`,
                [data.company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get attendance by is
    getAttendance: (data) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT Casual_attendance.*,Users.*,Casual_attendance.* FROM Casual_attendance 
INNER JOIN Users ON Users.user_id=Casual_attendance.Casual_registered_by  
INNER JOIN Casual_account ON Casual_account.Casual_account_id =Casual_attendance.Casual_Id
WHERE Casual_attendance.Casual_attendance_id=?`, [data.Casual_attendance_id],
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
    updateAttendance: (data) =>{
        const dateTime = new Date();
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE Casual_attendance SET Casual_Id=?,Casual_profile_image=?,Casual_PPE_image=?,Casual_time_in=?,Casual_segment_id=?,Casual_registered_by=? WHERE Casual_attendance_id=?`,
                [data.casual_id,data.casual_profile,data.casual_ppe,dateTime, data.segment_id,data.user_id,data.casual_attendance_id],
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
    timeoutCasual: (data)=>{
        const dateTimeOut = new Date();
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE Casual_attendance SET Casual_time_out=? WHERE Casual_attendance_id= ?`,[data.casual_attendance_id, dateTimeOut],
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
