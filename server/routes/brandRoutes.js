const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brandController');
const { requireAdminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', BrandController.list);
router.get('/slug/:slug', BrandController.getBySlug);
router.get('/:id', BrandController.getById);

// Protected admin routes
router.post('/', requireAdminAuth, upload.single('logo'), BrandController.create);
router.put('/:id', requireAdminAuth, upload.single('logo'), BrandController.update);
router.delete('/:id', requireAdminAuth, BrandController.deleteBrand);

module.exports = router;
