const pool = require('../../config/database');


module.exports = {
    //create user
    create: (data, callback) =>{
        pool.query(
            `INSERT INTO user(first_name,last_name,user_contact,user_password,user_email) VALUES (?,?,?,?,?)`,
            [data.first_name,data.last_name,data.user_contact,data.user_password,data.user_email],
            (error, results,fields)=>{
                if(error){
                 return callback(error);
                }
                return callback(null, results);
            }
        );
    },
    //get users
    getUsers: callBack => {
        pool.query(
            `SELECT * FROM user`, [],
            (error, results, fields) =>{
                if(error){
                    return callBack(error);
                }
                return  callBack(null, results);
            }
        );
    },
    //get user by id
    getUser: (id, callBack) =>{
        pool.query(
            `SELECT * FROM user WHERE user_id=?`, [id],
            (error, results, fields)=>{
                if (error){
                    return callBack(error);
                }
                return callBack(null, results[0])
            }
        );
    },
    //user update
    updateUser: (data, callBack)=>{
        pool.query(
            `UPDATE user SET first_name=?,last_name=?,user_contact=?,user_password=?,user_email=?  WHERE user_id = ?`,
            [data.first_name, data.last_name, data.user_contact, data.user_password, data.user_email, data.user_id],
            (error, results,fields)=>{
                if(error){
                    return callBack(error);
                }
                return  callBack(null, results[0]);
        }
        );
    },
    //delete user
    deleteUser: (data, callBack)=>{
        pool.query(
            `DELETE FROM user WHERE user_id= ?`,[data.user_id],
            (error, results, fields) =>{
                if(error){
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    //user login
    getUserByEmail: (user_email, callBack)=>{
        pool.query(
            `SELECT * FROM user WHERE user_email = ?`,[user_email],
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



