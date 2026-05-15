const express = require("express");
const router = express.Router();

const { signup, login, getMe } = require("../controllers/authcontroller");
const protect = require("../middleware/authMiddleware"); // 🔥 add this

router.post("/signup", signup);
router.post("/login", login);

// 🔥 ADD THIS ROUTE
router.get("/me", protect, getMe);

module.exports = router;