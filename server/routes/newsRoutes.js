const express = require('express');
const router = express.Router();
const multer = require('multer');
const NewsController = require('../controllers/newsController');
const { requireAdminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * Wrapper to handle multer errors gracefully and return JSON
 */
function handleUpload(fieldName) {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors (file too large, unexpected field, etc.)
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        // Other errors (invalid file type, etc.)
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  };
}

// Public endpoints
router.get('/', NewsController.list);
router.get('/hot', NewsController.getHot);
router.get('/categories', NewsController.getCategories);
router.get('/slug/:slug', NewsController.getBySlug);

// Admin endpoints (Protected)
// IMPORTANT: Specific string routes MUST come BEFORE parameterized :id routes
router.get('/admin/stats', requireAdminAuth, NewsController.getStats);
router.get('/admin/list', requireAdminAuth, NewsController.adminList);
router.post('/admin/upload-inline-image', requireAdminAuth, handleUpload('image'), NewsController.uploadInlineImage);
router.post('/admin', requireAdminAuth, handleUpload('image'), NewsController.create);
router.get('/admin/:id', requireAdminAuth, NewsController.adminGetById);
router.put('/admin/:id', requireAdminAuth, handleUpload('image'), NewsController.update);
router.delete('/admin/:id', requireAdminAuth, NewsController.delete);

module.exports = router;
