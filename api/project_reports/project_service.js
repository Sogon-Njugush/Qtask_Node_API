const pool = require('../../config/database');


module.exports = {
    //get information
    getCount: (company_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    COUNT(CASE WHEN LOWER(project_status) = 'new' THEN 1 END) AS new_project_count,
    COUNT(CASE WHEN LOWER(project_status) = 'active' THEN 1 END) AS active_project_count,
    COUNT(CASE WHEN LOWER(project_status) = 'review' THEN 1 END) AS review_project_count,
    COUNT(CASE WHEN LOWER(project_status) = 'completed' THEN 1 END) AS completed_project_count
FROM 
    project
WHERE 
    company_id = ?
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
    //get top clients
    getTopClients:  (company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    c.customer_name,
    COUNT(p.project_id) AS project_count
FROM 
    customer c
JOIN 
    project p ON c.customer_id = p.project_customer_id
WHERE 
    c.customer_company_id = ?
GROUP BY 
    c.customer_id, c.customer_name
ORDER BY 
    project_count DESC
`,
                [company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get service management report data
    getServiceReport:(company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    customer.customer_name, 
    sla.sla_time_hrs AS sla_Hrs,
    sla.sla_time_min AS sla_Mins,
    site.site_name, 
    service_type.service_name,
    site.site_name,
    ticket.*, 
    GROUP_CONCAT(CONCAT(Users.user_firstname, ' ', Users.user_lastname) SEPARATOR ', ') AS assigned_users,
    agent_closed_ticket.date_closed AS agent_closure_time, 
    noc_close_ticket.noc_close_time AS noc_closure_time,
    IFNULL(ROUND(AVG(TIMESTAMPDIFF(MINUTE, STR_TO_DATE(ticket.ticket_actual_time, '%Y-%m-%d %h:%i:%s %p'), 
        STR_TO_DATE(noc_close_ticket.noc_close_time, '%Y-%m-%d %h:%i:%s %p')))/60, 3), 'Waiting') AS avg_mttr,
    -- Set ticket_status to "Active" if it's empty
    IF(ticket.ticket_status = '', 'Active', ticket.ticket_status) AS ticket_status,
    -- Set ticket_state to "Waiting" if it's empty
    IF(ticket.ticket_state = '', 'Waiting', ticket.ticket_state) AS ticket_state
FROM ticket
INNER JOIN customer ON customer.customer_id = ticket.ticket_customer_id
INNER JOIN sla ON sla.sla_id = ticket.ticket_sla_id
INNER JOIN site ON site.site_id = ticket.ticket_site_id
INNER JOIN service_type ON service_type.service_type_id = ticket.ticket_service_type_id
LEFT JOIN ticket_assign ON ticket_assign.ticket_id = ticket.ticket_id
LEFT JOIN Users ON Users.user_id = ticket_assign.agent_id
LEFT JOIN agent_closed_ticket ON agent_closed_ticket.ticket_id = ticket.ticket_id
LEFT JOIN noc_close_ticket ON noc_close_ticket.ticket_id = ticket.ticket_id
WHERE service_type.service_type_branch_id = ?
GROUP BY ticket.ticket_id
ORDER BY ticket.ticket_id DESC`,
                [company_id],
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
