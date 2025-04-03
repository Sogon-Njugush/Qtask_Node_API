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
          END) AS onHold_Case,
    COUNT(CASE 
            WHEN LOWER(ticket.ticket_status) = 'closed' 
            THEN ticket.ticket_id 
          END) AS closed_Case

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
    DATE_FORMAT(
    STR_TO_DATE(ticket.ticket_create_time, '%a %b %d %Y %H:%i:%s'), 
    '%Y-%m-%d'
   ) AS ticket_date,
    COUNT(ticket.ticket_id) AS total_count,
    SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket_actual_time, '%Y-%m-%dT%H:%i:%s'), 
            STR_TO_DATE(noc_close_time, '%Y-%m-%dT%H:%i:%s')
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
    STR_TO_DATE(ticket.ticket_create_time, '%a %b %d %Y %H:%i:%s') BETWEEN DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND CURDATE()
    AND Users.user_company_id = ?
GROUP BY service_type.service_name, ticket_date`,
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
                CASE 
                    WHEN ticket.ticket_create_time LIKE '____-__-__%' 
                    THEN DATE_FORMAT(ticket.ticket_create_time, '%Y-%m-%d')
                    ELSE DATE_FORMAT(
                        STR_TO_DATE(ticket.ticket_create_time, '%a %b %d %Y %H:%i:%s'), 
                        '%Y-%m-%d'
                    )
                END AS ticket_date,
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
                ticket_date
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
    site.site_name,
    service_type.service_name,
    DATE_FORMAT(STR_TO_DATE(SUBSTRING_INDEX(ticket.ticket_create_time, '(', 1), '%a %b %d %Y %H:%i:%s'), '%Y-%m-%d') AS ticket_date,
    COUNT(ticket.ticket_id) AS total_tickets,
    SUM(CASE WHEN ticket.ticket_state = 'breached' THEN 1 ELSE 0 END) AS breached_tickets,
    SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket.ticket_actual_time, '%Y-%m-%dT%H:%i:%s.%fZ'), 
            STR_TO_DATE(noc_close_ticket.noc_close_time, '%Y-%m-%dT%H:%i:%s.%fZ')
        )) AS total_minutes,
    COALESCE(SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket_hold.ticket_hold_time, '%Y-%m-%dT%H:%i:%s.%fZ'), 
            STR_TO_DATE(ticket_hold.ticket_release_time, '%Y-%m-%dT%H:%i:%s.%fZ')
        )), 0) AS total_hold_minutes,
    ROUND((SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket.ticket_actual_time, '%Y-%m-%dT%H:%i:%s.%fZ'), 
            STR_TO_DATE(noc_close_ticket.noc_close_time, '%Y-%m-%dT%H:%i:%s.%fZ')
        )) - COALESCE(SUM(TIMESTAMPDIFF(MINUTE, 
            STR_TO_DATE(ticket_hold.ticket_hold_time, '%Y-%m-%dT%H:%i:%s.%fZ'), 
            STR_TO_DATE(ticket_hold.ticket_release_time, '%Y-%m-%dT%H:%i:%s.%fZ')
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
    AND LOWER(roles.role_name) = 'technician'
    AND STR_TO_DATE(SUBSTRING_INDEX(ticket.ticket_create_time, '(', 1), '%a %b %d %Y %H:%i:%s') >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) 
    AND YEAR(STR_TO_DATE(SUBSTRING_INDEX(ticket.ticket_create_time, '(', 1), '%a %b %d %Y %H:%i:%s')) = YEAR(CURDATE())
GROUP BY 
    Users.user_id, site.site_id, ticket.ticket_service_type_id, DATE_FORMAT(STR_TO_DATE(SUBSTRING_INDEX(ticket.ticket_create_time, '(', 1), '%a %b %d %Y %H:%i:%s'), '%Y-%m-%d')`,
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
//sla monitoring query
      getTicketSLAStatus: () => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT 
                t.ticket_id,
                t.ticket_status,
                t.ticket_actual_time,
                TIMESTAMPDIFF(MINUTE, t.ticket_actual_time, NOW()) - IFNULL(SUM(TIMESTAMPDIFF(MINUTE, th.ticket_hold_time, th.ticket_release_time)), 0) AS total_time_spent,
                (s.sla_time_hrs * 60 + s.sla_time_min) AS total_sla_minutes
            FROM 
                ticket t
            INNER JOIN 
                sla s ON s.sla_id = t.ticket_sla_id
            LEFT JOIN 
                ticket_hold th ON th.ticket_id = t.ticket_id
            WHERE 
                t.ticket_status != 'On-hold' 
                AND t.ticket_status != 'closed'
                AND YEAR(t.ticket_actual_time) = YEAR(CURDATE())
                AND MONTH(t.ticket_actual_time) = MONTH(CURDATE())
            GROUP BY 
                t.ticket_id, t.ticket_actual_time, t.ticket_status, s.sla_time_hrs, s.sla_time_min
            HAVING 
                DATE_ADD(t.ticket_actual_time, INTERVAL total_sla_minutes MINUTE) >= NOW()`,
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        });
    },
    // reassign tickets
    reAssignTicket: (data) => {
        return new Promise((resolve, reject) => {
            // Update reassign status in `ticket_assign`
            pool.query(
                "UPDATE ticket_assign SET reassign_status = 're-assigned' WHERE ticket_id = ?",
                [data.ticket_id],
                (error) => {
                    if (error) {
                        //console.error("Error updating reassign status:", error);
                        return reject(error);
                    }

                    // Insert into `ticket_assign` for each agent
                    const ticketAssignQueries = data.agent_id.map((agent) => {
                        return new Promise((resolve, reject) => {
                            pool.query(
                                "INSERT INTO ticket_assign(agent_id, ticket_id, ticket_status, ticket_assign_time, ticket_user_status, ticket_user_accept_status, ticket_decline_reason, tickect_acknoledge_date, reassign_status) VALUES (?, ?, '', ?, '', '', '', '', '')",
                                [agent, data.ticket_id, data.date],
                                (err) => {
                                    if (err) {
                                        //console.error("Error inserting into ticket_assign:", err);
                                        return reject(err);
                                    }
                                    resolve();
                                }
                            );
                        });
                    });

                    Promise.all(ticketAssignQueries)
                        .then(() => {
                            // Insert into `ticket_reassign` for each agent
                            const ticketReassignQueries = data.agent_id.map((agent) => {
                                return new Promise((resolve, reject) => {
                                    pool.query(
                                        "INSERT INTO ticket_reassign(ticket_id, user_id, reassign_message, reassign_date, re_assigned_by) VALUES (?, ?, ?, ?, ?)",
                                        [data.ticket_id, agent, data.re_assign_reason, data.date, data.userId],
                                        (err) => {
                                            if (err) {
                                                //console.error("Error inserting into ticket_reassign:", err);
                                                return reject(err);
                                            }
                                            resolve();
                                        }
                                    );
                                });
                            });

                            return Promise.all(ticketReassignQueries);
                        })
                        .then(() => {
                            resolve({ success: true });
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            );
        });
    },
    // Hold ticket
    holdTicket: (data) => {
        return new Promise((resolve, reject) => {
            // Check if required data is present
            if (!data.ticket_id || !data.userId || !data.hold_reason || !data.holdtime) {
                return reject(new Error("Missing required fields."));
            }

            // Update ticket status to 'on_hold'
            pool.query(
                "UPDATE ticket SET ticket_status = 'on_hold' WHERE ticket_id = ?",
                [data.ticket_id],
                (error, results) => {
                    if (error) {
                        //console.error("Error updating ticket status:", error);
                        return reject(new Error("Error updating ticket status."));
                    }

                    // Check if any rows were affected
                    if (results.affectedRows === 0) {
                        return reject(new Error("No ticket found with the provided ticket_id."));
                    }

                    // Insert into ticket_hold table
                    const sql = `
                INSERT INTO ticket_hold(ticket_hold_time, ticket_release_time, ticket_id, ticket_hold_by, ticket_hold_message, ticket_release_by) 
                VALUES (?, '', ?, ?, ?, '')`;

                    pool.query(sql, [data.holdtime, data.ticket_id, data.userId, data.hold_reason], (err) => {
                        if (err) {
                            //console.error("Error inserting into ticket_hold:", err);
                            return reject(new Error("Error inserting into ticket_hold."));
                        }

                        return resolve(results);
                        });
                    }
                );
            });
        },
    // Ticket update
    updateTicket: (data) => {
        return new Promise((resolve, reject) => {
            try {
                // Check if required fields for updating the ticket are provided
                const requiredFields = [
                    "ticket_id",
                    "ticket_description",
                    "ticket_actual_time",
                    "ticket_customer_id",
                    "ticket_sla_id",
                    "ticket_subject",
                    "ticket_no",
                    "ticket_site_id",
                    "ticket_service_type_id"
                ];

                const missingFields = requiredFields.filter(field => !data[field]);
                if (missingFields.length > 0) {
                    return reject(new Error(`Missing required fields: ${missingFields.join(", ")}`));
                }

                // Query to update ticket details
                const updateTicketQuery = `
            UPDATE ticket 
            SET ticket_description = ?,
                ticket_actual_time = ?,
                ticket_customer_id = ?,
                ticket_sla_id = ?,
                ticket_subject = ?,
                ticket_no = ?,
                ticket_site_id = ?,
                ticket_service_type_id = ?
            WHERE ticket_id = ?`;

                const updateTicketValues = [
                    data.ticket_description,
                    data.ticket_actual_time,
                    data.ticket_customer_id,
                    data.ticket_sla_id,
                    data.ticket_subject,
                    data.ticket_no,
                    data.ticket_site_id,
                    data.ticket_service_type_id,
                    data.ticket_id
                ];

                pool.query(updateTicketQuery, updateTicketValues, (error, results) => {
                    if (error) {
                        if (error.code === "ER_DUP_ENTRY") {
                            return reject(new Error("Duplicate entry: The provided ticket_no already exists."));
                        }
                        return reject(new Error("Error updating ticket details."));
                    }

                    if (results.affectedRows === 0) {
                        return reject(new Error("No ticket found with the provided ticket_id."));
                    }

                    const ticketId = data.ticket_id;

                    // If ticketAssign is empty or not provided, resolve immediately
                    if (!data.ticketAssign || data.ticketAssign.length === 0) {
                        return resolve({ message: "Ticket updated successfully, no assignments provided." });
                    }

                    // Process ticket assignments
                    const promises = data.ticketAssign.map((assign) => {
                        return new Promise((resolve, reject) => {
                            if (!assign.agent_id) {
                                return reject(new Error("Missing agent_id in ticketAssign."));
                            }

                            if (!assign.assignDate) {
                                return reject(new Error("Missing assignDate in ticketAssign."));
                            }

                            const checkAssignmentQuery = `SELECT ticket_agent_id AS id, ticket_status, reassign_status FROM ticket_assign WHERE agent_id = ? AND ticket_id = ?`;
                            const checkAssignmentValues = [assign.agent_id, ticketId];

                            pool.query(checkAssignmentQuery, checkAssignmentValues, (error, results) => {
                                if (error) {
                                    return reject(new Error("Error checking ticket assignment."));
                                }

                                if (results.length > 0) {
                                    // Update existing assignment
                                    const updateTicketAssignQuery = `
                                UPDATE ticket_assign 
                                SET ticket_status = ?, reassign_status = ?
                                WHERE ticket_agent_id = ?`;

                                    const updateTicketAssignValues = [
                                        results[0].ticket_status,
                                        results[0].reassign_status,
                                        results[0].id
                                    ];

                                    pool.query(updateTicketAssignQuery, updateTicketAssignValues, (error, results) => {
                                        if (error) {
                                            return reject(new Error("Error updating ticket assignment."));
                                        }
                                        resolve(results);
                                    });
                                } else {
                                    // Insert new assignment
                                    const insertTicketAssignQuery = `
                                INSERT INTO ticket_assign 
                                (agent_id, ticket_id, ticket_status, ticket_assign_time, ticket_user_status, ticket_user_accept_status, ticket_decline_reason, tickect_acknoledge_date, reassign_status) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                                    const insertTicketAssignValues = [
                                        assign.agent_id,
                                        ticketId,
                                        "",
                                        assign.assignDate,
                                        "",
                                        "",
                                        "",
                                        "",
                                        "",
                                    ];

                                    pool.query(insertTicketAssignQuery, insertTicketAssignValues, (error, results) => {
                                        if (error) {
                                            return reject(new Error("Error inserting ticket assignment."));
                                        }
                                        resolve(results);
                                    });
                                }
                            });
                        });
                    });

                    // Wait for all assignment updates/inserts to complete
                    Promise.all(promises)
                        .then(() => resolve({ message: "Ticket and assignments updated successfully." }))
                        .catch(reject);
                });
            } catch (error) {
                reject(error);
            }
        });
    },
    //close Ticket
    closeTicket: (data) => {
        return new Promise((resolve, reject) => {
            // Check if required data is present
            if (!data.ticket_id || !data.userId) {
                return reject(new Error("Missing required fields."));
            }

            // Update ticket status to 'close_hold'
            pool.query(
                "UPDATE ticket SET ticket_status = 'closed' WHERE ticket_id = ?",
                [data.ticket_id],
                (error, results) => {
                    if (error) {
                        //console.error("Error updating ticket status:", error);
                        return reject(new Error("Error updating ticket status."));
                    }

                    // Check if any rows were affected
                    if (results.affectedRows === 0) {
                        return reject(new Error("No ticket found with the provided ticket_id."));
                    }

                    // Insert into noc_close_ticket table
                    const sql = `
                INSERT INTO noc_close_ticket(ticket_id, noc_user_id,noc_close_time,noc_message) 
                VALUES (?, ?, ?, ?)`;

                    pool.query(sql, [data.ticket_id, data.userId, data.closeTime,data.resolution], (err) => {
                        if (err) {
                            //console.error("Error inserting into ticket_hold:", err);
                            return reject(new Error("Error closing the ticket!"));
                        }

                        return resolve(results);
                    });
                }
            );
        });
    },

    //re-open Ticket
    reOpenTicket: (data) => {
        return new Promise((resolve, reject) => {
            // Update reassign status to ``(new)
            pool.query(
                "UPDATE ticket_assign SET ticket_status = '' WHERE ticket_id = ?",
                [data.ticket_id],
                (error) => {
                    if (error) {
                        //console.error("Error updating reassign status:", error);
                        return reject("Error Re-opening the Ticket!");
                    }

                    // Insert into `ticket_assign` for each agent
                    const ticketAssignQueries = data.agent_id.map((agent) => {
                        return new Promise((resolve, reject) => {
                            pool.query(
                                "INSERT INTO ticket_assign(agent_id, ticket_id, ticket_status, ticket_assign_time, ticket_user_status, ticket_user_accept_status, ticket_decline_reason, tickect_acknoledge_date, reassign_status) VALUES (?, ?, '', ?, '', '', '', '', '')",
                                [agent, data.ticket_id, data.reopenTime],
                                (err) => {
                                    if (err) {
                                        //console.error("Error inserting into ticket_assign:", err);
                                        return reject(err);
                                    }
                                    resolve();
                                }
                            );
                        });
                    });

                    Promise.all(ticketAssignQueries)
                        .then(() => {
                            // Insert into ` re_open_ticket`
                                return new Promise((resolve, reject) => {
                                    pool.query(
                                        "INSERT INTO re_open_ticket(ticket_id, re_opened_by, re_open_message, re_open_date) VALUES (?, ?, ?, ?)",
                                        [data.ticket_id, data.userId, data.re_open_reason, data.reopenTime],
                                        (err) => {
                                            if (err) {
                                                //console.error("Error inserting into ticket_reassign:", err);
                                                return reject(new Error("Error Re-opening ticket!"));
                                            }
                                            resolve();
                                        }
                                    );
                                });

                            return Promise.all(ticketReassignQueries);
                        })
                        .then(() => {
                            resolve({ success: true });
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            );
        });
    },

    //complete Ticket(noc over writing tech)
    completeTicket: (data) => {
        return new Promise((resolve, reject) => {
            // Check if required data is present
            if (!data.ticket_id || !data.userId) {
                return reject(new Error("Missing required fields!"));
            }

            // Update ticket status to 'monitoring'
            pool.query(
                "UPDATE ticket SET ticket_status = 'monitoring' WHERE ticket_id = ?",
                [data.ticket_id],
                (error, results) => {
                    if (error) {
                        //console.error("Error updating ticket status:", error);
                        return reject(new Error("Error completing ticket!"));
                    }

                    // Check if any rows were affected
                    if (results.affectedRows === 0) {
                        return reject(new Error("No ticket found with the provided ticket_id."));
                    }

                    // Update ticket_user_status in ticket_assign
                    pool.query(
                        "UPDATE ticket_assign SET ticket_user_status = 'completed' WHERE ticket_id = ?",
                        [data.ticket_id],
                        (error) => {
                            if (error) {
                                //console.error("Error updating ticket_u_status:", error);
                                return reject(new Error("Error updating ticket assignment status."));
                            }

                            // Insert into agent_closed_ticket table
                            const sql = `INSERT INTO agent_closed_ticket(ticket_id, closed_by, close_status, close_location, close_sign, date_closed)
                                     VALUES (?, ?, 'completed', '', '', ?)`;

                            pool.query(sql, [data.ticket_id, data.userId, data.completeTime], (err) => {
                                if (err) {
                                    //console.error("Error inserting into agent_closed_ticket:", err);
                                    return reject(new Error("Error completing ticket!"));
                                }

                                return resolve(results);
                            });
                        }
                    );
                }
            );
        });
    },

    //view map
    getMap: (ticket_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `z
              WHERE ticket_service.activity_location != '' 
              AND ticket.ticket_id = ?`,[ticket_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //activate ticket
    activateTicket: (data) =>{
        return new Promise((resolve, reject) => {
            // Check if required data is present
            if (!data.ticket_id || !data.userId) {
                return reject(new Error("Missing required fields."));
            }

            // Update ticket status to 'in-progress'
            pool.query(
                "UPDATE ticket SET ticket_status = 'in-progress' WHERE ticket_id = ?",
                [data.ticket_id],
                (error, results) => {
                    if (error) {
                        //console.error("Error updating ticket status:", error);
                        return reject(new Error("Error updating ticket status."));
                    }

                    // Check if any rows were affected
                    if (results.affectedRows === 0) {
                        return reject(new Error("No ticket found with the provided ticket_id."));
                    }

                    // Insert into ticket_hold table
                    const sql = `UPDATE ticket_hold SET ticket_release_time=?, ticket_release_by=? WHERE ticket_id=? `;

                    pool.query(sql, [data.releaseTime, data.userId, data.ticket_id], (err) => {
                        if (err) {
                            //console.error("Error inserting into ticket_hold:", err);
                            return reject(new Error("Error activating ticket!."));
                        }

                        return resolve(results);
                    });
                }
            );
        });
    },
    //get heat map
    getHeatMap: (from_date, to_date, client_id, service_type)=>{
    return new Promise((resolve,reject) => {
        pool.query(
            `SELECT 
                SUBSTRING_INDEX(ticket_service.activity_location, ',', 1) AS lat,
                SUBSTRING_INDEX(ticket_service.activity_location, ',', -1) AS lon
              FROM ticket_service
              INNER JOIN ticket ON ticket_service.ticket_id = ticket.ticket_id
            WHERE (DATE_FORMAT(ticket_service.ticket_update_time, '%Y-%m-%d') BETWEEN ? AND ?)
            AND (ticket.ticket_customer_id = ? )
            AND (ticket.ticket_service_type_id = ?)
            ORDER BY ticket_service_id DESC`,[from_date, to_date, client_id, service_type],
            (error, results, fields) =>{
                if(error){
                    return reject(error);
                }
                return resolve(results);
            }
        );
    });
   },
    //create noc comments on ticket
    createNocComment: (data) =>{
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO ticket_noc_comment(ticket_id,noc_comments,comment_date,commented_by,comment_status) VALUES (?,?,?,?,?)`,
                [data.ticket_id,data.comment,data.comment_date,data.commented_by,'Active'],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    //get noc comments on ticket
    getNocComment: (ticket_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT tnc.*, CONCAT(u.user_firstname, ' ', u.user_lastname) AS user_name FROM ticket_noc_comment AS tnc
                INNER JOIN Users AS u ON u.user_id = tnc.commented_by
                WHERE tnc.ticket_id=? AND comment_status='Active'`, [ticket_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //update noc comment
    updateNocComment: (data) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE ticket_noc_comment SET noc_comments=?, commented_by=? WHERE ticket_noc_comment_id = ?`,
                [data.comment, data.commented_by, data.ticket_noc_comment_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //delete noc comment
    deleteNocComment: (ticket_noc_comment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `DELETE FROM ticket_noc_comment WHERE ticket_noc_comment_id= ?`,[ticket_noc_comment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //add comment as a job card
    addNocComment: (data) =>{
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO ticket_service(ticket_id,ticket_agent_id,ticket_action_description,activity_location,service_title,service_category_id,ticket_update_time) VALUES (?,?,?,?,?,?,?)`,
                [data.ticket_id,data.commented_by,data.comment,'','Noc Update','1',data.comment_date],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    //get map distribution
    getMapDistribution: (company_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
                SUBSTRING_INDEX(ticket_service.activity_location, ',', 1) AS lat,
                SUBSTRING_INDEX(ticket_service.activity_location, ',', -1) AS lon,
                ticket_service.service_title,
                ticket_service_image.ticket_service_image,
                customer.customer_name,
                ticket.ticket_no,
                DATE_FORMAT(ticket.ticket_actual_time, '%Y-%m-%d') AS ticket_actual_time,
                ticket.ticket_state,
                ticket.ticket_status,
                site.site_name,
                service_type.service_name,
                ticket_service.ticket_update_time,
                ticket_service.ticket_action_description,
                CONCAT(Users.user_firstname, ' ', Users.user_lastname) AS user_name
              FROM ticket_service
              INNER JOIN ticket_service_image ON ticket_service_image.ticket_service_id = ticket_service.ticket_service_id 
              INNER JOIN ticket ON ticket.ticket_id = ticket_service.ticket_id
              INNER JOIN service_type ON service_type.service_type_id = ticket.ticket_service_type_id
              INNER JOIN site ON site.site_id = ticket.ticket_site_id
              INNER JOIN customer ON customer.customer_id = ticket.ticket_customer_id
              INNER JOIN Users ON ticket_service.ticket_agent_id = Users.user_id 
              WHERE service_type.service_type_branch_id = ?`,[company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get site details by id
    getSiteById: (site_id) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT site.*, customer.customer_name FROM site 
                 INNER JOIN customer ON customer.customer_id = site.site_customer_id
                 WHERE site.site_id = ?`,
                [site_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //update noc comment
    updateSite: (data) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `UPDATE site SET site_name=?, site_description=?, site_latitude=?, site_longtitude=?, site_region_id=?  WHERE site_id = ?`,
                [data.site_name, data.site_description, data.site_latitude,data.site_longtitude,data.site_region_id,data.site_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //Delete Ticket
    deleteTicket: (ticket_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `DELETE FROM ticket WHERE ticket_id= ?`,[ticket_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //active technician
    activeTechnician: (company_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT COUNT(DISTINCT ticket_assign.agent_id) AS active_user_count
    FROM ticket_assign
    JOIN Users ON Users.user_id = ticket_assign.agent_id
    WHERE Users.user_company_id = ?
    AND tickect_acknoledge_date != ''
    AND DATE_FORMAT(STR_TO_DATE(ticket_assign_time, '%a %b %d %Y %H:%i:%s GMT+0300 (East Africa Time)'), '%Y-%m-%d') = CURDATE()`,[company_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //ticket fault  distribution
    getTicketFaults: (company_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
                SUBSTRING_INDEX(ticket_fault_cause.fault_location, ',', 1) AS lat,
                SUBSTRING_INDEX(ticket_fault_cause.fault_location, ',', -1) AS lon,
                ticket_fault_cause.fault_type,
                ticket_fault_cause.fault_cause,
                ticket_fault_cause.fault_description,
                ticket_fault_cause.fault_create_date,
                customer.customer_name,
                ticket.ticket_no,
                DATE_FORMAT(ticket.ticket_actual_time, '%Y-%m-%d') AS ticket_actual_time,
                ticket.ticket_state,
                ticket.ticket_status,
                site.site_name,
                service_type.service_name,
                CONCAT(Users.user_firstname, ' ', Users.user_lastname) AS user_name
              FROM ticket_fault_cause 
              INNER JOIN ticket ON ticket.ticket_id = ticket_fault_cause.ticket_id
              INNER JOIN service_type ON service_type.service_type_id = ticket.ticket_service_type_id
              INNER JOIN site ON site.site_id = ticket.ticket_site_id
              INNER JOIN customer ON customer.customer_id = ticket.ticket_customer_id
              INNER JOIN Users ON ticket_fault_cause.user_id = Users.user_id 
              WHERE service_type.service_type_branch_id = ?`,[company_id],
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
