const pool = require('../../config/database');

module.exports = {
    //create service kpi
    createCasual: (casuals) => {
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

                    const query = `INSERT INTO Casual_account
                    (Casual_id,Country_code,Casual_phone_no,Company_id,Casual_status,Casual_register_date,Casual_registered_by)
                    VALUES ?`;

                    const values = casuals.map(data => [
                        data.casual_id, data.country_code,data.phone_number,data.casual_status,dateTime,data.user_id
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

    //get project_casuals
    getCasuals: (data) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT * FROM Casual_account WHERE Company_id=?`,
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
    //get Casual by id
    getCasual: (data) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT * FROM Casual_account WHERE Casual_account_id=?`, [data.Casual_account_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update Casual
    updateCasual: (data) =>{
        const dateTime = new Date();
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE Casual_account SET Casual_id=?,Country_code=?,Casual_phone_no=?, Casual_status=? WHERE Casual_account_id=?`,
                [data.casual_id,data.contry_code,data.phone_number,data.casual_status, data.casual_account_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete casual
    deleteCasual: (data)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE Casual_account SET Casual_status= "Deleted" WHERE Casual_account_id= ?`,[data.casual_account_id],
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
