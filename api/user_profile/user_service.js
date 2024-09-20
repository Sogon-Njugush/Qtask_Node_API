const pool = require('../../config/database');


module.exports = {
    //get user details
    getUserDetails: (user_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    CONCAT(u.user_firstname, ' ', u.user_lastname) AS user_name,
    u.user_email_address,
    c.company_name,
    GROUP_CONCAT(r.role_name) AS roles,
    
    -- Count the number of projects for the company
    (SELECT COUNT(*) 
     FROM project p 
     WHERE p.company_id = u.user_company_id) AS project_count,

    -- Count the number of services where service_type_branch_id is the user ID and the status is active
    (SELECT COUNT(*) 
     FROM service_type st 
     WHERE st.service_type_branch_id = u.user_id 
       AND LOWER(st.service_type_status) = 'active') AS service_count,

    -- Count the number of active customers for the company
    (SELECT COUNT(*) 
     FROM customer cust 
     WHERE cust.customer_company_id = u.user_company_id 
       AND LOWER(cust.customer_status) = 'active') AS customer_count,

    -- Count the number of closed segments from project_segment related to the user's company
    (SELECT COUNT(*) 
     FROM project_segment ps
     JOIN project p ON p.project_id = ps.project_id
     WHERE p.company_id = u.user_company_id
       AND LOWER(ps.segment_status) = 'closed') AS closed_segment_count

FROM Users u
JOIN company c ON u.user_company_id = c.company_id
JOIN user_role ur ON ur.user_id = u.user_id
JOIN roles r ON r.role_id = ur.role_id
WHERE u.user_id = ?
  AND LOWER(ur.user_role_status) = 'active'
GROUP BY u.user_id`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //end
};
