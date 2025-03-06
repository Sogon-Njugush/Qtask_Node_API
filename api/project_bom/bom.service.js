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
    getBoms:  (segment_id) => {
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
    //approved material change request
    approveMaterialChangeRequest: (user_id, material_change_request_id, date) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `
            SELECT material_id, segment_id 
            FROM segment_material_change_request 
            WHERE material_change_request_id = ?`,
                [material_change_request_id],
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    const { material_id, segment_id } = result[0];

                    // Check if the item exists in the BOM
                    pool.query(
                        `SELECT * FROM bom_material WHERE segment_id = ? AND item_id = ?`,
                        [segment_id, material_id],
                        (error, bomResult) => {
                            if (error) {
                                return reject(error);
                            }

                            // Insert into BOM if the material does not exist
                            if (bomResult.length === 0) {
                                pool.query(
                                    `INSERT INTO bom_material (segment_id, item_id, quantity) 
                                VALUES (?, ?, 0)`,
                                    [segment_id, material_id],
                                    (error, insertResult) => {
                                        if (error) {
                                            return reject(error);
                                        }
                                    }
                                );
                            }

                            // Update the material change request
                            pool.query(
                                `UPDATE segment_material_change_request 
                            SET material_change_status = 'Approved', 
                                material_change_approve_date = ?, 
                                material_change_approved_by = ? 
                            WHERE material_change_request_id = ?`,
                                [date, user_id, material_change_request_id],
                                (error, updateResult) => {
                                    if (error) {
                                        return reject(error);
                                    }
                                    return resolve(updateResult);
                                }
                            );
                        }
                    );
                }
            );
        });
    },
    //approved service change request
    approveServiceChangeRequest: (user_id, service_change_request_id, date) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `
            SELECT material_id, segment_id 
            FROM segment_material_change_request 
            WHERE material_change_request_id = ?`,
                [service_change_request_id],
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    const { material_id, segment_id } = result[0];

                    // Check if the item exists in the BOM
                    pool.query(
                        `SELECT * FROM bom_material WHERE segment_id = ? AND item_id = ?`,
                        [segment_id, material_id],
                        (error, bomResult) => {
                            if (error) {
                                return reject(error);
                            }

                            // Insert into BOM if the material does not exist
                            if (bomResult.length === 0) {
                                pool.query(
                                    `INSERT INTO bom_material (segment_id, item_id, quantity) 
                                VALUES (?, ?, 0)`,
                                    [segment_id, material_id],
                                    (error, insertResult) => {
                                        if (error) {
                                            return reject(error);
                                        }
                                    }
                                );
                            }

                            // Update the material change request
                            pool.query(
                                `UPDATE segment_material_change_request 
                            SET material_change_status = 'Approved', 
                                material_change_approve_date = ?, 
                                material_change_approved_by = ? 
                            WHERE material_change_request_id = ?`,
                                [date, user_id, service_change_request_id],
                                (error, updateResult) => {
                                    if (error) {
                                        return reject(error);
                                    }
                                    return resolve(updateResult);
                                }
                            );
                        }
                    );
                }
            );
        });
    },
    //end
};
