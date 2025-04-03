const pool = require('../../config/database');
//packages for file upload
const fs = require('fs');
const path = require('path');

module.exports = {
    //create project counts
    getCounts: (segment_id) => {
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    IFNULL(SUM(pmd.material_quantity), 0) AS total_used_materials,
    IFNULL(SUM(sbm.material_quantity), 0) AS total_materials,
    IFNULL(SUM(pjc.service_quantity), 0) AS total_used_services,
    IFNULL(SUM(sis.quantity), 0) AS total_services,
    IFNULL(SUM(sscr.service_change_quantity), 0) AS total_service_changes,
    IFNULL(SUM(smcr.material_change_quantity), 0) AS total_material_changes,
    IFNULL(
        ROUND(
            IFNULL(SUM(pjc.service_quantity), 0) / 
            (IFNULL(SUM(sis.quantity), 0) + IFNULL(SUM(sscr.service_change_quantity), 0)) * 100, 2
        ), 0
    ) AS percentage_progress
FROM project_material_dispense pmd
LEFT JOIN segment_bom_material sbm ON sbm.segment_id = pmd.segment_id
LEFT JOIN project_assign_user pau ON pau.segment_id = pmd.segment_id
LEFT JOIN project_job_card pjc ON pjc.segment_id = pau.segment_assign_id
LEFT JOIN segment_implemetation_service sis ON sis.segment_id = pmd.segment_id
LEFT JOIN segment_service_change_request sscr ON sscr.segment_id = pmd.segment_id 
    AND LOWER(sscr.service_change_status) = 'approved'
LEFT JOIN segment_material_change_request smcr ON smcr.segment_id = pmd.segment_id 
    AND LOWER(smcr.material_change_status) = 'approved'
WHERE pmd.segment_id = ?`,
                [segment_id, segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },

    //get material usage
    getMaterialUsage: (segment_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    sbm.material_id,
    sbm.material_quantity AS initial_quantity,
    IFNULL(SUM(pmd.material_quantity), 0) AS utilized_quantity,
    IFNULL(SUM(smcr.material_change_quantity), 0) AS change_request,
    (sbm.material_quantity + IFNULL(SUM(smcr.material_change_quantity), 0)) AS expected_quantity
FROM 
    segment_bom_material sbm
LEFT JOIN 
    project_material_dispense pmd ON sbm.material_id = pmd.material_id
LEFT JOIN 
    segment_material_change_request smcr ON sbm.segment_id = smcr.segment_id 
    AND sbm.material_id = smcr.material_id 
    AND LOWER(smcr.material_change_status) = 'approved'
WHERE 
    sbm.segment_id = ?
GROUP BY 
    sbm.material_id
`, [segment_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //get Service Progress
    getServiceProgress: (segment_id) => {
        return new Promise((resolve, reject)=> {
            pool.query(
                `SELECT 
    st.service_name,
    sis.quantity AS initial_quantity,
    COALESCE(SUM(pjc.service_quantity), 0) AS utilized_value,
    COALESCE(SUM(sscr.service_change_quantity), 0) AS change_request,
    (sis.quantity + COALESCE(SUM(sscr.service_change_quantity), 0)) AS expected_value,
    (COALESCE(SUM(pjc.service_quantity), 0) / (sis.quantity + COALESCE(SUM(sscr.service_change_quantity), 0))) * 100 AS utilization_percentage
FROM 
    segment_implemetation_service sis
JOIN 
    project_service st ON st.project_service_id = sis.service_type
LEFT JOIN 
    project_job_card pjc ON pjc.service_id = sis.implementation_service_id
LEFT JOIN 
    segment_service_change_request sscr ON sscr.segment_id = sis.segment_id 
    AND sscr.service_id = sis.service_type 
    AND LOWER(sscr.service_change_status) = 'approved'
WHERE 
    sis.segment_id = ?
GROUP BY 
    sis.implementation_service_id
`, [segment_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);

                }
            );
        });
    },
    //get material change request
    getMaterialChangeRequest: (segment_id) =>{
        return new Promise((resolve, reject)=>{
            pool.query(
                `SELECT 
    st.service_name,
    SUM(sis.quantity) AS total_quantity
FROM 
    segment_implemetation_service sis
JOIN 
    project_segment ps ON ps.segment_id = sis.segment_id
JOIN 
    project_service st ON st.project_service_id = sis.service_type
WHERE 
    ps.project_id = ?
GROUP BY 
    sis.service_type`,
                [segment_id],
                (error, results,fields)=>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get service change request
    getServiceChangeRequest: (segment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    st.service_name,
    IFNULL(SUM(sis.quantity), 0) AS set_quantity,
    IFNULL(SUM(pjc.service_quantity), 0) AS executed_quantity,
    CASE 
        WHEN IFNULL(SUM(sis.quantity), 0) = 0 THEN 0
        ELSE (IFNULL(SUM(pjc.service_quantity), 0) / IFNULL(SUM(sis.quantity), 1)) * 100
    END AS percentage_progress
FROM 
    project_service st
JOIN 
    segment_implemetation_service sis ON st.project_service_id = sis.service_type
JOIN 
    project_segment ps ON ps.segment_id = sis.segment_id
LEFT JOIN 
    project_job_card pjc ON ps.segment_id = pjc.segment_id 
    AND sis.implementation_service_id = pjc.service_id
WHERE 
    ps.project_id = ?
GROUP BY 
    st.project_service_id`,[segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get work load
    getWorkLoad: (segment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    DISTINCT CONCAT(u.user_firstname, ' ', u.user_lastname) AS user_name,
    COUNT(pau.segment_assign_id) AS assignment_count
FROM 
    Users u
JOIN 
    project_assign_user pau ON u.user_id = pau.user_id
JOIN 
    project_segment ps ON pau.segment_id = ps.segment_id
WHERE 
    ps.project_id = ?
GROUP BY 
    user_name`,[segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    // get segment updates
    getSegmentUpdate: (segment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    pj.*, 
    CONCAT(u.user_firstname, ' ', u.user_lastname) AS technician_name,
    st.service_name
FROM project_job_card pj
INNER JOIN Users u ON u.user_id = pj.user_id
INNER JOIN project_assign_user pau ON pau.segment_assign_id = pj.segment_id
INNER JOIN segment_implemetation_service sis ON sis.implementation_service_id =pj.service_id
INNER JOIN project_service st ON st.project_service_id = sis.service_type
WHERE pau.segment_id = ?
ORDER BY pj.project_job_card_id DESC`,[segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
 // material change request
    getMaterialChangeRequestList: (segment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    smcr.material_change_quantity, 
    smcr.material_id, 
    smcr.material_change_status, 
    smcr.material_change_request_date, 
    CONCAT(u.user_firstname, ' ', u.user_lastname) AS requested_by
FROM segment_material_change_request smcr
INNER JOIN Users u ON u.user_id = smcr.material_change_requested_by
WHERE smcr.segment_id = ?`,[segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    // service change request
    getServiceChangeRequestList: (segment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    st.service_name,  
    CONCAT(u.user_firstname, ' ', u.user_lastname) AS requested_by, 
    sscr.service_change_request_id,
    sscr.service_change_quantity,
    sscr.service_change_request_date,
    sscr.service_id 
FROM 
    segment_service_change_request sscr
INNER JOIN 
    project_service st ON st.project_service_id = sscr.service_id
INNER JOIN 
    Users u ON u.user_id = sscr.service_change_requested_by
WHERE 
   COALESCE(sscr.service_change_status, '') = '' 
    AND sscr.segment_id = ?`,[segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
  // incident report
    getIncidentReport: (segment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    ri.incidence_id, ri.segment_id, ri.incidence_message, ri.incidence_location, ri.incidence_image, ri.incidence_file,ri.incidence_date,
    CONCAT(u.user_firstname, ' ', u.user_lastname) AS supervisor_name
FROM 
    report_incidence ri
INNER JOIN 
    Users u ON u.user_id = ri.incidence_supervisor_id
WHERE 
    ri.segment_id = ?
ORDER BY 
    ri.incidence_id DESC`,[segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
//uploaded documents from site
    getUploadedDocument: (segment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    sfu.segment_file_upload_id, sfu.segment_id, sfu.upload_file_name, sfu.upload_location, sfu.file_upload_date,
    CONCAT(u.user_firstname, ' ', u.user_lastname) AS uploaded_by
FROM 
    segment_file_upload sfu
INNER JOIN 
    Users u ON u.user_id = sfu.upload_supervisor_id
WHERE 
    sfu.segment_id = ?
ORDER BY 
    sfu.segment_file_upload_id DESC`,[segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
//segment closure
      approveSegment: async (data) => {
        const connection = await pool.getConnection();
        const uploadDirectory = path.resolve(__dirname, '../../upload/images/');

        try {
            // Ensure the upload directory exists
            if (!fs.existsSync(uploadDirectory)) {
                fs.mkdirSync(uploadDirectory, { recursive: true });
            }

            await connection.beginTransaction();

            // Update project_segment table
            const updateProjectSegment = `
            UPDATE project_segment 
            SET segment_status = 'Closed' 
            WHERE segment_id = ?`;
            const [updateResult] = await connection.query(updateProjectSegment, [data.segment_id]);

            if (updateResult.affectedRows === 0) {
                throw new Error('No segment found with the provided ID.');
            }

            // Update segment_supervisor_closure table
            const updateSegmentSupervisorClosure = `
            UPDATE segment_supervisor_closure 
            SET closure_status = 'Approved', 
                closure_approved_by = ?, 
                closure_approve_date = ?, 
                closure_remark = ? 
            WHERE segment_id = ?`;
            const [closureResult] = await connection.query(updateSegmentSupervisorClosure, [data.user_id, data.date, data.comment, data.segment_id]);

            if (closureResult.affectedRows === 0) {
                throw new Error('Failed to update segment supervisor closure. No matching segment ID.');
            }

            // Get the segment_supervisor_closure_id
            const getSegmentSupervisorClosureId = `
            SELECT segment_supervisor_closure_id 
            FROM segment_supervisor_closure 
            WHERE segment_id = ?`;
            const [results] = await connection.query(getSegmentSupervisorClosureId, [data.segment_id]);

            if (results.length === 0) {
                throw new Error('No supervisor closure ID found');
            }

            const segmentSupervisorClosureId = results[0].segment_supervisor_closure_id;

            // Check if there are files to upload
            if (data.files && data.files.length > 0) {
                const insertClosureDocument = `
                INSERT INTO segment_closure_documents 
                (segment_supervisor_closure_id, closure_document_name, closure_file, closure_file_status, closure_file_uploaded_by)
                VALUES ?`;

                const fileValues = await Promise.all(data.files.map(async (file) => {
                    // Generate a unique file name using timestamp
                    const timestamp = Date.now();
                    const uniqueFileName = `${timestamp}_${file.name}`;
                    const filePath = path.join(uploadDirectory, uniqueFileName);

                    // Save file to the upload directory
                    await fs.promises.writeFile(filePath, file.content);  // Assuming `file.content` contains the file buffer

                    return [
                        segmentSupervisorClosureId,
                        file.title,
                        uniqueFileName,  // Store the unique file name in the database
                        'Active',
                        data.user_id
                    ];
                }));

                // Execute batch insert for files
                await connection.query(insertClosureDocument, [fileValues]);
            }

            // Commit the transaction
            await connection.commit();
            connection.release();
            return "Segment updated and files uploaded successfully.";

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;  // Pass the error up the chain for better error handling/logging
        }
    },
//upload closer documents
    uploadClosureDocuments: (data) => {
        const dateTime = new Date();
        return new Promise((resolve, reject) => {
            const uploadedFileName = data.uploadedFiles && data.uploadedFiles.length > 0
                ? data.uploadedFiles.join(', ') // Join file names if multiple files are uploaded
                : ""; // Handle case where no files are uploaded

            pool.query(
                `INSERT INTO segment_closure_documents 
            (segment_closure_segment_id, closure_document_name, closure_file, closure_file_status, closure_file_uploaded_by)
            VALUES (?,?,?,?,?)`,
                [data.segment_id, data.title, uploadedFileName, "Active", data.user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //upload segment documents
    uploadSegmentDocuments: (data) => {
        const dateTime = new Date();
        return new Promise((resolve, reject) => {
            const uploadedFileName = data.uploadedFiles && data.uploadedFiles.length > 0
                ? data.uploadedFiles.join(', ') // Join file names if multiple files are uploaded
                : ""; // Handle case where no files are uploaded

            pool.query(
                `INSERT INTO segment_documents 
            (segment_id, segment_document_title, segment_document_file, segment_documents_status, segment_document_user_id)
            VALUES (?,?,?,?,?)`,
                [data.segment_id, data.title, uploadedFileName, "Active", data.user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get segment file
    getSegmentDocuments: (segment_id)=>{
        return new Promise((resolve,reject) => {
            pool.query(
                `SELECT 
    COALESCE(sd.segment_document_title, pd.document_name) AS file_title,
    COALESCE(sd.segment_document_file, pd.document_file) AS file_name
    FROM 
    project_document pd
   INNER JOIN 
    project_segment ps ON pd.project_id = ps.project_id
    LEFT JOIN 
    segment_documents sd ON sd.segment_id = ps.segment_id 
    WHERE ps.segment_id = ?`,[segment_id],
                (error, results, fields) =>{
                    if(error){
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    //get segment map location
    getSegmentMap: (segment_id, select_status = 'All', start_date = null, end_date = null) => {
        return new Promise((resolve, reject) => {
            // Base query
            const query = `
                SELECT SUBSTRING_INDEX(pjc.coordinates, ',', 1) AS lat,SUBSTRING_INDEX(pjc.coordinates, ',', -1) AS lon,pjc.image,pjc.title,
                pjc.job_type,ps.service_name,pseg.segment_name,u.user_firstname, u.user_lastname,
                pjc.date_created AS activity_date,pjc.comment AS user_comment FROM project_job_card pjc
                INNER JOIN 
                    segment_implemetation_service sis ON sis.implementation_service_id = pjc.service_id
                INNER JOIN 
                    project_service ps ON ps.project_service_id = sis.service_type
                INNER JOIN 
                    project_segment pseg ON pseg.segment_id = pjc.segment_id
                INNER JOIN 
                    Users u ON pjc.user_id = u.user_id
                WHERE 
                    pseg.segment_id = ?
                    AND (? = 'All' OR DATE(pjc.date_created) BETWEEN ? AND ?)`;

            // Parameters array
            const params = [segment_id, select_status, start_date, end_date];

            // Execute the query
            pool.query(query, params, (error, results, fields) => {
                if (error) {
                    return reject(error);
                }
                return resolve(results);
            });
        });
    },
//end


};
