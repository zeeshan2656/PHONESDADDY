const PhoneModel = require('../models/phoneModel');

class CompareController {
  static async compare(req, res, next) {
    try {
      const phonesParam = req.query.phones || '';
      if (!phonesParam) {
        return res.json({ success: true, data: [] });
      }

      const slugs = phonesParam
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (slugs.length === 0) {
        return res.json({ success: true, data: [] });
      }

      const phones = await PhoneModel.getPhonesForCompare(slugs);

      return res.json({
        success: true,
        data: phones
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CompareController;
