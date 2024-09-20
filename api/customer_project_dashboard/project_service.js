const pool = require('../../config/database');


module.exports = {
    //get information
    getInfo: (customer_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    c.customer_name,
    c.customer_email,
    c.customer_contact,
    c.customer_profile,
    c.customer_date_created,
    c.customer_date_updated,
    (SELECT COUNT(*) FROM project p WHERE p.project_customer_id = c.customer_id) AS project_count
FROM 
    customer c
WHERE 
    c.customer_id = ?;
`, [customer_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //get projects
    getProjects:  (customer_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    p.project_name,
    p.project_end_date,
    p.project_description,
    CONCAT(u.user_firstname, ' ', u.user_lastname) AS project_manager,
    IFNULL((
        SUM(jc.total_service_quantity) / SUM(sis.total_quantity)
    ) * 100, 0) AS percentage_progress,
     -- Count of active segments
    (
        SELECT COUNT(*)
        FROM project_segment ps_active
        WHERE ps_active.project_id = p.project_id
        AND LOWER(ps_active.segment_status) = 'active'
    ) AS open_task,
     -- Count of complete segments
    (
        SELECT COUNT(*)
        FROM project_segment ps_complete
        WHERE ps_complete.project_id = p.project_id
        AND LOWER(ps_complete.segment_status) = 'complete'
    ) AS completed_task
FROM 
    project p
LEFT JOIN 
    project_segment ps ON p.project_id = ps.project_id
LEFT JOIN 
    Users u ON p.project_manager_id = u.user_id
LEFT JOIN 
    (
        SELECT 
            sis.segment_id,
            SUM(sis.quantity) AS total_quantity
        FROM 
            segment_implemetation_service sis
        GROUP BY 
            sis.segment_id
    ) sis ON ps.segment_id = sis.segment_id
LEFT JOIN 
    (
        SELECT 
            jc.segment_id,
            SUM(jc.service_quantity) AS total_service_quantity
        FROM 
            job_card jc
        GROUP BY 
            jc.segment_id
    ) jc ON ps.segment_id = jc.segment_id
WHERE 
    p.project_customer_id = ?
GROUP BY 
    p.project_id`,
                [customer_id],
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
