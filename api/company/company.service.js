const pool = require("../../config/database");

module.exports = {
    createCompany:(data) => {
        return new Promise((resolve, reject) => {

            const datetime = new Date();

            const insertCompanyQuery = `insert into company(company_name,company_warehouse_url,company_warehouse_token,company_logo,company_create_date,company_email,company_contact,company_code,company_password,company_password_status,company_created_by) 
                values(?,?,?,?,?,?,?,?,?,?,?)`;

            const insertCompanyModuleQuery = `insert into company_module(company_id,module_id,module_status,company_module_create_date,company_module_subscription) 
                values(?,?,?,?,?)`;


            const insertCompanyValues = [
                data.company_name,
                data.company_warehouse_url,
                data.company_warehouse_token,
                data.company_logo,
                datetime.toString(),
                data.company_email,
                data.company_contact,
                data.company_code,
                data.company_password,
                '',
                data.company_created_by,
            ];

            pool.query(insertCompanyQuery, insertCompanyValues, (error, results, fields) => {
                if (error) {
                    return reject(error);
                } else {


                    const companyId = results.insertId;


                    for(let i = 0; i <= data.module.length - 1; i++){

                        const insertCompanyModuleValues = [
                            companyId,
                            data.module[i]["module_id"],
                            "active",
                            datetime.toString(),
                            data.module[i]["module_subscription"],
                        ];

                        pool.query(insertCompanyModuleQuery, insertCompanyModuleValues, (error, results, fields) => {
                            if (error) {
                                return reject(error);
                            } else {

                                if(i === data.module.length - 1){
                                    const insertedId = results.insertId;
                                    return resolve({results, ...insertedId});
                                }
                            }
                        });

                    }
                }
            });

        });
    },
    getCompany: () => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT c.*, cm.*, m.* FROM company AS c INNER JOIN company_module AS cm ON c.company_id = cm.company_id INNER JOIN module AS m ON cm.module_id = m.module_id`,
                [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    updateCompany:(data) => {
        return new Promise((resolve, reject) => {

            const updateCompanyQuery = `update company set company_name=?,company_warehouse_url=?,company_warehouse_token=?,company_email=?,company_contact=?,company_code=? where company_id=?`;


            const updateCompanyValues = [
                data.company_name,
                data.company_warehouse_url,
                data.company_warehouse_token,
                data.company_email,
                data.company_contact,
                data.company_code,
                data.company_id,
            ];

            pool.query(updateCompanyQuery, updateCompanyValues, (error, results, fields) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve({results});
                }
            });

        });
    },
}
//
