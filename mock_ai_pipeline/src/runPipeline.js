const retrieveCandidates = require("./retrieveCandidates");
const scoreCandidates = require("./scoreCandidates");
const optimizeItinerary = require("./optimizeItinerary");
const generateItineraryJson = require("./generateItineraryJson");
const validateItinerary = require("./validateItinerary");
const sampleInputs = require("../data/sampleInputs");

const defaultInput = sampleInputs.jaipur;

const runPipeline = (input = defaultInput) => {
  const tripInput = normalizeTripInput(input);

  const { candidates, retrievalMeta } = retrieveCandidates(tripInput);
  const rankedCandidates = scoreCandidates(candidates, tripInput);
  const optimizedDays = optimizeItinerary(rankedCandidates, tripInput);
  const itinerary = generateItineraryJson({
    tripInput,
    optimizedDays,
    retrievalMeta
  });

  const validatedItinerary = validateItinerary(itinerary);

  return {
    input: tripInput,
    pipelineDebug: {
      retrievalMeta,
      topCandidates: rankedCandidates.slice(0, 10).map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        type: candidate.type,
        area: candidate.area,
        score: candidate.score,
        matchedTags: candidate.matchedTags,
        selectionReason: candidate.selectionReason
      }))
    },
    itinerary: validatedItinerary
  };
};

const normalizeTripInput = (input) => ({
  destination: input.destination || defaultInput.destination,
  days: Math.max(1, Math.min(7, Number(input.days || defaultInput.days))),
  budget: input.budget || "balanced",
  optimizationMode: input.optimizationMode || input.budget || "balanced",
  interests: Array.isArray(input.interests) ? input.interests : []
});

module.exports = {
  defaultInput,
  sampleInputs,
  runPipeline
};
