const traceRequest = (req, res, next) => {
  req.traceId = `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  next();
};

module.exports = traceRequest;

