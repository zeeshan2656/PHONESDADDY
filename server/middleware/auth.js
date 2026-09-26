// Admin & Staff Authentication & Role-Based Access Middleware

function isApiRequest(req) {
  return (req.originalUrl && req.originalUrl.startsWith('/api/')) || 
         (req.baseUrl && req.baseUrl.startsWith('/api/')) ||
         (req.path && req.path.startsWith('/api/')) ||
         req.xhr || 
         (req.headers.accept && req.headers.accept.includes('application/json'));
}

// Any authenticated staff member (Admin, Article Writer, Phone Manager)
function requireAdminAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  
  if (isApiRequest(req)) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  return res.redirect('/admin/login');
}

// Master Admin only (Settings, Team & User Management)
function requireMasterAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    if (req.session.admin.role === 'admin') {
      return next();
    }
    if (isApiRequest(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Master Admin privilege required.' });
    }
    return res.redirect('/admin/dashboard?error=unauthorized');
  }

  if (isApiRequest(req)) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  return res.redirect('/admin/login');
}

// Phone & Mobile management permission
function requirePhonePermission(req, res, next) {
  if (req.session && req.session.admin) {
    const role = req.session.admin.role;
    if (role === 'admin' || role === 'phones' || role === 'contributor') {
      return next();
    }
    if (isApiRequest(req)) {
      return res.status(403).json({ success: false, message: 'Permission denied. Mobile phone manager access required.' });
    }
    return res.redirect('/admin/dashboard?error=unauthorized');
  }

  if (isApiRequest(req)) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  return res.redirect('/admin/login');
}

// Article & Blog management permission
function requireArticlePermission(req, res, next) {
  if (req.session && req.session.admin) {
    const role = req.session.admin.role;
    if (role === 'admin' || role === 'writer' || role === 'editor' || role === 'contributor') {
      return next();
    }
    if (isApiRequest(req)) {
      return res.status(403).json({ success: false, message: 'Permission denied. Article writer access required.' });
    }
    return res.redirect('/admin/dashboard?error=unauthorized');
  }

  if (isApiRequest(req)) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  return res.redirect('/admin/login');
}

module.exports = {
  requireAdminAuth,
  requireMasterAdmin,
  requirePhonePermission,
  requireArticlePermission
};
