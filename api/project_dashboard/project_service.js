const pool = require('../../config/database');

module.exports = {
    //create project counts
    getCounts: (project_id) => {
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

    //get segment highlights
    getSegmentHighlight: (project_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    ps.segment_name,
    IFNULL(SUM(sis.quantity), 0) AS expected_quantity,
    IFNULL(SUM(jc.service_quantity), 0) AS executed_quantity,
    CASE 
        WHEN IFNULL(SUM(sis.quantity), 0) = 0 THEN 0
        ELSE (IFNULL(SUM(jc.service_quantity), 0) / IFNULL(SUM(sis.quantity), 1)) * 100
    END AS percentage_progress
FROM 
    project_segment ps
LEFT JOIN 
    segment_implemetation_service sis ON ps.segment_id = sis.segment_id
LEFT JOIN 
    job_card jc ON ps.segment_id = jc.segment_id
WHERE 
    ps.project_id = ?
GROUP BY 
    ps.segment_id, ps.segment_name
`, [project_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //get segment budget
    getSegmentBudget: (project_id) => {
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
`, [project_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //get task weight
    getTaskWeight: (project_id) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    st.service_name,
    SUM(sis.quantity) AS expected_quantity
FROM 
    segment_implemetation_service sis
JOIN 
    project_segment ps ON ps.segment_id = sis.segment_id
JOIN 
    service_type st ON st.service_type_id = sis.service_type
WHERE 
    ps.project_id = ?
GROUP BY 
    sis.service_type`,
                [project_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get service Progress
    getSegmentProgress: (project_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    st.service_name,
    IFNULL(SUM(sis.quantity), 0) AS expected_quantity,
    IFNULL(SUM(pjc.service_quantity), 0) AS executed_quantity,
    CASE 
        WHEN IFNULL(SUM(sis.quantity), 0) = 0 THEN 0
        ELSE (IFNULL(SUM(pjc.service_quantity), 0) / IFNULL(SUM(sis.quantity), 1)) * 100
    END AS percentage_progress
FROM 
    service_type st
JOIN 
    segment_implemetation_service sis ON st.service_type_id = sis.service_type
JOIN 
    project_segment ps ON ps.segment_id = sis.segment_id
LEFT JOIN 
    project_job_card pjc ON ps.segment_id = pjc.segment_id 
    AND sis.implementation_service_id = pjc.service_id
WHERE 
    ps.project_id = ?
GROUP BY 
    st.service_type_id`,[project_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get work load
    getWorkLoad: (project_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    DISTINCT CONCAT(u.user_firstname, ' ', u.user_lastname) AS user_name,
    COUNT(pau.segment_assign_id) AS assignment_count
FROM 
    Users u
JOIN 
    project_assign_user pau ON u.user_id = pau.user_id
JOIN 
    project_segment ps ON pau.segment_id = ps.segment_id
WHERE 
    ps.project_id = ?
GROUP BY 
    user_name`,[project_id],
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
