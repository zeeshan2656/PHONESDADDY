const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { requireArticlePermission } = require('../middleware/auth');

// Public endpoint
router.get('/', CategoryController.list);

// Admin endpoints (Protected for Article Writers & Admins)
router.post('/admin', requireArticlePermission, CategoryController.create);
router.put('/admin/:id', requireArticlePermission, CategoryController.update);
router.delete('/admin/:id', requireArticlePermission, CategoryController.delete);

module.exports = router;
