const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/brandController');
const { requirePhonePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', BrandController.list);
router.get('/slug/:slug', BrandController.getBySlug);
router.get('/:id', BrandController.getById);

// Protected admin & mobile manager routes
router.post('/', requirePhonePermission, upload.single('logo'), BrandController.create);
router.put('/:id', requirePhonePermission, upload.single('logo'), BrandController.update);
router.delete('/:id', requirePhonePermission, BrandController.deleteBrand);

module.exports = router;
