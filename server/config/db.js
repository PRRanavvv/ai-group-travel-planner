const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/travelApp";
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("MongoDB connected");
    } catch (error) {
        console.error("DB connection error:", error.message);

        if (process.env.REQUIRE_DB === "true") {
            process.exit(1);
        }

        console.warn("Continuing without MongoDB. DB-backed routes will fail until MongoDB is available.");
    }
};

module.exports = connectDB;
