const { runPipeline, sampleInputs } = require("./src/runPipeline");

const results = Object.entries(sampleInputs).map(([name, input]) => {
  const result = runPipeline(input);
  const itinerary = result.itinerary;

  return {
    scenario: name,
    destination: itinerary.destination,
    status: itinerary.validation.status,
    qualityGate: itinerary.evaluationMetrics.qualityGate.status,
    days: itinerary.days.length,
    activities: itinerary.days.reduce((sum, day) => sum + day.activities.length, 0),
    confidenceScore: itinerary.reliability.confidenceScore,
    retrievalCoverage: itinerary.evaluationMetrics.retrievalCoverage,
    averageSemanticScore: itinerary.evaluationMetrics.averageSemanticScore,
    averageSelectedScore: itinerary.evaluationMetrics.averageSelectedScore,
    interestCoverage: itinerary.evaluationMetrics.interestCoverage,
    diversityScore: itinerary.evaluationMetrics.diversityScore,
    validationWarnings: itinerary.validation.warnings.length,
    fallbackUsed: itinerary.reliability.fallbackUsed
  };
});

console.table(results);

const failing = results.filter((result) => result.qualityGate === "fail");
if (failing.length) {
  process.exitCode = 1;
}

