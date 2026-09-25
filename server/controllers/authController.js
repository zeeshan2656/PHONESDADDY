const bcrypt = require('bcryptjs');
const AdminModel = require('../models/adminModel');

class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
      }

      const admin = await AdminModel.findByUsername(username.trim());
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      const match = await bcrypt.compare(password, admin.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      // Establish session
      req.session.admin = {
        id: admin.id,
        username: admin.username,
        name: admin.name
      };

      return res.json({
        success: true,
        message: 'Login successful',
        user: { id: admin.id, username: admin.username, name: admin.name }
      });
    } catch (err) {
      next(err);
    }
  }

  static async checkAuth(req, res) {
    if (req.session && req.session.admin) {
      return res.json({ success: true, authenticated: true, user: req.session.admin });
    }
    return res.json({ success: true, authenticated: false });
  }

  static async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Logged out successfully' });
    });
  }

  static async dashboardStats(req, res, next) {
    try {
      const stats = await AdminModel.getDashboardStats();
      return res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const adminId = req.session && req.session.admin ? req.session.admin.id : 1;
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin account not found' });
      }
      return res.json({
        success: true,
        data: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          current_password: admin.plain_password || 'admin123',
          created_at: admin.created_at
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const adminId = req.session && req.session.admin ? req.session.admin.id : 1;
      const { username, name, new_password } = req.body;

      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin account not found' });
      }

      const updateData = {};
      if (name && name.trim()) updateData.name = name.trim();
      if (username && username.trim()) updateData.username = username.trim();

      if (new_password && new_password.trim()) {
        if (new_password.trim().length < 4) {
          return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
        }
        const hash = await bcrypt.hash(new_password.trim(), 10);
        updateData.password_hash = hash;
        updateData.plain_password = new_password.trim();
      }

      await AdminModel.updateProfile(adminId, updateData);

      // Update session if available
      if (req.session && req.session.admin) {
        if (updateData.username) req.session.admin.username = updateData.username;
        if (updateData.name) req.session.admin.name = updateData.name;
      }

      const updatedAdmin = await AdminModel.findById(adminId);

      return res.json({
        success: true,
        message: 'Admin profile and password updated successfully',
        data: {
          id: updatedAdmin.id,
          username: updatedAdmin.username,
          name: updatedAdmin.name,
          current_password: updatedAdmin.plain_password || 'admin123'
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
