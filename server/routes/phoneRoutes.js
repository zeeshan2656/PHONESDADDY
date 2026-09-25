const express = require('express');
const router = express.Router();
const PhoneController = require('../controllers/phoneController');
const { requireAdminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', PhoneController.list);
router.get('/latest', PhoneController.getLatest);
router.get('/popular', PhoneController.getPopular);
router.get('/upcoming', PhoneController.getUpcoming);
router.get('/slug/:slug', PhoneController.getBySlug);
router.get('/:id', PhoneController.getById);

// Protected admin routes
router.post('/fetch-external-specs', requireAdminAuth, PhoneController.fetchExternalSpecs);
router.post('/', requireAdminAuth, upload.single('image'), PhoneController.create);
router.put('/:id', requireAdminAuth, upload.single('image'), PhoneController.update);
router.delete('/:id', requireAdminAuth, PhoneController.deletePhone);

module.exports = router;
