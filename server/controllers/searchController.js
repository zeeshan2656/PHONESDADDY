const PhoneModel = require('../models/phoneModel');

class SearchController {
  static async search(req, res, next) {
    try {
      const query = req.query.q || '';
      const limit = Math.min(20, parseInt(req.query.limit || 8, 10));

      if (!query || query.trim().length === 0) {
        return res.json({ success: true, data: [] });
      }

      const results = await PhoneModel.searchPhones(query.trim(), limit);
      return res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SearchController;
