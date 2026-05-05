const express = require('express');
const router = express.Router();
const { getNGOs } = require('../controllers/ngoController');

router.get('/', getNGOs);

module.exports = router;