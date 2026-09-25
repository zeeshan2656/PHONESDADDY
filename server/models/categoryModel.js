const { pool } = require('../config/database');

class CategoryModel {
  /**
   * Get all news categories with article counts
   */
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        nc.id, 
        nc.name, 
        nc.slug, 
        nc.description, 
        nc.created_at,
        COUNT(n.id) AS article_count
      FROM news_categories nc
      LEFT JOIN news n ON n.category = nc.name
      GROUP BY nc.id, nc.name, nc.slug, nc.description, nc.created_at
      ORDER BY nc.name ASC
    `);
    return rows;
  }

  /**
   * Get single category by ID
   */
  static async getById(id) {
    const [rows] = await pool.query(`
      SELECT * FROM news_categories WHERE id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get single category by slug
   */
  static async getBySlug(slug) {
    const [rows] = await pool.query(`
      SELECT * FROM news_categories WHERE slug = ?
    `, [slug]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get single category by name
   */
  static async getByName(name) {
    const [rows] = await pool.query(`
      SELECT * FROM news_categories WHERE name = ?
    `, [name]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create category
   */
  static async create({ name, slug, description }) {
    const [result] = await pool.query(`
      INSERT INTO news_categories (name, slug, description)
      VALUES (?, ?, ?)
    `, [name, slug, description || null]);
    return result.insertId;
  }

  /**
   * Update category
   */
  static async update(id, { name, slug, description }) {
    // If name changed, also update articles that had the old category name
    const existing = await this.getById(id);
    if (existing && existing.name !== name) {
      await pool.query('UPDATE news SET category = ? WHERE category = ?', [name, existing.name]);
    }

    await pool.query(`
      UPDATE news_categories
      SET name = ?, slug = ?, description = ?
      WHERE id = ?
    `, [name, slug, description || null, id]);

    return true;
  }

  /**
   * Delete category
   */
  static async delete(id) {
    const existing = await this.getById(id);
    if (existing) {
      // Reassign articles with this category to 'Hot News' or 'General'
      await pool.query(`
        UPDATE news 
        SET category = 'Hot News' 
        WHERE category = ?
      `, [existing.name]);
    }

    const [result] = await pool.query('DELETE FROM news_categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CategoryModel;
