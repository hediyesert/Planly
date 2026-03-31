const { buildWeeklyAnalytics } = require("../services/analyticsService");

async function weekly(req, res, next) {
  try {
    const data = await buildWeeklyAnalytics(req.userId);
    return res.json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = { weekly };
