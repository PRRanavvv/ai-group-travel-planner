const { runPipeline, sampleInputs } = require("./src/runPipeline");
const runPartialRegeneration = require("./src/partialRegeneration/partialRegenerationEngine");

const buildBaseItinerary = () => runPipeline(sampleInputs.jaipur).itinerary;

const scenarios = [
  {
    name: "single_activity_replacement",
    prepare: buildBaseItinerary,
    operation: {
      type: "replaceActivity",
      activityId: "jaipur_lassiwala",
      replacementInterests: ["museum", "heritage", "indoor"],
      reason: "User wants to replace a quick snack stop with a more cultural indoor activity."
    }
  },
  {
    name: "segment_reoptimization",
    prepare: buildBaseItinerary,
    operation: {
      type: "reoptimizeSegment",
      segmentId: "day:1:afternoon",
      replacementInterests: ["food", "heritage", "indoor"],
      reason: "Re-optimize only the Day 1 afternoon segment after group preference changes."
    }
  },
  {
    name: "budget_adjustment",
    prepare: buildBaseItinerary,
    operation: {
      type: "updateConstraint",
      constraintId: "budget",
      value: "cheapest",
      reason: "Group changed budget mode from balanced to cheapest."
    }
  },
  {
    name: "weather_disruption",
    prepare: buildBaseItinerary,
    operation: {
      type: "weatherDisruption",
      day: 1,
      slot: "evening",
      weather: "rain",
      allowSlotMismatch: true,
      reason: "Rain makes the outdoor evening viewpoint unsuitable."
    }
  },
  {
    name: "opening_hours_conflict",
    prepare: buildBaseItinerary,
    operation: {
      type: "openingHoursConflict",
      activityId: "jaipur_city_palace",
      replacementInterests: ["heritage", "museum", "indoor"],
      allowSlotMismatch: true,
      reason: "City Palace is unavailable during the requested morning slot."
    }
  },
  {
    name: "travel_delay",
    prepare: buildBaseItinerary,
    operation: {
      type: "travelDelay",
      activityId: "jaipur_city_palace",
      delayMinutes: 45,
      reason: "Traffic delay after the first activity shifts downstream timing."
    }
  },
  {
    name: "locked_activity_preservation",
    prepare: () => {
      const itinerary = buildBaseItinerary();
      const amber = findActivity(itinerary, "jaipur_amber_fort");
      if (amber) amber.locked = true;
      return itinerary;
    },
    operation: {
      type: "regenerateDay",
      day: 2,
      replacementInterests: ["heritage", "food", "viewpoint"],
      reason: "Regenerate Day 2 while preserving user-locked Amber Fort."
    }
  }
];

const results = scenarios.map((scenario) => {
  const base = scenario.prepare();
  const result = runPartialRegeneration({
    itinerary: base,
    operation: scenario.operation
  });

  return {
    scenario: scenario.name,
    changed: result.explanation.changeLog.length,
    affectedNodes: result.impact.affectedNodeIds.length,
    affectedDays: result.impact.affectedDayIds.join(",") || "-",
    stability: result.stability.overall,
    preservedActivities: result.stability.preservedActivitiesPct,
    preservedTiming: result.stability.preservedTimingPct,
    validation: result.updatedItinerary.validation.status,
    warnings: result.updatedItinerary.validation.warnings.length,
    recomputed: result.explanation.recomputed.join(",") || "-"
  };
});

console.table(results);

const failed = results.filter((result) => result.validation !== "valid");
if (failed.length) process.exitCode = 1;

function findActivity(itinerary, activityId) {
  for (const day of itinerary.days || []) {
    const found = day.activities.find((activity) => activity.placeId === activityId);
    if (found) return found;
  }
  return null;
}
