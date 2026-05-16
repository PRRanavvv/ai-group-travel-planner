const mongoose = require("mongoose");

const requireDatabase = (req, res, next) => {
    if (mongoose.connection.readyState === 1) {
        return next();
    }

    return res.status(503).json({
        message: "Database is not connected. Start MongoDB on mongodb://127.0.0.1:27017/travelApp or set MONGO_URI, then restart the backend server."
    });
};

module.exports = requireDatabase;
