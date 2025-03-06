const { createBudgetItem, getBudgetItem, getBudgetItems, updateBudgetItem, deleteBudgetItem,createSegmentBudget,
    deleteSegmentBudget,updateSegmentBudget,getSegmentBudgetById,getSegmentBudgets,getSegmentExpenditure,updateSegmentActualBudget } = require('./budgetItem.service');
require('dotenv').config();
const AppError = require("../../util/appError");

module.exports = {
    // Create Budget Item
    createBudgetItem: async (req, res, next) => {
        try {
            const body = req.body;

            // Insert budget item data into the database
            const result = await createBudgetItem(body);

            return res.json({
                success: true,
                message: "Budget item created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },

    // Get Budget Item by ID
    getBudgetItem: async (req, res, next) => {
        try {
            const budget_item_id = req.query.budget_item_id;
            const result = await getBudgetItem(budget_item_id);

            // if (!result) {
            //     throw new AppError("Budget item not found!", 404);
            // }

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },

    // Get All Budget Items for a Company
    getBudgetItems: async (req, res, next) => {
        try {
            const company_id = req.query.company_id;
            const result = await getBudgetItems(company_id);

            // if (!result.length) {
            //     throw new AppError("No budget items found for this company!", 404);
            // }

            return res.json({
                success: true,
                data: result,
            });
        } catch (e) {
            next(e);
        }
    },

    // Update Budget Item
    updateBudgetItem: async (req, res, next) => {
        try {
            const body = req.body;
            await updateBudgetItem(body);

            return res.json({
                success: true,
                message: "Budget item updated successfully!",
            });
        } catch (e) {
            next(e);
        }
    },

    // Soft Delete Budget Item (Update status to "Deleted")
    deleteBudgetItem: async (req, res, next) => {
        try {
            const budget_item_id = req.query.budget_item_id;
            await deleteBudgetItem(budget_item_id);

            return res.json({
                success: true,
                message: "Budget item marked as deleted successfully!",
            });
        } catch (e) {
            next(e);
        }
    },
    //Set segment Budget
    // Create a new segment budget
    createSegmentBudget: async (req, res, next) => {
        try {
            const body = req.body; // Assume body is an array of segment budget objects
            const result = await createSegmentBudget(body);

            return res.status(201).json({
                success: true,
                message: "Segment budgets created successfully!",
                data: result
            });
        } catch (e) {
            next(e);
        }
    },
    // Get all segment budgets
    getSegmentBudgets: async (req, res, next) => {
        try {
            const segment_id = req.query.segment_id;
            const results = await getSegmentBudgets(segment_id);

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (e) {
            next(e);
        }
    },
    // Get a segment budget by ID
    getSegmentBudgetById: async (req, res, next) => {
        try {
            const segment_budget_id = req.query.segment_budget_id;
            const result = await getSegmentBudgetById(segment_budget_id);

            // if (!result) {
            //     throw new AppError("Segment budget not found!", 404);
            // }

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (e) {
            next(e);
        }
    },
    // Update a segment budget
    updateSegmentBudget: async (req, res, next) => {
        try {
            const body = req.body;
            await updateSegmentBudget(body);

            return res.status(200).json({
                success: true,
                message: "Segment budget updated successfully!"
            });
        } catch (e) {
            next(e);
        }
    },
    //update actual segment  budget
    updateSegmentActualBudget: async (req, res, next) => {
        try {
            const body = req.body;
            await updateSegmentActualBudget(body);

            return res.status(200).json({
                success: true,
                message: "Segment actual budget added successfully!"
            });
        } catch (e) {
            next(e);
        }
    },
    // Delete a segment budget
    deleteSegmentBudget: async (req, res, next) => {
        try {
            const segment_budget_id = req.query.segment_budget_id;
            await deleteSegmentBudget(segment_budget_id);

            return res.status(200).json({
                success: true,
                message: "Segment budget deleted successfully!"
            });
        } catch (e) {
            next(e);
        }
    },
    //budget dashboard
    //get budget expenditure
    getSegmentExpenditure: async (req, res, next) => {
        try {
            const segment_id = req.query.segment_id;
            const token = req.query.token; // Assuming token is passed in the request
            const baseUrl = req.query.baseUrl; // Assuming baseUrl is passed in the request

            const results = await getSegmentExpenditure(segment_id, token, baseUrl);

            return res.status(200).json({
                success: true,
                data: results
            });
        } catch (e) {
            next(e);
        }
    },

};
