const { pool } = require('../config/database');

class ReviewModel {
  /**
   * Create a new top-level review or comment (Auto-approved by default)
   */
  static async create({ entity_type, entity_id, user_name, user_email_phone, user_website = null, rating = null, message, ip_address = null }) {
    const [result] = await pool.query(`
      INSERT INTO reviews_comments 
        (entity_type, entity_id, parent_id, user_name, user_email_phone, user_website, rating, message, status, is_admin, ip_address)
      VALUES 
        (?, ?, NULL, ?, ?, ?, ?, ?, 'approved', 0, ?)
    `, [
      entity_type,
      entity_id,
      user_name.trim(),
      user_email_phone.trim(),
      user_website ? user_website.trim() : null,
      rating ? parseInt(rating, 10) : null,
      message.trim(),
      ip_address
    ]);

    return result.insertId;
  }

  /**
   * Create a reply to an existing review or comment (from user or admin)
   */
  static async createReply({ parent_id, user_name, user_email_phone, user_website = null, message, is_admin = false, ip_address = null }) {
    // Find parent to inherit entity_type and entity_id
    const parent = await ReviewModel.getById(parent_id);
    if (!parent) {
      throw new Error('Parent review or comment not found');
    }

    // If parent is already a reply, link to the top-level parent to avoid infinite nesting
    const effectiveParentId = parent.parent_id || parent.id;

    const [result] = await pool.query(`
      INSERT INTO reviews_comments 
        (entity_type, entity_id, parent_id, user_name, user_email_phone, user_website, rating, message, status, is_admin, ip_address)
      VALUES 
        (?, ?, ?, ?, ?, ?, NULL, ?, 'approved', ?, ?)
    `, [
      parent.entity_type,
      parent.entity_id,
      effectiveParentId,
      user_name.trim(),
      user_email_phone ? user_email_phone.trim() : 'support@phonesdaddy.com',
      user_website ? user_website.trim() : null,
      message.trim(),
      is_admin ? 1 : 0,
      ip_address
    ]);

    return result.insertId;
  }

  /**
   * Get approved reviews/comments for a specific entity with threaded replies
   */
  static async getByEntity(entity_type, entity_id) {
    const [rows] = await pool.query(`
      SELECT 
        id, entity_type, entity_id, parent_id, user_name, user_website, rating, message, status, is_admin, created_at
      FROM reviews_comments
      WHERE entity_type = ? AND entity_id = ? AND status = 'approved'
      ORDER BY created_at ASC
    `, [entity_type, entity_id]);

    // Group replies under parents
    const parentMap = new Map();
    const topLevelList = [];
    const pendingReplies = [];

    rows.forEach(item => {
      item.replies = [];
      if (!item.parent_id) {
        parentMap.set(item.id, item);
        topLevelList.push(item);
      } else {
        pendingReplies.push(item);
      }
    });

    pendingReplies.forEach(reply => {
      const parent = parentMap.get(reply.parent_id);
      if (parent) {
        parent.replies.push(reply);
      } else {
        // In case parent was removed, include as top level
        topLevelList.push(reply);
      }
    });

    // Return newest top-level items first, with chronological replies inside
    return topLevelList.reverse();
  }

