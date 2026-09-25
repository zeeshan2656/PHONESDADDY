const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const { requireAdminAuth } = require('../middleware/auth');

// Rate limiter for admin login (max 20 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, AuthController.login);
router.get('/check', AuthController.checkAuth);
router.post('/logout', AuthController.logout);
router.get('/stats', requireAdminAuth, AuthController.dashboardStats);
router.get('/profile', requireAdminAuth, AuthController.getProfile);
router.put('/profile', requireAdminAuth, AuthController.updateProfile);

module.exports = router;
