const path = require("path");

const enginePath = path.resolve(
  __dirname,
  "../../../../mock_ai_pipeline/src/partialRegeneration/partialRegenerationEngine"
);
const runPartialRegeneration = require(enginePath);

const regeneratePartialItinerary = ({ itinerary, operation }) => {
  return runPartialRegeneration({ itinerary, operation });
};

module.exports = {
  regeneratePartialItinerary
};

