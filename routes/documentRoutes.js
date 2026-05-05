const express = require('express');
const router = express.Router();
const { generateDocument, getDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:caseId/generate', protect, generateDocument);
router.get('/:caseId', getDocument);

module.exports = router;