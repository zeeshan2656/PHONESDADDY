const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { requireAdminAuth } = require('../middleware/auth');

// Public endpoint
router.get('/', CategoryController.list);

// Admin endpoints (Protected)
router.post('/admin', requireAdminAuth, CategoryController.create);
router.put('/admin/:id', requireAdminAuth, CategoryController.update);
router.delete('/admin/:id', requireAdminAuth, CategoryController.delete);

module.exports = router;
