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
    DATE(ticket.ticket_create_time) AS ticket_date,
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
    DATE(ticket.ticket_create_time) BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()
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
            pool.query(
                `SELECT 
    c.customer_name, s.sla_time_hrs AS sla_hrs, s.sla_time_min AS sla_min,  st.site_name, 
    sv.service_name, t.ticket_id, t.ticket_no, t.ticket_actual_time, t.ticket_create_time, 
    t.ticket_subject,  t.ticket_state, 
    IF(t.ticket_status = '', 'scheduled', t.ticket_status) AS ticket_status,
    t.ticket_case_no FROM ticket t
INNER JOIN 
    customer c ON c.customer_id = t.ticket_customer_id
INNER JOIN 
    sla s ON s.sla_id = t.ticket_sla_id
INNER JOIN 
    site st ON st.site_id = t.ticket_site_id
INNER JOIN 
    service_type sv ON sv.service_type_id = t.ticket_service_type_id
WHERE 
    sv.service_type_branch_id = ?
    AND (? = 'all' OR t.ticket_status = ?)
ORDER BY t.ticket_create_time DESC`,
                [company_id, status, status],
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
