const { pool } = require('../config/database');

class PageModel {
  /**
   * Get paginated pages with optional status/search filters
   */
  static async getPages({ page = 1, limit = 20, status = 'all', search = '' } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search && search.trim() !== '') {
      conditions.push('(title LIKE ? OR slug LIKE ? OR content LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM pages ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const query = `
      SELECT id, title, slug, meta_title, meta_description, status, show_in_footer, views, created_at, updated_at
      FROM pages
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...params, parsedLimit, offset]);

    return {
      pages: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  /**
   * Get all published pages marked for footer display
   */
  static async getFooterPages() {
    const [rows] = await pool.query(`
      SELECT id, title, slug
      FROM pages
      WHERE status = 'published' AND show_in_footer = 1
      ORDER BY id ASC
    `);
    return rows;
  }

  /**
   * Get single page by slug
   */
  static async getBySlug(slug) {
    const [rows] = await pool.query(`
      SELECT *
      FROM pages
      WHERE slug = ?
    `, [slug]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get single page by ID
   */
  static async getById(id) {
    const [rows] = await pool.query(`
      SELECT *
      FROM pages
      WHERE id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Increment page view count
   */
  static async incrementViews(id) {
    await pool.query('UPDATE pages SET views = views + 1 WHERE id = ?', [id]);
  }

  /**
   * Create a new page
   */
  static async createPage({ title, slug, content, meta_title, meta_description, status, show_in_footer }) {
    const [result] = await pool.query(`
      INSERT INTO pages (title, slug, content, meta_title, meta_description, status, show_in_footer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      slug,
      content || '',
      meta_title || null,
      meta_description || null,
      status || 'published',
      show_in_footer ? 1 : 0
    ]);
    return result.insertId;
  }

  /**
   * Update an existing page
   */
  static async updatePage(id, { title, slug, content, meta_title, meta_description, status, show_in_footer }) {
    await pool.query(`
      UPDATE pages
      SET title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, status = ?, show_in_footer = ?
      WHERE id = ?
    `, [
      title,
      slug,
      content !== undefined ? content : '',
      meta_title || null,
      meta_description || null,
      status || 'published',
      show_in_footer ? 1 : 0,
      id
    ]);
    return true;
  }

  /**
   * Delete a page
   */
  static async deletePage(id) {
    const [result] = await pool.query('DELETE FROM pages WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = PageModel;
