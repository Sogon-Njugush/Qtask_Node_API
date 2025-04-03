const { createBudgetItem, deleteBudgetItem, getBudgetItems, getBudgetItem, updateBudgetItem,createSegmentBudget,
deleteSegmentBudget,getSegmentBudgetById,getSegmentBudgets,updateSegmentBudget,getSegmentExpenditure,
    updateSegmentActualBudget,getProjectExpenditure} = require('./budgetItem.controller');
const router = require('express').Router();

// Validate token
const { checkToken } = require("../../authentication/tokenValidation");

// Create Budget Item
router.post("/createBudget", checkToken, createBudgetItem);

// Get Budget Item by ID
router.get("/getBudgetItemById", checkToken, getBudgetItem);

// Get All Budget Items for a Company
router.get("/getBudgetItem", checkToken, getBudgetItems);

// Update Budget Item
router.patch("/updateBudget", checkToken, updateBudgetItem);

// Soft Delete Budget Item (Update status to "Deleted")
router.delete("/deleteBudget", checkToken, deleteBudgetItem);

//set segment budget
// Create a new segment budget
router.post('/createSegmentBudget', checkToken, createSegmentBudget);

// Get all segment budgets
router.get('/getSegmentBudgets', checkToken, getSegmentBudgets);

// Get a segment budget by ID
router.get('/getSegmentBudgetById', checkToken, getSegmentBudgetById);

// Update a segment budget
router.patch('/updateSegmentBudget', checkToken, updateSegmentBudget);

// Update a segment actual budget
router.patch('/updateSegmentActualBudget', checkToken, updateSegmentActualBudget);

// Delete a segment budget
router.delete('/deleteSegmentBudget', checkToken, deleteSegmentBudget);

//budget dashboard
//budget expenditure
router.delete('/segmentExpenditure', checkToken, getSegmentExpenditure);

//project expenditure
router.delete('/projectExpenditure', checkToken, getProjectExpenditure);

module.exports = router;
