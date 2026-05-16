const logInfo = (event, payload = {}) => {
  console.log(JSON.stringify({
    level: "info",
    event,
    ...payload
  }));
};

const timeOperation = async (event, traceId, fn) => {
  const startedAt = Date.now();
  try {
    const result = await fn();
    logInfo(event, {
      traceId,
      durationMs: Date.now() - startedAt,
      status: "success"
    });
    return result;
  } catch (error) {
    logInfo(event, {
      traceId,
      durationMs: Date.now() - startedAt,
      status: "error",
      message: error.message
    });
    throw error;
  }
};

module.exports = {
  logInfo,
  timeOperation
};

