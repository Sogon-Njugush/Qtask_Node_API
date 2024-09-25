const pool = require('../../config/database');


module.exports = {
    //get information
    getCount: (company_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    COUNT(CASE 
            WHEN ticket.ticket_id IN (
                SELECT ticket_id 
                FROM ticket_assign 
                WHERE LOWER(ticket_user_status) IN ('accepted', 'in-progress')
            ) 
            AND NOT EXISTS (
                SELECT ticket_id 
                FROM ticket_assign 
                WHERE ticket.ticket_id = ticket_assign.ticket_id 
                AND LOWER(ticket_user_status) = 'completed'
            ) 
            THEN ticket.ticket_id 
          END) AS active_Case,

    COUNT(CASE 
            WHEN LOWER(ticket.ticket_status) = 'monitoring' 
            THEN ticket.ticket_id 
          END) AS monitoring_Case,

    COUNT(CASE 
            WHEN ticket.ticket_status = '' 
            AND ticket.ticket_id IN (
                SELECT ticket_id 
                FROM ticket_assign 
                WHERE ticket_user_status = ''
            ) 
            AND NOT EXISTS (
                SELECT ticket_id 
                FROM ticket_assign 
                WHERE ticket.ticket_id = ticket_assign.ticket_id 
                AND LOWER(ticket_user_status) = 'in-progress'
            ) 
            THEN ticket.ticket_id 
          END) AS new_Case,

    COUNT(CASE 
            WHEN LOWER(ticket.ticket_status) = 'on_hold' 
            THEN ticket.ticket_id 
          END) AS onHold_Case

FROM ticket
INNER JOIN customer ON customer.customer_id = ticket.ticket_customer_id
INNER JOIN sla ON sla.sla_id = ticket.ticket_sla_id
INNER JOIN site ON site.site_id = ticket.ticket_site_id
INNER JOIN service_type ON service_type.service_type_id = ticket.ticket_service_type_id
WHERE service_type.service_type_branch_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //get MTTR
    getMTTR:  (company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    service_type.service_name AS service_name,
    DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d') AS ticket_date,
    COUNT(ticket.ticket_id) AS total_count,
    SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket_actual_time, '%Y-%m-%d %h:%i:%s %p'), 
            STR_TO_DATE(noc_close_time, '%Y-%m-%d %h:%i:%s %p')
        )) AS total_minutes,
    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket_hold.ticket_hold_time, '%Y-%m-%d %h:%i:%s %p'), 
            STR_TO_DATE(ticket_hold.ticket_release_time, '%Y-%m-%d %h:%i:%s %p')
        )), 0) AS total_hold_minutes
FROM ticket
INNER JOIN noc_close_ticket ON noc_close_ticket.ticket_id = ticket.ticket_id
INNER JOIN Users ON Users.user_id = ticket.ticket_created_by
INNER JOIN service_type ON service_type.service_type_id = ticket.ticket_service_type_id
LEFT JOIN ticket_hold ON ticket.ticket_id = ticket_hold.ticket_id
    AND ticket.ticket_status = 'closed'
    AND Users.user_company_id = ?
WHERE 
    DATE(ticket.ticket_create_time) BETWEEN DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND CURDATE()
    AND Users.user_company_id = ?
