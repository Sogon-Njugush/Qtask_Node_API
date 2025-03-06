const pool = require('../../config/database');

module.exports = {
    // Create Project Closure Parameter
    createProjectClosureParameter: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO project_closure_parameter 
                (parameter_name, company_id, parameter_category, parameter_status, parameter_created_by) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    data.parameter_name,
                    data.company_id,
                    data.parameter_category,
                    'Active',
                    data.parameter_created_by
                ],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Get Project Closure Parameters
    getProjectClosureParameters: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM project_closure_parameter WHERE company_id = ?`,
                [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Get Project Closure Parameter by ID
    getProjectClosureParameter: (project_closure_parameter_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM project_closure_parameter WHERE project_closure_parameter_id = ?`,
                [project_closure_parameter_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Update Project Closure Parameter
    updateProjectClosureParameter: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE project_closure_parameter 
                SET parameter_name = ?, parameter_category = ? 
                WHERE project_closure_parameter_id = ?`,
                [
                    data.parameter_name,
                    data.parameter_category,
                    data.project_closure_parameter_id
                ],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Delete Project Closure Parameter
    deleteProjectClosureParameter: (project_closure_parameter_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE project_closure_parameter SET parameter_status = 'Deleted' WHERE project_closure_parameter_id = ?`,
                [project_closure_parameter_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    // Create Segment Acceptance Handover
    createSegmentAcceptance: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO segment_acceptance_handover 
                (acceptance_segment_id, acceptance_score, acceptance_description, acceptance_parameter_id, acceptance_file, acceptance_date, acceptance_user_id, acceptance_status,acceptance_approval_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
                [
                    data.acceptance_segment_id,
                    data.acceptance_score,
                    data.acceptance_description,
                    data.acceptance_parameter_id,
                    data.acceptance_file,
                    data.acceptance_date,
                    data.acceptance_user_id,
                    'Active',
                    'Pending'
                ],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Get Segment Acceptance by ID
    getSegmentAcceptanceById: (segment_acceptance_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT sah.*, pcp.parameter_name FROM segment_acceptance_handover sah
  INNER JOIN project_closure_parameter pcp ON sah.acceptance_parameter_id = pcp.project_closure_parameter_id
        WHERE sah.segment_acceptance_id = ?`,
                [segment_acceptance_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Get All Segment Acceptances
    getAllSegmentAcceptances: (segment_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT sah.*, pcp.parameter_name FROM segment_acceptance_handover sah
        INNER JOIN project_closure_parameter pcp ON sah.acceptance_parameter_id = pcp.project_closure_parameter_id
        WHERE sah.acceptance_segment_id = ?`,
                [segment_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Update Segment Acceptance
    updateSegmentAcceptance: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_acceptance_handover 
                SET acceptance_score = ?, acceptance_description = ?, acceptance_parameter_id = ?, acceptance_file = ?, acceptance_date = ?, acceptance_user_id = ? 
                WHERE segment_acceptance_id = ?`,
                [
                    data.acceptance_score,
                    data.acceptance_description,
                    data.acceptance_parameter_id,
                    data.acceptance_file,
                    data.acceptance_date,
                    data.acceptance_user_id,
                    data.segment_acceptance_id
                ],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Soft Delete Segment Acceptance (update acceptance_status to "Deleted")
    deleteSegmentAcceptance: (segment_acceptance_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_acceptance_handover 
                SET acceptance_status = 'Deleted' 
                WHERE segment_acceptance_id = ?`,
                [segment_acceptance_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    // Create Segment Closure Check
    createSegmentClosureCheck: (dataArray) => {
        return new Promise((resolve, reject) => {
            // Create an array of value arrays for the bulk insert
            const values = dataArray.map(data => [
                data.project_closure_parameter_id,
                data.segment_id,
                data.create_date,
                'Active',
                data.user_id
            ]);

            // Construct the query for bulk insert
            const query = `
            INSERT INTO segment_closure_check 
            (project_closure_parameter_id, segment_id, closure_check_date, closure_check_status, closure_check_user_id) 
            VALUES ?
        `;

            // Execute the bulk insert query
            pool.query(query, [values], (error, results, fields) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    // Get Segment Closure Check by ID
    getSegmentClosureCheckById: (segment_closure_check_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM segment_closure_check WHERE segment_closure_check_id = ?`,
                [segment_closure_check_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Get All Segment Closure Checks
    getAllSegmentClosureChecks: (segment_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM segment_closure_check`,[segment_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Update Segment Closure Check
    updateSegmentClosureCheck: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_closure_check 
                SET project_closure_parameter_id = ?
                WHERE segment_closure_check_id = ?`,
                [
                    data.project_closure_parameter_id,
                    data.segment_closure_check_id
                ],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Soft Delete Segment Closure Check (update closure_check_status to "Deleted")
    deleteSegmentClosureCheck: (segment_closure_check_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_closure_check 
                SET closure_check_status = 'Deleted' 
                WHERE segment_closure_check_id = ?`,
                [segment_closure_check_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //Segment closure parameter checks with pass execution check
    getAllSegmentClosureWithPassChecks: (segment_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT scc.* FROM segment_closure_check scc
  LEFT JOIN segment_acceptance_handover sah
    ON scc.segment_closure_check_id = sah.acceptance_parameter_id
    AND sah.acceptance_score = 'Pass'
  WHERE sah.acceptance_parameter_id IS NULL AND scc.segment_id = ?`,[segment_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    // Approve segment closure entry
    approveSegmentAcceptance: (segment_acceptance_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_acceptance_handover 
                SET acceptance_approval_status = 'Approved' 
                WHERE segment_acceptance_id = ?`,
                [segment_acceptance_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    // Decline segment closure entry
    declineSegmentAcceptance: (segment_acceptance_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_acceptance_handover 
                SET acceptance_approval_status = 'Declined' 
                WHERE segment_acceptance_id = ?`,
                [segment_acceptance_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

  };
