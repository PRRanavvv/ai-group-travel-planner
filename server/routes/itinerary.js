const express = require("express");
const router = express.Router();
const { generateItinerary } = require("../controllers/itineraryController");
const protect = require("../middleware/authMiddleware");

// ✅ ADD PROTECTION (IMPORTANT)
router.post("/generate-itinerary", protect, generateItinerary);

module.exports = router;