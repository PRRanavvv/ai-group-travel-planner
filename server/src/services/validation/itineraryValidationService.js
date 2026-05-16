const path = require("path");

const validatorPath = path.resolve(__dirname, "../../../../mock_ai_pipeline/src/validateItinerary");
const validateItinerary = require(validatorPath);

const validatePlanningItinerary = (itinerary) => validateItinerary(itinerary);

module.exports = {
  validatePlanningItinerary
};

