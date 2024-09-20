const pool = require('../../config/database');

module.exports = {
    //create project counts
    getCounts: (company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    (SELECT COUNT(*) FROM project WHERE project_status='Active' AND company_id = ?) AS projects_count,
    (SELECT COUNT(*) FROM customer WHERE customer_company_id = ?) AS customers_count,
    (SELECT COUNT(*) FROM project_segment
    INNER JOIN project ON project.project_id = project_segment.project_id
     WHERE project.company_id = ? AND project_segment.segment_status = 'active') AS activeTasks_count,
    (SELECT COUNT(*) FROM Users 
    INNER JOIN user_role ON user_role.user_id = Users.user_id
    INNER JOIN roles ON user_role.role_id=roles.role_id
    WHERE roles.role_name= LOWER("supervisor") AND Users.user_company_id = ?) AS supervisors_count`,
                [company_id,company_id,company_id,company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    //get project highlights
    getProjectHighlight: (company_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    p.project_name,
    IFNULL((
        SUM(jc.total_service_quantity) / SUM(sis.total_quantity)
    ) * 100, 0) AS percentage_progress
FROM 
    project p
LEFT JOIN 
    project_segment ps ON p.project_id = ps.project_id
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
    p.company_id = ? AND LOWER(p.project_status) ='active'
GROUP BY 
    p.project_id, p.project_name;
`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //get Change request
    getChangeRequest: (company_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    p.project_name,
    IFNULL(SUM(smcr.total_material_change_quantity), 0) AS total_material_change_quantity,
    IFNULL(SUM(sscr.total_service_change_quantity), 0) AS total_service_change_quantity
FROM 
    project p
LEFT JOIN 
    project_segment ps ON p.project_id = ps.project_id
LEFT JOIN 
    (
        SELECT 
            smcr.segment_id,
            SUM(smcr.material_change_quantity) AS total_material_change_quantity
        FROM 
            segment_material_change_request smcr
        WHERE 
            LOWER(smcr.material_change_status) = 'approved'
        GROUP BY 
            smcr.segment_id
    ) smcr ON ps.segment_id = smcr.segment_id
LEFT JOIN 
    (
        SELECT 
            sscr.segment_id,
            SUM(sscr.service_change_quantity) AS total_service_change_quantity
        FROM 
            segment_service_change_request sscr
        WHERE 
            LOWER(sscr.service_change_status) = 'approved'
        GROUP BY 
            sscr.segment_id
    ) sscr ON ps.segment_id = sscr.segment_id
WHERE 
    p.company_id = ? AND LOWER(p.project_status) ='active'
GROUP BY 
    p.project_id;
`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //get current projects
    getCurrentProject: (company_id) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    p.project_name,
    p.project_end_date,
    p.project_start_date,
    p.project_create_date,
    IFNULL((
        SUM(jc.total_service_quantity) / SUM(sis.total_quantity)
    ) * 100, 0) AS percentage_progress
FROM 
    project p
LEFT JOIN 
    project_segment ps ON p.project_id = ps.project_id
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
    p.company_id = ?
GROUP BY 
    p.project_id, p.project_name`,
                [company_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get segment task
    getSegmentTask: (data)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `DELETE FROM Casual_task WHERE Casual_task_id= ?`,[data.Casual_task_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get recent updates
    getRecentUpdate: (company_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    project_job_card.coordinates, 
    project_job_card.comment, 
    project_segment.segment_name, 
    project.project_name, 
    project_job_card.date_created
FROM 
    project_job_card
INNER JOIN 
    project_segment ON project_segment.segment_id = project_job_card.segment_id
INNER JOIN 
    project ON project.project_id = project_segment.project_id
WHERE 
    project.company_id = ?
ORDER BY 
    project_job_card.project_job_card_id DESC
LIMIT 5`,[company_id],
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
