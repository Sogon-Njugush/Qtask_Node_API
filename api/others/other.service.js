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
                                    SELECT STR_TO_DATE(ticket_hold_time, '%Y-%m-%dT%H:%i:%s') AS start_time,
                                           STR_TO_DATE(ticket_release_time, '%Y-%m-%dT%H:%i:%s') AS end_time 
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
    }
    //end
};
