const { createProjectClosureParameter, getProjectClosureParameter, getProjectClosureParameters, updateProjectClosureParameter,
    deleteProjectClosureParameter,createSegmentAcceptance,deleteSegmentAcceptance,getAllSegmentAcceptances,
    getSegmentAcceptanceById,updateSegmentAcceptance,createSegmentClosureCheck,deleteSegmentClosureCheck,getAllSegmentClosureChecks,
    getSegmentClosureCheckById, updateSegmentClosureCheck,getAllSegmentClosureWithPassChecks,approveSegmentAcceptance,declineSegmentAcceptance } = require('./segment_closure.service');
require('dotenv').config();
const AppError = require("../../util/appError");

module.exports = {
    // Create Project Closure Parameter
    createProjectClosureParameter: async (req, res, next) => {
        try {
            const body = req.body;

            // Insert project closure parameter data into the database
            const result = await createProjectClosureParameter(body);

            return res.json({
                success: true,
                message: "Project closure parameter created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    // Get Project Closure Parameter by ID
    getProjectClosureParameter: async (req, res, next) => {
        try {
            const project_closure_parameter_id = req.query.project_closure_parameter_id;
            const result = await getProjectClosureParameter(project_closure_parameter_id);

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },

    // Get Project Closure Parameters
    getProjectClosureParameters: async (req, res, next) => {
        try {
            const company_id = req.query.company_id;
            const result = await getProjectClosureParameters(company_id);

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },

    // Update Project Closure Parameter
    updateProjectClosureParameter: async (req, res, next) => {
        try {
            const body = req.body;
            await updateProjectClosureParameter(body);

            return res.json({
                success: true,
                message: "Project closure parameter updated successfully",
            });
        } catch (e) {
            next(e);
        }
    },

    // Delete Project Closure Parameter
    deleteProjectClosureParameter: async (req, res, next) => {
        try {
            const project_closure_parameter_id = req.query.project_closure_parameter_id;
            await deleteProjectClosureParameter(project_closure_parameter_id);

            return res.json({
                success: true,
                message: "Project closure parameter deleted successfully",
            });
        } catch (e) {
            next(e);
        }
    },
    // Create Segment Acceptance
    createSegmentAcceptance: async (req, res, next) => {
        try {
            const body = req.body;

            // Check if the request body is empty
            if (!body || Object.keys(body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Request body cannot be empty!"
                });
            }

            // Check if required fields are missing
            const requiredFields = [
                'acceptance_segment_id',
                'acceptance_score',
                'acceptance_description',
                'acceptance_date',
                'acceptance_user_id'
            ];

            const missingFields = requiredFields.filter(field => !body[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
            }

            // Insert segment acceptance data into the database
            const result = await createSegmentAcceptance(body);

            return res.json({
                success: true,
                message: "Segment acceptance created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    // Get Segment Acceptance by ID
    getSegmentAcceptanceById: async (req, res, next) => {
        try {
            const segment_acceptance_id = req.query.segment_acceptance_id;
            const result = await getSegmentAcceptanceById(segment_acceptance_id);

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },

    // Get All Segment Acceptances
    getAllSegmentAcceptances: async (req, res, next) => {
        try {
            const segment_id = req.query.segment_id;
            const result = await getAllSegmentAcceptances(segment_id);

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },

    // Update Segment Acceptance
    updateSegmentAcceptance: async (req, res, next) => {
        try {
            const body = req.body;
            await updateSegmentAcceptance(body);

            return res.json({
                success: true,
                message: "Segment acceptance updated successfully",
            });
        } catch (e) {
            next(e);
        }
    },

    // Soft Delete Segment Acceptance
    deleteSegmentAcceptance: async (req, res, next) => {
        try {
            const segment_acceptance_id = req.query.segment_acceptance_id;
            await deleteSegmentAcceptance(segment_acceptance_id);

            return res.json({
                success: true,
                message: "Segment acceptance marked as deleted successfully",
            });
        } catch (e) {
            next(e);
        }
    },
    // Create Segment Closure Check
    createSegmentClosureCheck: async (req, res, next) => {
        try {
            const body = req.body;

            // Check if the request body is empty
            if (!body || !Array.isArray(body) || body.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Request body must be a non-empty array!"
                });
            }

            // Check if required fields are missing in any of the objects
            const requiredFields = [
                'project_closure_parameter_id',
                'segment_id',
                'create_date',
                'user_id'
            ];

            const missingFields = body
                .map((data, index) => {
                    const missing = requiredFields.filter(field => !data[field]);
                    return missing.length > 0 ? `Row ${index + 1}: ${missing.join(', ')}` : null;
                })
                .filter(missing => missing !== null);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join('; ')}`
                });
            }

            // Insert multiple segment closure check data into the database
            const result = await createSegmentClosureCheck(body);

            return res.json({
                success: true,
                message: "Segment closure checks created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    // Get Segment Closure Check by ID
    getSegmentClosureCheckById: async (req, res, next) => {
        try {
            const segment_closure_check_id = req.query.segment_closure_check_id;
            const result = await getSegmentClosureCheckById(segment_closure_check_id);

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },

    // Get All Segment Closure Checks
    getAllSegmentClosureChecks: async (req, res, next) => {
        try {
            const segment_id = req.query.segment_id;
            const result = await getAllSegmentClosureChecks(segment_id);

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },

    // Update Segment Closure Check
    updateSegmentClosureCheck: async (req, res, next) => {
        try {
            const body = req.body;
            await updateSegmentClosureCheck(body);

            return res.json({
                success: true,
                message: "Segment closure check updated successfully",
            });
        } catch (e) {
            next(e);
        }
    },

    // Soft Delete Segment Closure Check
    deleteSegmentClosureCheck: async (req, res, next) => {
        try {
            const segment_closure_check_id = req.query.segment_closure_check_id;
            await deleteSegmentClosureCheck(segment_closure_check_id);

            return res.json({
                success: true,
                message: "Segment closure check marked as deleted successfully",
            });
        } catch (e) {
            next(e);
        }
    },
    // Get All Segment Closure Checks
    getAllSegmentClosureWithPassChecks: async (req, res, next) => {
        try {
            const segment_id = req.query.segment_id;
            const result = await getAllSegmentClosureWithPassChecks(segment_id);

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },
    // segment closure approval
    approveSegmentAcceptance: async (req, res, next) => {
        try {
            const segment_acceptance_id = req.query.segment_acceptance_id;
            await approveSegmentAcceptance(segment_acceptance_id);

            return res.json({
                success: true,
                message: "Segment acceptance marked as approved successfully",
            });
        } catch (e) {
            next(e);
        }
    },
    // Decline Segment closure
    declineSegmentAcceptance: async (req, res, next) => {
        try {
            const segment_acceptance_id = req.query.segment_acceptance_id;
            await declineSegmentAcceptance(segment_acceptance_id);

            return res.json({
                success: true,
                message: "Segment acceptance marked as declined successfully",
            });
        } catch (e) {
            next(e);
        }
    },

};
