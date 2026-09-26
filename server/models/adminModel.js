const { pool } = require('../config/database');

class AdminModel {
  /**
   * Ensure admins table and role/status columns exist
   */
  static async ensureTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(100) DEFAULT 'Admin',
          plain_password VARCHAR(255) DEFAULT 'admin123',
          role VARCHAR(50) DEFAULT 'admin',
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const [cols] = await pool.query(`SHOW COLUMNS FROM admins`);
      const colNames = cols.map(c => c.Field);

      if (!colNames.includes('role')) {
        await pool.query(`ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'admin' AFTER plain_password`);
      }
      if (!colNames.includes('status')) {
        await pool.query(`ALTER TABLE admins ADD COLUMN status VARCHAR(20) DEFAULT 'active' AFTER role`);
      }
    } catch (err) {
      console.error('Error ensuring admins table schema:', err);
    }
  }

  /**
   * Find admin/user by username
   */
  static async findByUsername(username) {
    await this.ensureTable();
    const [rows] = await pool.query(`
      SELECT id, username, password_hash, name, plain_password, role, status, created_at 
      FROM admins 
      WHERE username = ?
    `, [username]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find admin/user by ID
   */
  static async findById(id) {
    await this.ensureTable();
    const [rows] = await pool.query(`
      SELECT id, username, name, role, status, plain_password, created_at 
      FROM admins 
      WHERE id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get all users / team members
   */
  static async getAllUsers() {
    await this.ensureTable();
    const [rows] = await pool.query(`
      SELECT id, username, name, role, status, plain_password, created_at 
      FROM admins 
      ORDER BY id ASC
    `);
    return rows;
  }

  /**
   * Create a new user (admin, article writer, or mobile manager)
   */
  static async createUser({ name, username, password_hash, plain_password, role = 'writer', status = 'active' }) {
    await this.ensureTable();
    const [result] = await pool.query(`
      INSERT INTO admins (name, username, password_hash, plain_password, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, username, password_hash, plain_password, role, status]);
    return result.insertId;
  }

  /**
   * Update user details
   */
  static async updateUser(id, { name, username, password_hash, plain_password, role, status }) {
    await this.ensureTable();
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (username !== undefined) {
      fields.push('username = ?');
      values.push(username);
    }
    if (password_hash !== undefined) {
      fields.push('password_hash = ?');
      values.push(password_hash);
    }
    if (plain_password !== undefined) {
      fields.push('plain_password = ?');
      values.push(plain_password);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }

    if (fields.length === 0) return true;

    values.push(id);
    await pool.query(`
      UPDATE admins SET ${fields.join(', ')} WHERE id = ?
    `, values);
    return true;
  }

  /**
   * Delete user (cannot delete master admin ID 1)
   */
  static async deleteUser(id) {
    if (Number(id) === 1) {
      throw new Error('Master Administrator account (ID: 1) cannot be deleted.');
    }
    await this.ensureTable();
    await pool.query(`DELETE FROM admins WHERE id = ?`, [id]);
    return true;
  }

  /**
   * Update admin profile & password
   */
  static async updateProfile(id, { name, username, password_hash, plain_password }) {
    return this.updateUser(id, { name, username, password_hash, plain_password });
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    const [[phonesCount]] = await pool.query(`SELECT COUNT(*) as total FROM phones`);
    const [[brandsCount]] = await pool.query(`SELECT COUNT(*) as total FROM brands`);
    const [[viewsCount]] = await pool.query(`SELECT COALESCE(SUM(views), 0) as total FROM phones`);
    const [[newsCount]] = await pool.query(`SELECT COUNT(*) as total FROM news`);
    const [[usersCount]] = await pool.query(`SELECT COUNT(*) as total FROM admins`);

    const [recentPhones] = await pool.query(`
      SELECT 
        p.id, p.name, p.slug, p.image, p.price, p.status, p.created_at, 
        COALESCE(b.name, 'Unassigned') as brand_name,
        COALESCE(b.slug, '') as brand_slug
      FROM phones p
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.id DESC
      LIMIT 8
    `);

    const [topBrands] = await pool.query(`
      SELECT 
        b.id, b.name, b.slug, b.logo, b.status, 
        COUNT(p.id) as phone_count
      FROM brands b
      LEFT JOIN phones p ON b.id = p.brand_id
      GROUP BY b.id
      ORDER BY phone_count DESC, b.name ASC
      LIMIT 8
    `);

    return {
      totalPhones: phonesCount ? phonesCount.total : 0,
      totalBrands: brandsCount ? brandsCount.total : 0,
      totalViews: viewsCount ? viewsCount.total : 0,
      totalNews: newsCount ? newsCount.total : 0,
      totalUsers: usersCount ? usersCount.total : 0,
      recentPhones: recentPhones || [],
      topBrands: topBrands || []
    };
  }
}

module.exports = AdminModel;
