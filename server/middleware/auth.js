// Admin Authentication Middleware
function requireAdminAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  
  // If requesting API endpoint, return 401 JSON
  const isApi = (req.originalUrl && req.originalUrl.startsWith('/api/')) || 
                (req.baseUrl && req.baseUrl.startsWith('/api/')) ||
                (req.path && req.path.startsWith('/api/')) ||
                req.xhr || 
                (req.headers.accept && req.headers.accept.includes('application/json'));

  if (isApi) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in as admin.' });
  }

  // Otherwise redirect to admin login page
  return res.redirect('/admin/login');
}

module.exports = {
  requireAdminAuth
};
