const pool = require("../../config/database");

module.exports = {
    createServiceCategory:(data) => {
        return new Promise((resolve, reject) => {

            const insertServiceCategoryQuery = `insert into service_category(service_category_type_id,service_category_name,service_category_status,data_type_entry,photo_required) 
                values(?,?,?,?,?)`;

            const insertServiceCategoryValues = [
                data.service_category_type_id,
                data.service_category_name,
                data.service_category_status,
                data.data_type_entry,
                data.photo_required
            ];

            pool.query(insertServiceCategoryQuery, insertServiceCategoryValues, (error, results, fields) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve({results});
                }
            });

        });
    },
    updateServiceCategory:(data) => {
        return new Promise((resolve, reject) => {

            const updateServiceCategoryQuery = `update service_category set service_category_type_id=?,service_category_name=?,data_type_entry=?,photo_required=? where service_category_id=?`;
            const updateServiceCategoryValues = [
                data.service_category_type_id,
                data.service_category_name,
                data.data_type_entry,
                data.photo_required,
                data.service_category_id
            ];

            pool.query(updateServiceCategoryQuery, updateServiceCategoryValues, (error, results, fields) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve({results});
                }
            });

        });
    },
    getServiceCategoryByBranchId: (company_id) => {

        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT sc.*, st.* FROM service_category AS sc INNER JOIN service_type AS st ON sc.service_category_type_id = st.service_type_id where st.service_type_branch_id = ?`,
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
    createService:(data) => {
        return new Promise((resolve, reject) => {

            const insertServiceQuery = `insert into service_type(service_name,service_type_priority_id,service_type_branch_id,service_type_status) 
                values(?,?,?,?)`;

            const insertServiceValues = [
                data.service_name,
                data.service_type_priority_id,
                data.service_type_branch_id,
                data.service_type_status
            ];

            pool.query(insertServiceQuery, insertServiceValues, (error, results, fields) => {
                if (error) {
                    return reject(error);
                } else {
                    const service_category_type_id = results.insertId;
                    const items = data.items_array || [];

                    if(items.length > 0) {
                        for (const item of items) {
                            const insertServiceCategoryQuery = `insert into service_category(service_category_type_id,service_category_name,service_category_status,data_type_entry,photo_required) 
                values(?,?,?,?,?)`;

                            const insertServiceCategoryValues = [
                                service_category_type_id,
                                item["service_category_name"],
                                item["service_category_status"],
                                item["data_type_entry"],
                                item["photo_required"]
                            ];

                            pool.query(insertServiceCategoryQuery, insertServiceCategoryValues, (error, results, fields) => {
                                if (error) {
                                    return reject(error);
                                }
                            });
                        }
                    }

                    return resolve({results});
                }
            });

        });
    },
    updateService:(data) => {
        return new Promise((resolve, reject) => {

            const updateServiceQuery = `update service_type set service_name=?,service_type_priority_id=? where service_type_id=?`;

            const updateServiceValues = [
                data.service_name,
                data.service_type_priority_id,
                data.service_type_id
            ];

            pool.query(updateServiceQuery, updateServiceValues, (error, results, fields) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve({results});
                }
            });

        });
    },
    getServiceByBranchId: (company_id) => {

        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT st.*, p.* FROM service_type AS st INNER JOIN priority AS p ON st.service_type_priority_id = p.priority_id where st.service_type_branch_id = ?`,
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
}