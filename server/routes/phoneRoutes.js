const express = require('express');
const router = express.Router();
const PhoneController = require('../controllers/phoneController');
const { requirePhonePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', PhoneController.list);
router.get('/latest', PhoneController.getLatest);
router.get('/popular', PhoneController.getPopular);
router.get('/upcoming', PhoneController.getUpcoming);
router.get('/slug/:slug', PhoneController.getBySlug);
router.get('/:id', PhoneController.getById);

// Protected admin & mobile manager routes
router.post('/fetch-external-specs', requirePhonePermission, PhoneController.fetchExternalSpecs);
router.post('/', requirePhonePermission, upload.single('image'), PhoneController.create);
router.put('/:id', requirePhonePermission, upload.single('image'), PhoneController.update);
router.delete('/:id', requirePhonePermission, PhoneController.deletePhone);

module.exports = router;
