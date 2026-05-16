const validateRequest = (schema) => (req, res, next) => {
  const result = schema(req);

  if (!result.valid) {
    return res.status(400).json({
      message: "Invalid request",
      errors: result.errors,
      traceId: req.traceId
    });
  }

  next();
};

module.exports = validateRequest;

