const pool = require('../../config/database');

module.exports = {
    //close the project_segment
    closeSegment: (data) =>{
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

};
