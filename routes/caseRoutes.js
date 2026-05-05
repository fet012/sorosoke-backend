const express = require('express');
const router = express.Router();
const { createCase, getAllCases, getCaseById, getMyCases } = require('../controllers/caseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCase);
router.get('/', getAllCases);
router.get('/me', protect, getMyCases);
router.get('/:id', getCaseById);

module.exports = router;