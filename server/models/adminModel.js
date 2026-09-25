const { pool } = require('../config/database');

class AdminModel {
  /**
   * Find admin by username
   */
  static async findByUsername(username) {
    const [rows] = await pool.query(`
      SELECT * FROM admins WHERE username = ?
    `, [username]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find admin by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT id, username, name, plain_password, created_at FROM admins WHERE id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Update admin profile & password
   */
  static async updateProfile(id, { name, username, password_hash, plain_password }) {
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

    if (fields.length === 0) return true;

    values.push(id);
    await pool.query(`
      UPDATE admins SET ${fields.join(', ')} WHERE id = ?
    `, values);
    return true;
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    const [[phonesCount]] = await pool.query(`SELECT COUNT(*) as total FROM phones`);
    const [[brandsCount]] = await pool.query(`SELECT COUNT(*) as total FROM brands`);
    const [[viewsCount]] = await pool.query(`SELECT COALESCE(SUM(views), 0) as total FROM phones`);
    const [[newsCount]] = await pool.query(`SELECT COUNT(*) as total FROM news`);

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
      recentPhones: recentPhones || [],
      topBrands: topBrands || []
    };
  }
}

module.exports = AdminModel;

