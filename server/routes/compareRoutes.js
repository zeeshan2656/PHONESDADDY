const express = require('express');
const router = express.Router();
const CompareController = require('../controllers/compareController');

router.get('/', CompareController.compare);

module.exports = router;