  /**
   * Get comprehensive star rating statistics for a mobile phone (Only top-level reviews count)
   */
  static async getPhoneRatingStats(phone_id) {
    const [summaryRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_reviews,
        COALESCE(AVG(rating), 0) AS average_rating
      FROM reviews_comments
      WHERE entity_type = 'phone' AND entity_id = ? AND status = 'approved' AND parent_id IS NULL AND rating IS NOT NULL
    `, [phone_id]);

    const totalReviews = summaryRows[0]?.total_reviews || 0;
    const avgRating = totalReviews > 0 ? parseFloat(summaryRows[0].average_rating).toFixed(1) : '0.0';

    // Rating breakdown for 1 to 5 stars
    const [breakdownRows] = await pool.query(`
      SELECT 
        rating,
        COUNT(*) AS count
      FROM reviews_comments
      WHERE entity_type = 'phone' AND entity_id = ? AND status = 'approved' AND parent_id IS NULL AND rating IS NOT NULL
      GROUP BY rating
    `, [phone_id]);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const percentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    breakdownRows.forEach(row => {
      const r = parseInt(row.rating, 10);
      if (breakdown[r] !== undefined) {
        breakdown[r] = row.count;
      }
    });

    if (totalReviews > 0) {
      for (let star = 1; star <= 5; star++) {
        percentages[star] = Math.round((breakdown[star] / totalReviews) * 100);
      }
    }

    return {
      average_rating: avgRating,
      total_reviews: totalReviews,
      breakdown,
      percentages
    };
  }

  /**
   * Admin: Get all reviews & comments with advanced filters, pagination, reply counts, and entity titles
   */
  static async getAllAdmin({ type = 'all', status = 'all', rating = 'all', search = '', page = 1, limit = 20 } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (type && type !== 'all') {
      conditions.push('rc.entity_type = ?');
      params.push(type);
    }

    if (status && status !== 'all') {
      conditions.push('rc.status = ?');
      params.push(status);
    }

    if (rating && rating !== 'all') {
      conditions.push('rc.rating = ?');
      params.push(parseInt(rating, 10));
    }

    if (search && search.trim() !== '') {
      conditions.push('(rc.user_name LIKE ? OR rc.user_email_phone LIKE ? OR rc.message LIKE ? OR p.name LIKE ? OR n.title LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matches
    const [countRows] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM reviews_comments rc
      LEFT JOIN phones p ON rc.entity_type = 'phone' AND rc.entity_id = p.id
      LEFT JOIN news n ON rc.entity_type = 'news' AND rc.entity_id = n.id
      ${whereClause}
    `, params);

    const total = countRows[0]?.total || 0;

    // Fetch items with joined item names, slugs, and reply counts
    const query = `
      SELECT 
        rc.id,
        rc.entity_type,
        rc.entity_id,
        rc.parent_id,
        rc.user_name,
        rc.user_email_phone,
        rc.user_website,
        rc.rating,
        rc.message,
        rc.status,
        rc.is_admin,
        rc.ip_address,
        rc.created_at,
        rc.updated_at,
        (SELECT COUNT(*) FROM reviews_comments WHERE parent_id = rc.id) AS reply_count,
        (SELECT user_name FROM reviews_comments WHERE id = rc.parent_id) AS parent_user_name,
        CASE 
          WHEN rc.entity_type = 'phone' THEN p.name
          WHEN rc.entity_type = 'news' THEN n.title
          ELSE 'Unknown'
        END AS item_title,
        CASE 
          WHEN rc.entity_type = 'phone' THEN CONCAT('/phone/', p.slug)
          WHEN rc.entity_type = 'news' THEN CONCAT('/news/', n.slug)
          ELSE '#'
        END AS item_url
      FROM reviews_comments rc
      LEFT JOIN phones p ON rc.entity_type = 'phone' AND rc.entity_id = p.id
      LEFT JOIN news n ON rc.entity_type = 'news' AND rc.entity_id = n.id
      ${whereClause}
      ORDER BY rc.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(query, [...params, parsedLimit, offset]);

    return {
      items: rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    };
  }

  /**
   * Get single item with complete thread of replies (for admin modal & detail view)
   */
  static async getThreadById(id) {
    const [itemRows] = await pool.query(`
      SELECT 
        rc.id,
        rc.entity_type,
        rc.entity_id,
        rc.parent_id,
        rc.user_name,
        rc.user_email_phone,
        rc.user_website,
        rc.rating,
        rc.message,
        rc.status,
        rc.is_admin,
        rc.ip_address,
        rc.created_at,
        rc.updated_at,
        CASE 
          WHEN rc.entity_type = 'phone' THEN p.name
          WHEN rc.entity_type = 'news' THEN n.title
          ELSE 'Unknown'
        END AS item_title,
        CASE 
          WHEN rc.entity_type = 'phone' THEN CONCAT('/phone/', p.slug)
          WHEN rc.entity_type = 'news' THEN CONCAT('/news/', n.slug)
          ELSE '#'
        END AS item_url
      FROM reviews_comments rc
      LEFT JOIN phones p ON rc.entity_type = 'phone' AND rc.entity_id = p.id
      LEFT JOIN news n ON rc.entity_type = 'news' AND rc.entity_id = n.id
      WHERE rc.id = ?
    `, [id]);

    if (itemRows.length === 0) return null;
    const item = itemRows[0];

    // If this item is a reply itself, get its parent id to show the whole thread
    const rootId = item.parent_id || item.id;

    // Fetch parent if current item is a reply
    let parentItem = null;
    if (item.parent_id) {
      const [parentRows] = await pool.query(`
        SELECT rc.*,
          CASE 
            WHEN rc.entity_type = 'phone' THEN p.name
            WHEN rc.entity_type = 'news' THEN n.title
            ELSE 'Unknown'
          END AS item_title,
          CASE 
            WHEN rc.entity_type = 'phone' THEN CONCAT('/phone/', p.slug)
            WHEN rc.entity_type = 'news' THEN CONCAT('/news/', n.slug)
            ELSE '#'
          END AS item_url
        FROM reviews_comments rc
        LEFT JOIN phones p ON rc.entity_type = 'phone' AND rc.entity_id = p.id
        LEFT JOIN news n ON rc.entity_type = 'news' AND rc.entity_id = n.id
        WHERE rc.id = ?
      `, [item.parent_id]);
      parentItem = parentRows[0] || null;
    }

    // Fetch all replies in this thread
    const [replies] = await pool.query(`
      SELECT 
        id, parent_id, user_name, user_email_phone, user_website, rating, message, status, is_admin, ip_address, created_at
      FROM reviews_comments
      WHERE parent_id = ?
      ORDER BY created_at ASC
    `, [rootId]);

    return {
      item,
      parent: parentItem,
      rootId,
      replies
    };
  }

  /**
   * Admin: Summary metrics for dashboard
   */
  static async getAdminStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN entity_type = 'phone' THEN 1 ELSE 0 END) AS phone_reviews_count,
        SUM(CASE WHEN entity_type = 'news' THEN 1 ELSE 0 END) AS news_comments_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
        COALESCE(AVG(CASE WHEN entity_type = 'phone' AND rating IS NOT NULL AND status = 'approved' AND parent_id IS NULL THEN rating ELSE NULL END), 0) AS avg_phone_rating
      FROM reviews_comments
    `);

