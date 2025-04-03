const axios = require('axios');

const pool = require('../../config/database');

module.exports = {
    // Create Budget Item
    createBudgetItem: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO budget_item 
                (budget_item_name, company_id, budget_item_status, budget_item_user_id, budget_item_date) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    data.budget_item_name,
                    data.company_id,
                    'Active',
                    data.budget_item_user_id,
                    data.budget_item_date
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

    // Get All Budget Items
    getBudgetItems: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM budget_item WHERE company_id = ? AND  budget_item_status = ?`,
                [company_id, 'Active'],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Get Budget Item by ID
    getBudgetItem: (budget_item_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM budget_item WHERE budget_item_id = ?`,
                [budget_item_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    // Update Budget Item
    updateBudgetItem: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE budget_item 
                SET budget_item_name = ?
                WHERE budget_item_id = ?`,
                [
                    data.budget_item_name,
                    data.budget_item_id
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

    // Delete Budget Item
    deleteBudgetItem: (budget_item_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE budget_item SET budget_item_status = 'Deleted' WHERE budget_item_id = ?`,
                [budget_item_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //set segment budget

    // Create a new segment budget
    createSegmentBudget: (dataArray) => {
        return new Promise((resolve, reject) => {
            // Create an array of value placeholders for the batch insert
            const values = dataArray.map(data => [
                data.segment_id,
                data.budget_item_id,
                data.budget_item_type,
                data.budget_item_count,
                data.budget_item_amount,
                'Active', // Default status
                 '',
                data.budget_item_date,
                data.budget_item_user_id
            ]);

            // Construct the query for batch insert
            const query = `
            INSERT INTO segment_budget 
            (segment_id, budget_item_id, budget_item_type, budget_item_count, budget_item_amount, budget_item_status,budget_actual_amount,budget_item_date, budget_item_user_id) 
            VALUES ?
        `;

            // Execute the batch insert query
            pool.query(query, [values], (error, results, fields) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
    // Get all segment budgets for a specific segment_id
    getSegmentBudgets: (segment_id, token, baseUrl) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Fetch initial segment budget data
                pool.query(
                    `SELECT 
                    sb.*,
                    COALESCE(
                        NULLIF(
                            CASE
                                WHEN sb.budget_item_type = 'Material' THEN sbm.material_quantity
                                WHEN sb.budget_item_type = 'Labour' THEN NULL
                                ELSE NULL
                            END, 0
                        ), sb.budget_item_count
                    ) AS item_count,
                    CASE
                        WHEN sb.budget_item_type = 'Material' THEN sbm.material_id
                        WHEN sb.budget_item_type = 'Labour' THEN bi.budget_item_name
                        ELSE NULL
                    END AS item_name,
                    (COALESCE(
                        NULLIF(
                            CASE
                                WHEN sb.budget_item_type = 'Material' THEN sbm.material_quantity
                                WHEN sb.budget_item_type = 'Labour' THEN NULL
                                ELSE NULL
                            END, 0
                        ), sb.budget_item_count
                    ) * sb.budget_item_amount) AS estimated_cost,
                    CASE
                        WHEN sb.budget_item_type = 'Material' THEN 
                            COALESCE(
                                (SELECT SUM(pmd.material_quantity) 
                                 FROM project_material_dispense pmd
                                 WHERE pmd.segment_id = sb.segment_id
                                   AND pmd.material_id = sbm.bom_material_id
                                ), 0
                            )
                        WHEN sb.budget_item_type = 'Labour' THEN 
                            COALESCE(
                                (SELECT SUM(dbi.dispensed_item_quantity) 
                                 FROM dispensed_budget_item dbi
                                 WHERE dbi.segment_budget_id = sb.segment_budget_id
                                ), 0
                            )
                        ELSE 0
                    END AS total_used_items,
                    CASE
                        WHEN sb.budget_item_type = 'Material' THEN 
                            COALESCE(
                                (SELECT SUM(pmd.material_quantity) 
                                 FROM project_material_dispense pmd
                                 WHERE pmd.segment_id = sb.segment_id
                                   AND pmd.material_id = sbm.bom_material_id
                                ) * sb.budget_item_amount, 0
                            )
                        WHEN sb.budget_item_type = 'Labour' THEN 
                            COALESCE(
                                (SELECT SUM(dbi.dispensed_item_quantity) 
                                 FROM dispensed_budget_item dbi
                                 WHERE dbi.segment_budget_id = sb.segment_budget_id
                                ) * sb.budget_item_amount, 0
                            )
                        ELSE 0
                    END AS total_amount_spent
                FROM 
                    segment_budget sb
                LEFT JOIN 
                    segment_bom_material sbm ON sb.budget_item_id = sbm.bom_material_id AND sb.budget_item_type = 'Material'
                LEFT JOIN 
                    budget_item bi ON sb.budget_item_id = bi.budget_item_id AND sb.budget_item_type = 'Labour'
                WHERE 
                    sb.segment_id = ?
                    AND sb.budget_item_status = 'Active'
                GROUP BY 
                    item_name`,
                    [segment_id],
                    async (error, results, fields) => {
                        if (error) {
                            return reject(error);
                        }

                        // Loop through results and fetch material details for Material items
                        for (let item of results) {
                            if (item.budget_item_type === 'Material') {
                                try {
                                    const erpUrl = `${baseUrl}Item?fields=["name","item_code","item_name","stock_uom","standard_rate","valuation_rate"]&filters=[["Item","item_code","=","${encodeURIComponent(item.item_name)}"]]`;
                                    const erpResponse = await axios.get(erpUrl, {
                                        headers: {
                                            'Authorization': `token ${token}`,
                                        },
                                    });

                                    if (erpResponse.data && Array.isArray(erpResponse.data.data) && erpResponse.data.data.length > 0) {
                                        item.item_name = erpResponse.data.data[0].item_name; // Update item_name with material_name from ERP
                                    }
                                } catch (erpError) {
                                    console.error('Error fetching material details:', erpError.message);
                                    // Handle error (e.g., log it or skip updating the item_name)
                                }
                            }
                        }

                        return resolve(results);
                    }
                );
            } catch (e) {
                reject(e);
            }
        });
    },
    // Get a segment budget by ID
    getSegmentBudgetById: (segment_budget_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM segment_budget WHERE segment_budget_id = ?`,
                [segment_budget_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results[0]);
                }
            );
        });
    },
    // Update a segment budget
    updateSegmentBudget: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_budget 
                SET  budget_item_id = ?, budget_item_type = ?,budget_item_count = ?, budget_item_amount = ?
                WHERE segment_budget_id = ?`,
                [
                    data.budget_item_id,
                    data.budget_item_type,
                    data.budget_item_count,
                    data.budget_item_amount,
                    data.segment_budget_id
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
    // Update a segment budget
    updateSegmentActualBudget: (data) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_budget 
                SET budget_actual_amount = ? WHERE segment_budget_id = ?`,
                [
                    data.budget_actual_amount,
                    data.segment_budget_id
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
    // Delete a segment budget
    deleteSegmentBudget: (segment_budget_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE segment_budget SET budget_item_status = 'Deleted' WHERE segment_budget_id = ?`,
                [segment_budget_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //budget dashboard
    //budget expenditure
    getSegmentExpenditure: (segment_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Fetch initial segment budget data
                pool.query(
                    `SELECT 
    sb.*,
    COALESCE(
        NULLIF(
            CASE
                WHEN sb.budget_item_type = 'Material' THEN sbm.material_quantity
                WHEN sb.budget_item_type = 'Labour' THEN NULL
                ELSE NULL
            END, 0
        ), sb.budget_item_count
    ) AS item_count,
    CASE
        WHEN sb.budget_item_type = 'Material' THEN sbm.material_id
        WHEN sb.budget_item_type = 'Labour' THEN bi.budget_item_name
        ELSE NULL
    END AS item_name,
    (COALESCE(
        NULLIF(
            CASE
                WHEN sb.budget_item_type = 'Material' THEN sbm.material_quantity
                WHEN sb.budget_item_type = 'Labour' THEN NULL
                ELSE NULL
            END, 0
        ), sb.budget_item_count
    ) * sb.budget_item_amount) AS estimated_cost,
    CASE
        WHEN sb.budget_item_type = 'Material' THEN 
            COALESCE(
                (SELECT SUM(pmd.material_quantity) 
                 FROM project_material_dispense pmd
                 WHERE pmd.segment_id = sb.segment_id
                   AND pmd.material_id = sbm.bom_material_id
                ), 0
            )
        WHEN sb.budget_item_type = 'Labour' THEN 
            COALESCE(
                (SELECT SUM(dbi.dispensed_item_quantity) 
                 FROM dispensed_budget_item dbi
                 WHERE dbi.segment_budget_id = sb.segment_budget_id
                ), 0
            )
        ELSE 0
    END AS total_used_items,
    CASE
        WHEN sb.budget_item_type = 'Material' THEN 
            COALESCE(
                (SELECT SUM(pmd.material_quantity) 
                 FROM project_material_dispense pmd
                 WHERE pmd.segment_id = sb.segment_id
                   AND pmd.material_id = sbm.bom_material_id
                ) * sb.budget_item_amount, 0
            )
        WHEN sb.budget_item_type = 'Labour' THEN 
            COALESCE(
                (SELECT SUM(dbi.dispensed_item_quantity) 
                 FROM dispensed_budget_item dbi
                 WHERE dbi.segment_budget_id = sb.segment_budget_id
                ) * sb.budget_item_amount, 0
            )
        ELSE 0
    END AS total_amount_spent,
    SUM((COALESCE(
        NULLIF(
            CASE
                WHEN sb.budget_item_type = 'Material' THEN sbm.material_quantity
                WHEN sb.budget_item_type = 'Labour' THEN NULL
                ELSE NULL
            END, 0
        ), sb.budget_item_count
    ) * sb.budget_item_amount)) OVER () AS sum_estimated_cost,
    SUM(
        CASE
            WHEN sb.budget_item_type = 'Material' THEN 
                COALESCE(
                    (SELECT SUM(pmd.material_quantity) 
                     FROM project_material_dispense pmd
                     WHERE pmd.segment_id = sb.segment_id
                       AND pmd.material_id = sbm.bom_material_id
                    ) * sb.budget_item_amount, 0
                )
            WHEN sb.budget_item_type = 'Labour' THEN 
                COALESCE(
                    (SELECT SUM(dbi.dispensed_item_quantity) 
                     FROM dispensed_budget_item dbi
                     WHERE dbi.segment_budget_id = sb.segment_budget_id
                    ) * sb.budget_item_amount, 0
                )
            ELSE 0
        END
    ) OVER () AS sum_total_amount_spent,
    SUM(sb.budget_actual_amount) OVER () AS sum_budget_actual_amount
FROM 
    segment_budget sb
LEFT JOIN 
    segment_bom_material sbm ON sb.budget_item_id = sbm.bom_material_id AND sb.budget_item_type = 'Material'
LEFT JOIN 
    budget_item bi ON sb.budget_item_id = bi.budget_item_id AND sb.budget_item_type = 'Labour'
WHERE 
    sb.segment_id = ?
    AND sb.budget_item_status = 'Active'
GROUP BY 
    item_name`,
                    [segment_id],
                    async (error, results, fields) => {
                        if (error) {
                            return reject(error);
                        }

                        // Loop through results and fetch material details for Material items
                        for (let item of results) {
                            if (item.budget_item_type === 'Material') {
                                try {
                                    const erpUrl = `${baseUrl}Item?fields=["name","item_code","item_name","stock_uom","standard_rate","valuation_rate"]&filters=[["Item","item_code","=","${encodeURIComponent(item.item_name)}"]]`;
                                    const erpResponse = await axios.get(erpUrl, {
                                        headers: {
                                            'Authorization': `token ${token}`,
                                        },
                                    });

                                    if (erpResponse.data && Array.isArray(erpResponse.data.data) && erpResponse.data.data.length > 0) {
                                        // Add material_name to the result
                                        item.material_name = erpResponse.data.data[0].item_name;
                                    } else {
                                        // If no data is found, set material_name to null or item_name
                                        item.material_name = null;
                                    }
                                } catch (erpError) {
                                    console.error('Error fetching material details:', erpError.message);
                                    // If there's an error, set material_name to null
                                    item.material_name = null;
                                }
                            } else {
                                // For non-Material items, set material_name to null
                                item.material_name = null;
                            }
                        }

                        return resolve(results);
                    }
                );
            } catch (e) {
                reject(e);
            }
        });
    },
    //project budget report
    getProjectExpenditure: (project_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Fetch initial segment budget data
                pool.query(
                    `SELECT 
    sb.*,
    COALESCE(
        NULLIF(
            CASE
                WHEN sb.budget_item_type = 'Material' THEN sbm.material_quantity
                WHEN sb.budget_item_type = 'Labour' THEN NULL
                ELSE NULL
            END, 0
        ), sb.budget_item_count
    ) AS item_count,
    CASE
        WHEN sb.budget_item_type = 'Material' THEN sbm.material_id
        WHEN sb.budget_item_type = 'Labour' THEN bi.budget_item_name
        ELSE NULL
    END AS item_name,
    (COALESCE(
        NULLIF(
            CASE
                WHEN sb.budget_item_type = 'Material' THEN sbm.material_quantity
                WHEN sb.budget_item_type = 'Labour' THEN NULL
                ELSE NULL
            END, 0
        ), sb.budget_item_count
    ) * sb.budget_item_amount) AS estimated_cost,
    CASE
        WHEN sb.budget_item_type = 'Material' THEN 
            COALESCE(
                (SELECT SUM(pmd.material_quantity) 
                 FROM project_material_dispense pmd
                 WHERE pmd.segment_id = sb.segment_id
                   AND pmd.material_id = sbm.bom_material_id
                ), 0
            )
        WHEN sb.budget_item_type = 'Labour' THEN 
            COALESCE(
                (SELECT SUM(dbi.dispensed_item_quantity) 
                 FROM dispensed_budget_item dbi
                 WHERE dbi.segment_budget_id = sb.segment_budget_id
                ), 0
            )
        ELSE 0
    END AS total_used_items,
    CASE
        WHEN sb.budget_item_type = 'Material' THEN 
            COALESCE(
                (SELECT SUM(pmd.material_quantity) 
                 FROM project_material_dispense pmd
                 WHERE pmd.segment_id = sb.segment_id
                   AND pmd.material_id = sbm.bom_material_id
                ) * sb.budget_item_amount, 0
            )
        WHEN sb.budget_item_type = 'Labour' THEN 
            COALESCE(
                (SELECT SUM(dbi.dispensed_item_quantity) 
                 FROM dispensed_budget_item dbi
                 WHERE dbi.segment_budget_id = sb.segment_budget_id
                ) * sb.budget_item_amount, 0
            )
        ELSE 0
    END AS total_amount_spent,
    SUM((COALESCE(
        NULLIF(
            CASE
                WHEN sb.budget_item_type = 'Material' THEN sbm.material_quantity
                WHEN sb.budget_item_type = 'Labour' THEN NULL
                ELSE NULL
            END, 0
        ), sb.budget_item_count
    ) * sb.budget_item_amount)) OVER () AS sum_estimated_cost,
    SUM(
        CASE
            WHEN sb.budget_item_type = 'Material' THEN 
                COALESCE(
                    (SELECT SUM(pmd.material_quantity) 
                     FROM project_material_dispense pmd
                     WHERE pmd.segment_id = sb.segment_id
                       AND pmd.material_id = sbm.bom_material_id
                    ) * sb.budget_item_amount, 0
                )
            WHEN sb.budget_item_type = 'Labour' THEN 
                COALESCE(
                    (SELECT SUM(dbi.dispensed_item_quantity) 
                     FROM dispensed_budget_item dbi
                     WHERE dbi.segment_budget_id = sb.segment_budget_id
                    ) * sb.budget_item_amount, 0
                )
            ELSE 0
        END
    ) OVER () AS sum_total_amount_spent,
    SUM(sb.budget_actual_amount) OVER () AS sum_budget_actual_amount
FROM 
    segment_budget sb
LEFT JOIN 
    segment_bom_material sbm ON sb.budget_item_id = sbm.bom_material_id AND sb.budget_item_type = 'Material'
LEFT JOIN 
    budget_item bi ON sb.budget_item_id = bi.budget_item_id AND sb.budget_item_type = 'Labour'
INNER JOIN 
    project_segment ps ON sb.segment_id = ps.segment_id
WHERE 
    ps.project_id = ?
    AND sb.budget_item_status = 'Active'
GROUP BY 
    sb.segment_budget_id, sb.budget_item_type, sb.budget_item_id, sb.budget_item_count, sb.budget_item_amount, sb.budget_actual_amount, sbm.material_quantity, sbm.material_id, bi.budget_item_name`,
                    [project_id],
                    async (error, results, fields) => {
                        if (error) {
                            return reject(error);
                        }

                        // Loop through results and fetch material details for Material items
                        for (let item of results) {
                            if (item.budget_item_type === 'Material') {
                                try {
                                    const erpUrl = `${baseUrl}Item?fields=["name","item_code","item_name","stock_uom","standard_rate","valuation_rate"]&filters=[["Item","item_code","=","${encodeURIComponent(item.item_name)}"]]`;
                                    const erpResponse = await axios.get(erpUrl, {
                                        headers: {
                                            'Authorization': `token ${token}`,
                                        },
                                    });

                                    if (erpResponse.data && Array.isArray(erpResponse.data.data) && erpResponse.data.data.length > 0) {
                                        // Add material_name to the result
                                        item.material_name = erpResponse.data.data[0].item_name;
                                    } else {
                                        // If no data is found, set material_name to null or item_name
                                        item.material_name = null;
                                    }
                                } catch (erpError) {
                                    console.error('Error fetching material details:', erpError.message);
                                    // If there's an error, set material_name to null
                                    item.material_name = null;
                                }
                            } else {
                                // For non-Material items, set material_name to null
                                item.material_name = null;
                            }
                        }

                        return resolve(results);
                    }
                );
            } catch (e) {
                reject(e);
            }
        });
    },


};
