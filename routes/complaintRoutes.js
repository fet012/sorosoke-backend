const express = require('express');
const router = express.Router();
const { submitComplaint, getComplaints } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../services/cloudinaryService');

const handleUpload = (req, res, next) => {
  upload.array('evidenceFiles', 5)(req, res, (err) => {
    if (err) {
      console.log('❌ Upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post('/', protect, handleUpload, submitComplaint);
router.get('/:caseId', protect, getComplaints);

module.exports = router;