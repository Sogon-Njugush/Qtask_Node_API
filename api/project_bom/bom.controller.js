const {createBom,getBom, getBoms,updateBom,deleteBom,approveMaterialChangeRequest} = require('./bom.service');
require('dotenv').config();
const AppError  = require("../../util/appError");
const axios = require('axios');
// const {sign} = require('jsonwebtoken');

module.exports = {
    //create project_bom
    createBom: async (req, res, next) =>{
        try{
            const body = req.body;
            const result = await createBom(body);
            if(!result.length){
                throw new AppError("Error not found!",403);
            }
            return res.json({
                success:true,
                massage: "Segment Bom created Successfully!",
                data:result
            });
        }catch (e) {
            next(e);
        }
    },

    //get project_bom
    getBom: async (req, res, next)=>{
        try{
            const body  = req.query.bom_id;
            const result = await getBom(body);
            // if(!result.length){
            //     throw new AppError("Error Item not found!",403);
            // }
            return res.json({
                success:true,
                data:result,
            });
        }catch (e) {
            next(e);
        }
    },

    //
    // get boms
    getBoms: async (req, res, next)=>{
        try{
            const body = req.query.segment_id;
            const result = await getBoms(body);
            // if(!result.length){
            //     throw new AppError("Error Bom not found!",403);
            // }
            return res.json({
                success: true,
                data: result,
            });
        }catch (e) {
            next(e);
        }
    },

    //update project_bom
    updateBom: async (req, res)=>{
        try{
            const body = req.body;
            const result = await updateBom(body);
            return res.json({
                success:true,
                data: "BOM details updated successfully",
            });
        }catch (e) {
            next(e);
        }
    },

    //delete project_bom
    deleteBom: async (req, res)=>{
        try{
            const data = req.query.bom_id;
            const result = await  deleteBom(data);
            return res.json({
                success:true,
                data: "BOM Details deleted successfully",
            });
        }catch (e) {
            next(e)
        }
    },
//approved material change request
    approveMaterialChangeRequest: async (req, res, next) => {
        try {
            const { user_id, material_change_request_id, date } = req.body;
            const result = await approveMaterialChangeRequest(user_id, material_change_request_id, date);

            return res.json({
                success: true,
                message: 'Material change request approved successfully',
                data: result
            });
        } catch (e) {
            next(e);
        }
    },
    //get warehouse material details
    getMaterialByItemCode: async (req, res, next) => {
        try {
            const { itemCode, token, baseUrl } = req.query;

            // Validate parameters
            if (typeof itemCode !== 'string' || itemCode.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'itemCode must be a non-empty string',
                });
            }
            if (typeof token !== 'string' || token.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'token must be a non-empty string',
                });
            }
            if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'baseUrl must be a non-empty string',
                });
            }

            // Construct ERP API URL
            const erpUrl = `${baseUrl}Item?fields=["name","item_code","item_name","stock_uom","standard_rate","valuation_rate"]&filters=[["Item","item_code","=","${encodeURIComponent(itemCode)}"]]`;

            // Make Request to ERP System
            const erpResponse = await axios.get(erpUrl, {
                headers: {
                    'Authorization': `token ${token}`,
                },
            });

            // Check if data is retrieved successfully from ERP API
            if (erpResponse.data && Array.isArray(erpResponse.data.data) && erpResponse.data.data.length > 0) {
                return res.status(200).json({
                    success: true,
                    data: erpResponse.data.data
                });
            } else {
                // If no data is found in ERP API
                return res.status(404).json({
                    success: false,
                    message: 'Item not found',
                });
            }
        } catch (error) {
            console.error('Error:', error.message);

            // Handle specific error cases
            if (error.response) {
                return res.status(error.response.status).json({
                    success: false,
                    message: 'ERP API request failed',
                    error: error.response.data,
                });
            } else if (error.request) {
                return res.status(500).json({
                    success: false,
                    message: 'No response received from ERP API',
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'An unexpected error occurred',
                });
            }
        }
    },
    //get all materials from warehouse
    getAllMaterials: async (req, res, next) => {
        try {
            const { token, baseUrl } = req.query;

            // Validate parameters
            // if (typeof itemCode !== 'string' || itemCode.trim() === '') {
            //     return res.status(400).json({
            //         success: false,
            //         message: 'itemCode must be a non-empty string',
            //     });
            // }
            if (typeof token !== 'string' || token.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'token must be a non-empty string',
                });
            }
            if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'baseUrl must be a non-empty string',
                });
            }

            // Construct ERP API URL
            const erpUrl = `${baseUrl}Item?fields=["name","item_code","item_name","item_group","stock_uom","standard_rate","valuation_rate","is_sub_contracted_item","total_projected_qty","has_expiry_date","sample_quantity","serial_no_series","min_order_qty","total_projected_qty","sample_quantity","disabled"]&limit=2000000`;

            // Make Request to ERP System
            const erpResponse = await axios.get(erpUrl, {
                headers: {
                    'Authorization': `token ${token}`,
                },
            });

            // Check if data is retrieved successfully from ERP API
            if (erpResponse.data && Array.isArray(erpResponse.data.data) && erpResponse.data.data.length > 0) {
                return res.status(200).json({
                    success: true,
                    data: erpResponse.data.data
                });
            } else {
                // If no data is found in ERP API
                return res.status(404).json({
                    success: false,
                    message: 'Item not found',
                });
            }
        } catch (error) {
            console.error('Error:', error.message);

            // Handle specific error cases
            if (error.response) {
                return res.status(error.response.status).json({
                    success: false,
                    message: 'ERP API request failed',
                    error: error.response.data,
                });
            } else if (error.request) {
                return res.status(500).json({
                    success: false,
                    message: 'No response received from ERP API',
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'An unexpected error occurred',
                });
            }
        }
    },
    createWarehouse: async (req, res, next) => {
        try {
            const { token, baseUrl, warehouse_name, email_id, phone_no, city } = req.body;

            // Validate parameters
            if (typeof token !== 'string' || token.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'token must be a non-empty string',
                });
            }
            if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'baseUrl must be a non-empty string',
                });
            }
            if (!warehouse_name || !email_id || !phone_no) {
                return res.status(400).json({
                    success: false,
                    message: 'warehouse_name, email_id, and phone_no are required fields',
                });
            }

            // Construct ERP API URL
            const erpUrl = `${baseUrl}Warehouse`;

            // Prepare data for the POST request
            const postData = {
                warehouse_name,
                email_id,
                phone_no,
                city: city || "", // Optional field
            };

            // Make POST request to ERP System
            const erpResponse = await axios.post(erpUrl, postData, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Check if the warehouse was created successfully
            if (erpResponse.data && erpResponse.data.data) {
                return res.status(201).json({
                    success: true,
                    data: erpResponse.data.data,
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create warehouse',
                });
            }
        } catch (error) {
            console.error('Error:', error.message);

            // Handle specific error cases
            if (error.response) {
                return res.status(error.response.status).json({
                    success: false,
                    message: 'ERP API request failed',
                    error: error.response.data,
                });
            } else if (error.request) {
                return res.status(500).json({
                    success: false,
                    message: 'No response received from ERP API',
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'An unexpected error occurred',
                });
            }
        }
    },
// end
}
