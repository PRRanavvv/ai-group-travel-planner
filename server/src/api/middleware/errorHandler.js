const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;

  console.error(JSON.stringify({
    level: "error",
    traceId: req.traceId,
    method: req.method,
    path: req.originalUrl,
    message: err.message
  }));

  res.status(status).json({
    message: err.message || "Server error",
    traceId: req.traceId
  });
};

module.exports = errorHandler;

