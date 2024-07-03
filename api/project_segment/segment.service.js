const pool = require('../../config/database');
const {v4: uuidv4} = require("uuid");

module.exports = {
    //create project_segment
    createSegment: (segments) => {
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

                    const query = `INSERT INTO project_segment
                    (segment_name, segment_code, project_id, start_point, end_point, est_distance, site_number, overlap, comment, user_id, sub_contractor, start_date, end_date, segment_status, segment_create_date)
                    VALUES ?`;

                    const values = segments.map(data => [
                        data.segment_name, data.segment_code, data.project_id, data.start_point, data.end_point, data.est_distance, data.site,
                        data.overlap, data.comment, data.user_id, data.sub_contractor, data.start_date, data.end_date, data.segment_status, dateTime
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

    //get project_segment
    getSegments:  (data) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT project.project_name,customer.customer_name,project_segment.* FROM project_segment
INNER JOIN project ON project.project_id=project_segment.project_id
INNER JOIN customer ON customer.customer_id = project.project_customer_id
WHERE project.company_id=? AND project.project_id=?`,
                [data.company_id, data.project_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get Segment by id
    getSegment: (segment_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT project.project_name,customer.customer_name,project_segment.* FROM project_segment
INNER JOIN project ON project.project_id=project_segment.project_id
INNER JOIN customer ON customer.customer_id = project.project_customer_id
WHERE project_segment.segment_id=?`, [segment_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update project_segment
    updateSegment: (data) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE project_segment SET segment_name=?,start_point=?,end_point=?,est_distance=?,site_number=?,overlap=?,comment=?,user_id=?,sub_contractor=?,start_date=?,end_date=?,segment_status=? WHERE segment_id = ?`,
                [data.segment_name,data.start_point,data.end_point,data.est_distance,data.site,data.overlap,
                    data.comment, data.user_id, data.sub_contractor, data.start_date, data.end_date,data.segment_status,data.segment_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete project_segment
    deleteSegment: (data)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `UPDATE project_segment SET segment_status= "Deleted" WHERE segment_id= ?`,[data.segment_id],
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
