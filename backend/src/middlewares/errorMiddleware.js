function errorMiddleware(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Sunucu hatası";
  res.status(status).json({ message });
}

module.exports = { errorMiddleware };
