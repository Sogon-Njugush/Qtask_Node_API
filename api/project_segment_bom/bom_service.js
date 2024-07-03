const pool = require('../../config/database');

module.exports = {
    //create project_segment service
    createBom: (materials) => {
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

                    const query = `INSERT INTO segment_bom_material
                    (segment_id,material_id,material_quantity,bom_create_date,bom_created_by,material_status)
                    VALUES ?`;

                    const values = materials.map(data => [
                        data.segment_id, data.material_id, data.material_quantity,dateTime,data.user_id,data.material_status
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

    //get project_segment project_bom
    getBoms: (data) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT project_segment.segment_name,segment_bom_material.* FROM segment_bom_material
INNER JOIN project_segment ON project_segment.segment_id=segment_bom_material.segment_id
WHERE segment_bom_material.segment_id=?`,
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
    //get Segment material by id
    getBom: (data) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT project_segment.segment_name,segment_bom_material.* FROM segment_bom_material
INNER JOIN project_segment ON project_segment.segment_id=segment_bom_material.segment_id
WHERE segment_bom_material.bom_material_id=?`, [data.bom_material_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update project_segment project_bom
    updateBom: (data) =>{
        const dateTime = new Date();
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE segment_bom_material SET material_id=?,material_quantity=?,bom_create_date=?, bom_created_by=?,material_status=? WHERE bom_material_id=?`,
                [data.material_id,data.material_quantity,dateTime,data.user_id,data.material_status, data.bom_material_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete project_segment project_bom
    deleteBom: (data)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE segment_bom_material SET material_status= "Deleted" WHERE bom_material_id= ?`,[data.bom_material_id],
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
