const scoreStability = (before, after) => {
  const beforeActivities = flattenActivities(before);
  const afterActivities = flattenActivities(after);
  const beforeById = new Map(beforeActivities.map((activity) => [activity.placeId, activity]));
  const afterById = new Map(afterActivities.map((activity) => [activity.placeId, activity]));

  const preservedIds = [...beforeById.keys()].filter((id) => afterById.has(id));
  const preservedActivities = ratio(preservedIds.length, beforeActivities.length);
  const preservedTimings = ratio(
    preservedIds.filter((id) => beforeById.get(id).time === afterById.get(id).time).length,
    beforeActivities.length
  );
  const preservedRoute = ratio(
    preservedTransitions(before).filter((transition) => preservedTransitions(after).includes(transition)).length,
    Math.max(1, preservedTransitions(before).length)
  );

  const beforeBudget = totalBudget(beforeActivities);
  const afterBudget = totalBudget(afterActivities);
  const budgetDelta = afterBudget - beforeBudget;
  const budgetDeltaPct = beforeBudget ? budgetDelta / beforeBudget : 0;
  const budgetStability = Math.max(0, 1 - Math.min(1, Math.abs(budgetDeltaPct)));

  const overall =
    preservedActivities * 0.35 +
    preservedTimings * 0.25 +
    preservedRoute * 0.2 +
    budgetStability * 0.1 +
    preferenceRetention(before, after) * 0.1;

  return {
    overall: Number(overall.toFixed(2)),
    preservedActivitiesPct: Number(preservedActivities.toFixed(2)),
    preservedTimingPct: Number(preservedTimings.toFixed(2)),
    preservedRoutePct: Number(preservedRoute.toFixed(2)),
    budgetDelta,
    budgetDeltaPct: Number(budgetDeltaPct.toFixed(2)),
    preferenceRetentionPct: Number(preferenceRetention(before, after).toFixed(2))
  };
};

const flattenActivities = (itinerary) => (itinerary.days || []).flatMap((day) =>
  (day.activities || []).map((activity) => ({ ...activity, day: day.day }))
);

const preservedTransitions = (itinerary) => (itinerary.days || []).flatMap((day) => {
  const ids = (day.activities || []).map((activity) => activity.placeId);
  return ids.slice(0, -1).map((id, index) => `${id}->${ids[index + 1]}`);
});

const totalBudget = (activities) => activities.reduce((sum, activity) => sum + Number(activity.estimatedCost || 0), 0);

const preferenceRetention = (before, after) => {
  const interests = new Set(before.input?.interests || []);
  if (!interests.size) return 1;

  const afterActivities = flattenActivities(after);
  const covered = new Set();

  for (const activity of afterActivities) {
    for (const interest of interests) {
      if (activity.type === interest || activity.tags?.includes(interest)) {
        covered.add(interest);
      }
    }
  }

  return ratio(covered.size, interests.size);
};

const ratio = (value, total) => total ? value / total : 1;

module.exports = scoreStability;

