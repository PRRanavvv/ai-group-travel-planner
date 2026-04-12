require("dotenv").config(); // ✅ MUST BE FIRST LINE

const express = require("express");
const cors = require("cors");

const itineraryRoutes = require("./routes/itinerary");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB connection
connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/itinerary", itineraryRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
});