GROUP BY service_type.service_name, DATE(ticket.ticket_create_time)`,
                [company_id, company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get recent update
    getRecentUpdate:(company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    ticket_service.ticket_update_time, 
    ticket.ticket_no, 
    service_category.service_category_name,
    ticket_service.activity_location
FROM 
    ticket_service
INNER JOIN 
    ticket ON ticket.ticket_id = ticket_service.ticket_id
INNER JOIN 
    service_category ON service_category.service_category_id = ticket_service.service_category_id
INNER JOIN 
    service_type ON service_type.service_type_id = service_category.service_category_type_id
WHERE 
    service_type.service_type_branch_id = ?
ORDER BY 
    ticket_service.ticket_service_id DESC
LIMIT 10`,
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
//get ticket traffic
    getTicketTraffic:(company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d') AS ticket_date,
    COUNT(ticket.ticket_id) AS ticket_count,
    customer.customer_name AS service_name
FROM 
    ticket
JOIN 
    customer ON ticket.ticket_customer_id = customer.customer_id
WHERE 
    customer.customer_company_id = ?
GROUP BY
 ticket.ticket_customer_id,
   DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d')
ORDER BY 
    ticket_date`,
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
 //breached tickets
    getBreached:(company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    customer.customer_name, sla.sla_time_hrs, 
    sla.sla_time_min,site.site_name, service_type.service_name, 
    ticket.ticket_no, ticket.ticket_case_no,
    GROUP_CONCAT(CONCAT(Users.user_firstname, ' ', Users.user_lastname) SEPARATOR ', ') AS technician_names
FROM ticket
INNER JOIN 
    customer ON customer.customer_id = ticket.ticket_customer_id
INNER JOIN 
    sla ON sla.sla_id = ticket.ticket_sla_id
INNER JOIN 
    site ON site.site_id = ticket.ticket_site_id
INNER JOIN 
    service_type ON service_type.service_type_id = ticket.ticket_service_type_id
LEFT JOIN 
    ticket_assign ON ticket_assign.ticket_id = ticket.ticket_id
LEFT JOIN 
    Users ON Users.user_id = ticket_assign.agent_id
WHERE  service_type.service_type_branch_id = ? AND ticket.ticket_state = 'breached' AND ticket.ticket_status != 'closed'
GROUP BY ticket.ticket_id ORDER BY ticket.ticket_id DESC`,
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
    //breached ticket analysis
    getBreachedAnalysis:(company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    customer.customer_name,
    DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d') AS ticket_date,
    COUNT(ticket.ticket_id) AS total_tickets,
    SUM(CASE WHEN ticket.ticket_state = 'breached' THEN 1 ELSE 0 END) AS total_breached
FROM 
    ticket
JOIN 
    customer ON ticket.ticket_customer_id = customer.customer_id
WHERE 
    customer.customer_company_id = ?
GROUP BY 
    ticket.ticket_customer_id,
    DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d')
ORDER BY 
    ticket.ticket_customer_id,
    ticket_date`,
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
    //ticket list by status
    getTicketListByStatus:(company_id,status) => {
        return new Promise((resolve, reject)=>{
            // Clean the status to remove any extra quotes
            const cleanStatus = status.replace(/'/g, '');
            pool.query(
                `SELECT 
    c.customer_name, s.sla_time_hrs AS sla_hrs, s.sla_time_min AS sla_min,  st.site_name, 
    sv.service_name, t.ticket_id, t.ticket_no, t.ticket_actual_time, t.ticket_create_time, 
    t.ticket_subject, 
    IF(t.ticket_state = '', 'scheduled', t.ticket_state) AS ticket_state,
    IF(t.ticket_status = '', 'new', t.ticket_status) AS ticket_status,
    t.ticket_case_no,
    GROUP_CONCAT(CONCAT(u.user_firstname, ' ', u.user_lastname) SEPARATOR ', ') AS assigned_users
     FROM ticket t
INNER JOIN 
    customer c ON c.customer_id = t.ticket_customer_id
INNER JOIN 
    sla s ON s.sla_id = t.ticket_sla_id
INNER JOIN 
    site st ON st.site_id = t.ticket_site_id
INNER JOIN 
    service_type sv ON sv.service_type_id = t.ticket_service_type_id
INNER JOIN 
    ticket_assign ta ON ta.ticket_id = t.ticket_id
INNER JOIN 
    Users u ON u.user_id = ta.agent_id
WHERE 
    sv.service_type_branch_id = ?
    AND (? = 'all' OR 
         (? = 'new' AND t.ticket_status = '') OR 
         (t.ticket_status = ?))
GROUP BY t.ticket_id
ORDER BY t.ticket_create_time DESC`,
                [company_id, cleanStatus, cleanStatus, cleanStatus],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
 // reports by region
    getReportByRegion:(company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d') AS ticket_date,
    customer.customer_name,
    site.site_name AS region_name,
    service_type.service_name,
    COUNT(ticket.ticket_id) AS total_tickets,
    SUM(CASE WHEN ticket.ticket_state = 'breached' THEN 1 ELSE 0 END) AS breached_tickets,
   ROUND((SUM(TIMESTAMPDIFF(MINUTE, 
                        STR_TO_DATE(ticket_actual_time, '%Y-%m-%d %h:%i:%s %p'), 
                        STR_TO_DATE(noc_close_time, '%Y-%m-%d %h:%i:%s %p')
                )) - 
                COALESCE(SUM(TIMESTAMPDIFF(MINUTE, 
                        STR_TO_DATE(ticket_hold.ticket_hold_time, '%Y-%m-%d %h:%i:%s %p'), 
                        STR_TO_DATE(ticket_hold.ticket_release_time, '%Y-%m-%d %h:%i:%s %p')
                )), 0)) / COUNT(ticket.ticket_id), 2) AS mttr
FROM
    ticket
JOIN 
    customer ON customer.customer_id = ticket.ticket_customer_id
JOIN 
    site ON site.site_id = ticket.ticket_site_id
JOIN 
    service_type ON service_type.service_type_id = ticket.ticket_service_type_id
INNER JOIN 
    noc_close_ticket ON noc_close_ticket.ticket_id = ticket.ticket_id
LEFT JOIN 
ticket_hold ON ticket.ticket_id = ticket_hold.ticket_id
WHERE 
    service_type.service_type_branch_id = ? AND ticket.ticket_status='closed'
GROUP BY 
    customer.customer_id, 
    site.site_id, 
    service_type.service_type_id, 
    ticket_date`,
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
    // report counts
    getReportCounts: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT
                site_count,customer_count,
                service_count,users_count
            FROM
            (
                SELECT
                    (SELECT COUNT(*) 
                     FROM site 
                     WHERE site_company_id = ?
                     AND (site_status = '' OR LOWER(site_status) = 'active')
                    ) AS site_count,

                    (SELECT COUNT(*) 
                     FROM customer 
                     WHERE customer_company_id = ? 
                     AND LOWER(customer_status) = 'active'
                    ) AS customer_count,

                    (SELECT COUNT(*) 
                     FROM service_type 
                     WHERE service_type_branch_id = ?
                     AND (service_type_status = '' OR LOWER(service_type_status) = 'active')
                    ) AS service_count,

                    (SELECT COUNT(*) 
                     FROM Users 
                     JOIN user_role ON user_role.user_id = Users.user_id 
                     JOIN roles ON roles.role_id = user_role.role_id 
                     WHERE LOWER(role_name) = 'technician' 
                     AND Users.user_company_id = ?
                     AND LOWER(Users.user_account_status) = 'active'
                    ) AS users_count
            ) AS result`,
                [company_id, company_id, company_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
 //reports by technician
    getTechnicianReport:(company_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    CONCAT(Users.user_firstname, ' ', Users.user_lastname) AS agent_name,
    site.site_name,service_type.service_name,
    DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d') AS ticket_date,
    COUNT(ticket.ticket_id) AS total_tickets,
    SUM(CASE WHEN ticket.ticket_state = 'breached' THEN 1 ELSE 0 END) AS breached_tickets,
    SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket.ticket_actual_time, '%Y-%m-%d %h:%i:%s %p'), 
            STR_TO_DATE(noc_close_ticket.noc_close_time, '%Y-%m-%d %h:%i:%s %p')
        )) AS total_minutes,
    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket_hold.ticket_hold_time, '%Y-%m-%d %h:%i:%s %p'), 
            STR_TO_DATE(ticket_hold.ticket_release_time, '%Y-%m-%d %h:%i:%s %p')
        )), 0) AS total_hold_minutes,
    ROUND((SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket.ticket_actual_time, '%Y-%m-%d %h:%i:%s %p'), 
            STR_TO_DATE(noc_close_ticket.noc_close_time, '%Y-%m-%d %h:%i:%s %p')
        )) - COALESCE(SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket_hold.ticket_hold_time, '%Y-%m-%d %h:%i:%s %p'), 
            STR_TO_DATE(ticket_hold.ticket_release_time, '%Y-%m-%d %h:%i:%s %p')
        )), 0)) / COUNT(ticket.ticket_id), 2) AS mttr
FROM 
    ticket
JOIN 
    ticket_assign ON ticket_assign.ticket_id = ticket.ticket_id
JOIN 
    Users ON Users.user_id = ticket_assign.agent_id
JOIN 
    user_role ON user_role.user_id = Users.user_id
JOIN 
    roles ON roles.role_id = user_role.role_id
JOIN 
    site ON site.site_id = ticket.ticket_site_id
JOIN 
    service_type ON service_type.service_type_id = ticket.ticket_service_type_id
JOIN 
    noc_close_ticket ON noc_close_ticket.ticket_id = ticket.ticket_id
LEFT JOIN 
    ticket_hold ON ticket.ticket_id = ticket_hold.ticket_id
WHERE 
    Users.user_company_id = ?
    AND LOWER(roles.role_name) = 'admin'
    AND ticket.ticket_create_time >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
    AND YEAR(ticket.ticket_create_time) = YEAR(CURDATE())
GROUP BY 
    Users.user_id, site.site_id, ticket.ticket_service_type_id, DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d')`,
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
