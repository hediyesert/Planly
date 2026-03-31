function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => {
      const v = req.body[f];
      return v === undefined || v === null || v === "";
    });
    if (missing.length) {
      return res.status(400).json({ message: `Eksik alanlar: ${missing.join(", ")}` });
    }
    next();
  };
}

module.exports = { requireFields };
