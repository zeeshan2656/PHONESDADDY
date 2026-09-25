const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const { requireAdminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public Branding Endpoint (no auth needed)
router.get('/public', SettingsController.getPublicBranding);

// Admin Protected Routes
router.get('/', requireAdminAuth, SettingsController.getSettings);
router.put('/', requireAdminAuth, SettingsController.updateSettings);
router.post('/', requireAdminAuth, SettingsController.updateSettings);

// Brand Logo & Favicon Upload Endpoints
router.post('/logo', requireAdminAuth, upload.single('logo'), SettingsController.uploadLogo);
router.delete('/logo', requireAdminAuth, SettingsController.removeLogo);

router.post('/favicon', requireAdminAuth, upload.single('favicon'), SettingsController.uploadFavicon);
router.delete('/favicon', requireAdminAuth, SettingsController.removeFavicon);

module.exports = router;
