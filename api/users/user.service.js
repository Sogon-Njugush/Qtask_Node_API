const pool = require('../../config/database');


module.exports = {
    //create user
    create: (data) =>{
        return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO Users(user_firstname,user_lastname,user_email_address,user_company_id,user_driver_license,user_contact,user_country_code,user_account_status,user_password,password_status,user_create_date,user_update_date) VALUES 
            (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [data.first_name,data.last_name,data.user_email,data.user_company_id,data.user_driver_license,data.user_contact,data.user_contry_code, data.account_status, data.user_password,data.password_status, data.create_date, data.update_date],
            (error, results,fields)=>{
                if(error){
                    return reject(error);
                }
                   return resolve(results);
            }
        );
        })
    },
    //get users
    getUsers:  () => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT * FROM Users`, [],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
          },
    //get user by id
    getUser: (id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT * FROM Users WHERE user_id=?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results[0])
                }
            );
        });
    },
    //user update
    updateUser: (data) =>{
        return new Promise((resolve, reject)=>{
        pool.query(
            `UPDATE Users SET user_firstname=?,user_lastname=?,user_email_address=?,user_company_id=?,user_driver_license=?,user_contact=?,user_country_code=?,user_account_status=?,user_password=?,password_status=?,user_create_date=?,user_update_date=?  WHERE user_id = ?`,
            [data.first_name,data.last_name,data.user_email,data.user_company_id,data.user_driver_license,data.user_contact,data.user_contry_code, data.account_status, data.user_password,data.password_status, data.create_date, data.update_date, data.user_id],
            (error, results,fields)=>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            }
        );
        });
    },
    //delete user
    deleteUser: (data)=>{
        return new Promise((resolve,reject) => {
        pool.query(
            `DELETE FROM Users WHERE user_id= ?`,[data.user_id],
            (error, results, fields) =>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            }
        );
        });
    },
    //user login
    getUserByEmail: (user_email, callBack)=>{
        pool.query(
            `SELECT * FROM Users WHERE user_email_address = ?`,[user_email],
            (error, results, fields)=>{
                if(error){
                    callBack(error);
                }
                return callBack(null, results[0]);
            }
        );
    }
    //end
};
