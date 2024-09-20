const pool = require('../../config/database');

module.exports = {
    //create project_bom kpi
    createBomKpi: (materials) => {
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

                    const query = `INSERT INTO material_kpi
                    (segment_id,bom_material_id,user_id,material_create_date,material_status)
                    VALUES ?`;

                    const values = materials.map(data => [
                        data.segment_id, data.material_id,data.user_id,dateTime,data.material_status
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

    //get project_bom kpi
    getBomKpis: (segment_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT project_segment.segment_name, material_kpi.* FROM  material_kpi
INNER JOIN project_segment ON project_segment.segment_id=material_kpi.segment_id
WHERE material_kpi.segment_id=?`,
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
    //get material Kpi by id
    getBomKpi: (material_kpi_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT project_segment.segment_name,material_kpi.* FROM material_kpi
INNER JOIN project_segment ON project_segment.segment_id=material_kpi.segment_id
WHERE material_kpi.material_kpi_id=?`, [material_kpi_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update project_bom kpi
    updateBomKpi: (data) =>{
        const dateTime = new Date();
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE material_kpi SET bom_material_id=?,user_id=?,material_create_date=?, material_status=? material_kpi_id=?`,
                [data.material_id,data.user_id,dateTime,data.material_status, data.material_kpi_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete project_segment project_bom kpi
    deleteBomKpi: (material_kpi_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE material_kpi SET material_status= "Deleted" WHERE material_kpi_id= ?`,[material_kpi_id],
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