    const s = rows[0] || {};
    return {
      total: s.total_count || 0,
      phone_reviews: s.phone_reviews_count || 0,
      news_comments: s.news_comments_count || 0,
      approved: s.approved_count || 0,
      rejected: s.rejected_count || 0,
      avg_phone_rating: s.avg_phone_rating ? parseFloat(s.avg_phone_rating).toFixed(1) : '0.0'
    };
  }

  /**
   * Update status (Approve / Reject)
   */
  static async updateStatus(id, status) {
    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status "${status}". Allowed: approved, rejected`);
    }

    const [result] = await pool.query(`
      UPDATE reviews_comments
      SET status = ?
      WHERE id = ?
    `, [status, id]);

    return result.affectedRows > 0;
  }

  /**
   * Delete review or comment (and any child replies)
   */
  static async delete(id) {
    // Delete child replies first if any
    await pool.query('DELETE FROM reviews_comments WHERE parent_id = ?', [id]);

    const [result] = await pool.query(`
      DELETE FROM reviews_comments
      WHERE id = ?
    `, [id]);

    return result.affectedRows > 0;
  }

  /**
   * Get single item by ID
   */
  static async getById(id) {
    const [rows] = await pool.query(`
      SELECT * FROM reviews_comments WHERE id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = ReviewModel;
