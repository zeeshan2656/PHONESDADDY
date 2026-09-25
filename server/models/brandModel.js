const { pool } = require('../config/database');

class BrandModel {
  /**
   * Get all brands with phone count
   */
  static async getAllBrands(activeOnly = false) {
    const where = activeOnly ? "WHERE b.status = 'active'" : '';
    const [rows] = await pool.query(`
      SELECT 
        b.id, b.name, b.slug, b.logo, b.description, b.status, b.created_at,
        COUNT(p.id) AS phone_count
      FROM brands b
      LEFT JOIN phones p ON b.id = p.brand_id
      ${where}
      GROUP BY b.id
      ORDER BY b.name ASC
    `);
    return rows;
  }

  /**
   * Get single brand by slug with its phones
   */
  static async getBrandBySlug(slug) {
    const [brandRows] = await pool.query(`
      SELECT id, name, slug, logo, description, status, created_at
      FROM brands
      WHERE slug = ?
    `, [slug]);

    if (brandRows.length === 0) return null;
    const brand = brandRows[0];

    const [phoneRows] = await pool.query(`
      SELECT 
        p.id, p.name, p.slug, p.short_description, p.image, p.release_date,
        p.status, p.price, p.featured, p.popular, p.views
      FROM phones p
      WHERE p.brand_id = ?
      ORDER BY p.id DESC
    `, [brand.id]);

    brand.phones = phoneRows;
    return brand;
  }

  /**
   * Get brand by ID
   */
  static async getBrandById(id) {
    const [rows] = await pool.query(`
      SELECT id, name, slug, logo, description, status
      FROM brands
      WHERE id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create brand
   */
  static async createBrand({ name, slug, logo = '', description = '', status = 'active' }) {
    const [res] = await pool.query(`
      INSERT INTO brands (name, slug, logo, description, status)
      VALUES (?, ?, ?, ?, ?)
    `, [name, slug, logo, description, status]);
    return res.insertId;
  }

  /**
   * Update brand
   */
  static async updateBrand(id, { name, slug, logo, description, status }) {
    let fields = ['name = ?', 'slug = ?', 'description = ?', 'status = ?'];
    let values = [name, slug, description, status];

    if (logo) {
      fields.push('logo = ?');
      values.push(logo);
    }

    values.push(id);

    const [res] = await pool.query(`
      UPDATE brands
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);
    return res.affectedRows > 0;
  }

  /**
   * Delete brand
   */
  static async deleteBrand(id) {
    const [res] = await pool.query(`DELETE FROM brands WHERE id = ?`, [id]);
    return res.affectedRows > 0;
  }
}

module.exports = BrandModel;
