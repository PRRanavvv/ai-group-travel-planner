const evaluatePipeline = ({
  tripInput,
  retrievalMeta,
  rankedCandidates,
  itinerary
}) => {
  const selectedActivities = itinerary.days.flatMap((day) => day.activities);
  const selectedIds = new Set(selectedActivities.map((activity) => activity.placeId));
  const topCandidateIds = new Set(rankedCandidates.slice(0, selectedActivities.length || 1).map((candidate) => candidate.id));
  const selectedFromTop = [...selectedIds].filter((id) => topCandidateIds.has(id)).length;
  const selectedTypes = new Set(selectedActivities.map((activity) => activity.type));
  const selectedAreas = new Set(selectedActivities.map((activity) => activity.area));
  const requestedInterests = new Set(tripInput.interests || []);
  const coveredInterests = new Set();

  for (const activity of selectedActivities) {
    const activityTerms = new Set([
      activity.type,
      ...(activity.tags || []),
      ...(activity.semanticSignals?.exactMatches || [])
    ].map((term) => String(term).toLowerCase()));
    const fuzzyQueryTerms = new Set(
      (activity.semanticSignals?.fuzzyMatches || []).map((match) => String(match.queryTerm).toLowerCase())
    );
    const synonymQueryTerms = new Set(
      (activity.semanticSignals?.synonymMatches || []).map((match) => String(match.queryTerm).toLowerCase())
    );

    for (const interest of requestedInterests) {
      if (
        activityTerms.has(interest) ||
        fuzzyQueryTerms.has(interest) ||
        synonymQueryTerms.has(interest) ||
        activity.bestTime?.includes(interest) ||
        activity.explanation?.rankingEvidence?.strongestFactors?.includes(interest) ||
        activity.title.toLowerCase().includes(interest)
      ) {
        coveredInterests.add(interest);
      }
    }
  }

  const completeness = tripInput.days
    ? itinerary.days.filter((day) => day.activities.length > 0).length / tripInput.days
    : 0;

  const metrics = {
    retrievalCoverage: retrievalMeta.retrievalCoverage,
    averageSemanticScore: retrievalMeta.averageSemanticScore,
    fuzzyMatchCount: retrievalMeta.fuzzyMatchCount,
    synonymMatchCount: retrievalMeta.synonymMatchCount,
    topCandidateUtilization: selectedActivities.length
      ? Number((selectedFromTop / selectedActivities.length).toFixed(2))
      : 0,
    averageSelectedScore: average(selectedActivities.map((activity) => activity.score)),
    itineraryCompleteness: Number(completeness.toFixed(2)),
    interestCoverage: requestedInterests.size
      ? Number((coveredInterests.size / requestedInterests.size).toFixed(2))
      : 1,
    diversityScore: selectedActivities.length
      ? Number((selectedTypes.size / selectedActivities.length).toFixed(2))
      : 0,
    areaSpread: selectedAreas.size,
    validationErrorCount: itinerary.validation.errors.length,
    validationWarningCount: itinerary.validation.warnings.length,
    fallbackUsed: retrievalMeta.fallbackUsed
  };

  return {
    ...itinerary,
    evaluationMetrics: {
      ...metrics,
      qualityGate: buildQualityGate(metrics)
    }
  };
};

const buildQualityGate = (metrics) => {
  const blockers = [];
  const warnings = [];

  if (metrics.validationErrorCount > 0) blockers.push("Validation errors present.");
  if (metrics.itineraryCompleteness < 1) blockers.push("Itinerary is incomplete.");
  if (metrics.retrievalCoverage < 0.5) warnings.push("Retrieval coverage is low.");
  if (metrics.averageSelectedScore < 70) warnings.push("Selected candidate score is weak.");
  if (metrics.validationWarningCount > 0) warnings.push("Validation warnings present.");
  if (metrics.interestCoverage < 0.5) warnings.push("Requested interests are weakly represented.");

  return {
    status: blockers.length ? "fail" : warnings.length ? "warn" : "pass",
    blockers,
    warnings
  };
};

const average = (values) => {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
};

module.exports = evaluatePipeline;
