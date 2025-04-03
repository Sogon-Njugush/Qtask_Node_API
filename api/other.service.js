const pool = require('../../config/database');


module.exports = {
    //get roles
    getRoles:  () => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT role_id, role_name FROM roles WHERE role_status="Active"`,
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //ticket sla tracking clone job
    getSlaTracking: () => {
        return new Promise((resolve, reject) => {
            pool.query(
                `
                SELECT ticket.ticket_id, ticket.ticket_status, ticket.ticket_actual_time, 
                       sla.sla_time_hrs, sla.sla_time_min
                FROM ticket
                INNER JOIN sla ON sla.sla_id = ticket.ticket_sla_id
                WHERE ticket.ticket_status != 'On-hold' 
                  AND ticket.ticket_status != 'closed' 
                  AND YEAR(ticket.ticket_actual_time) = YEAR(CURDATE()) 
                  AND MONTH(ticket.ticket_actual_time) = MONTH(CURDATE())
                  AND DATE_ADD(ticket.ticket_actual_time, INTERVAL sla.sla_time_hrs HOUR + sla.sla_time_min MINUTE) >= CURDATE();
                `,
                async (error, tickets) => {
                    if (error) {
                        return reject(error);
                    }

                    const results = await Promise.all(
                        tickets.map(async (ticket) => {
                            const ticketId = ticket.ticket_id;
                            const ticketCreateTime = new Date(ticket.ticket_actual_time);
                            const totalSlaMinutes = (ticket.sla_time_hrs * 60) + ticket.sla_time_min;

                            // Get hold time for the ticket
                            const [holdData] = await pool.query(
                                `
                                SELECT SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)) AS hold_minutes
                                FROM (
                                    SELECT STR_TO_DATE(ticket_hold_time, '%Y-%m-%d %H:%i:%s') AS start_time,
                                           STR_TO_DATE(ticket_release_time, '%Y-%m-%d %H:%i:%s') AS end_time 
                                    FROM ticket_hold 
                                    WHERE ticket_id = ?
                                ) AS hold_times
                                `, [ticketId]
                            );

                            const totalHoldMinutes = holdData[0]?.hold_minutes || 0;

                            // Get time spent based on ticket status
                            let timeSpentQuery = `
                                SELECT TIMESTAMPDIFF(MINUTE, STR_TO_DATE(ticket.ticket_actual_time, '%Y-%m-%dT%H:%i:%s'), NOW()) AS time_spent
                                FROM ticket
                                WHERE ticket_id = ?`;

                            if (ticket.ticket_status === 'closed') {
                                timeSpentQuery = `
                                    SELECT TIMESTAMPDIFF(MINUTE, STR_TO_DATE(ticket.ticket_actual_time, '%Y-%m-%dT%H:%i:%s'), STR_TO_DATE(noc_close_ticket.noc_close_time, '%Y-%m-%dT%H:%i:%s')) AS time_spent
                                    FROM ticket
                                    INNER JOIN noc_close_ticket ON noc_close_ticket.ticket_id = ticket.ticket_id
                                    WHERE ticket.ticket_id = ?`;
                            }

                            const [timeSpentData] = await pool.query(timeSpentQuery, [ticketId]);
                            const timeSpentMinutes = (timeSpentData[0]?.time_spent || 0) - totalHoldMinutes;

                            // Determine SLA status
                            let slaStatus = 'waiting';
                            if (ticketCreateTime <= new Date()) {
                                slaStatus = timeSpentMinutes > totalSlaMinutes ? 'breached' : 'within';
                            }

                            // Update ticket with SLA status
                            await pool.query(
                                `UPDATE ticket SET ticket_state = ? WHERE ticket_id = ?`,
                                [slaStatus, ticketId]
                            );

                            return {
                                ticket_id: ticketId,
                                sla_status: slaStatus,
                                total_hold_minutes: totalHoldMinutes,
                                time_spent_minutes: timeSpentMinutes,
                                total_sla_minutes: totalSlaMinutes
                            };
                        })
                    );

                    return resolve(results);
                }
            );
        });
    },
    //user update
    updateUser: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Start transaction
                await pool.query('START TRANSACTION');

                // Update user details (excluding password)
                await pool.query(
                    `UPDATE Users SET 
                user_firstname = ?, 
                user_lastname = ?, 
                user_email_address = ?,  
                user_contact = ?, 
                user_country_code = ?
                WHERE user_id = ?`,
                    [
                        data.first_name,
                        data.last_name,
                        data.user_email,
                        data.user_contact,
                        data.user_country_code,
                        data.user_id
                    ]
                );

                // Commit transaction
                await pool.query('COMMIT');
                resolve({ success: true, message: "User updated successfully" });
            } catch (error) {
                await pool.query('ROLLBACK');
                console.error("Error updating user:", error);
                reject({
                    success: false,
                    message: error.message,
                    stack: error.stack
                });
            }
        });
    },
    // Create a new user role relationship
    createUserRole: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO user_role (user_id, role_id, user_role_status) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE user_role_status = 'Active'`,
                [data.user_id, data.role_id, 'Active'],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    // Get all user role relationships with optional filters (only joining roles table)
    getUserRoles: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT user_role.*, 
                roles.role_name 
                FROM user_role
                LEFT JOIN roles ON roles.role_id = user_role.role_id
                WHERE user_role.user_id = ?`,
                [user_id],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results || null);
                }
            );
        });
    },

    // Get a specific user role relationship by ID (only joining roles table)
    getUserRole: (user_role_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT user_role.*, 
                roles.role_name 
                FROM user_role
                LEFT JOIN roles ON roles.role_id = user_role.role_id
                WHERE user_role.user_role_id = ?`,
                [user_role_id],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results || null);
                }
            );
        });
    },
    // Update a user role relationship
    updateUserRole: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT user_id FROM user_role WHERE user_role_id = ?`,
                [data.user_role_id],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    if (results.length === 0) {
                        return reject(new Error("User role entry not found"));
                    }

                    const user_id = results[0].user_id;

                    // Check if the new (user_id, role_id) combination already exists
                    pool.query(
                        `SELECT * FROM user_role WHERE user_id = ? AND role_id = ? AND user_role_id != ?`,
                        [user_id, data.role_id, data.user_role_id],
                        (checkError, checkResults) => {
                            if (checkError) {
                                return reject(checkError);
                            }
                            if (checkResults.length > 0) {
                                return reject(new Error("Duplicate entry: This user already has this role"));
                            }

                            // Proceed with the update if no duplicate is found
                            pool.query(
                                `UPDATE user_role SET role_id = ? WHERE user_role_id = ?`,
                                [data.role_id, data.user_role_id],
                                (updateError, updateResults) => {
                                    if (updateError) {
                                        return reject(updateError);
                                    }
                                    return resolve(updateResults);
                                }
                            );
                        }
                    );
                }
            );
        });
    },

    //deactivated  a user role relationship
    deleteUserRole: (user_role_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE user_role SET user_role_status = ?  WHERE user_role_id = ?`,
                ['Inactive',user_role_id],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    //Activated  a user role relationship
    activateUserRole: (user_role_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE user_role SET user_role_status = ?  WHERE user_role_id = ?`,
                ['Active',user_role_id],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    }
    //end
};
