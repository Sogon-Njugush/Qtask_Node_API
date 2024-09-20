const pool = require('../../config/database');


module.exports = {
    //create project_bom
    createBom: (data) =>{
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO segment_bom_material(segment_id,item_id,quantity) VALUES (?,?,?)`,
                [data.segment_id,data.item_id,data.quantity],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    //get project_bom
    getBoms:  (segment_) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT * FROM segment_bom_material WHERE segment_id=?`, [segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get project_bom by id
    getBom: (bom_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT * FROM segment_bom_material WHERE bom_material_id=?`, [bom_id],
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
    updateBom: (data) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE segment_bom_material SET segment_id=?,item_id=?,quantity=? WHERE bom_material_id = ?`,
                [data.segment_id, data.item_id, data.quantity, data.bom_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete project_bom
    deleteBom: (bom_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `DELETE FROM segment_bom_material WHERE bom_material_id= ?`,[bom_id],
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
