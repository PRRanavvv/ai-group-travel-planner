const { budgetRank, budgetTarget } = require("../utils");
const {
  getActivityNode,
  getDayActivityIds,
  getNeighborActivityIds
} = require("./itineraryGraph");

const analyzeImpact = ({ graph, itinerary, operation }) => {
  const affectedNodeIds = new Set();
  const affectedDayIds = new Set();
  const affectedConstraints = new Set();
  const reasons = [];
  const lockedNodeIds = new Set(
    graph.nodes.filter((node) => node.locked).map((node) => node.id)
  );

  if (operation.type === "replaceActivity") {
    markActivityWithNeighbors(graph, operation.activityId, affectedNodeIds, affectedDayIds);
    affectedConstraints.add("activity_selection");
    reasons.push(`Replace requested for ${operation.activityId}.`);
  }

  if (operation.type === "regenerateDay") {
    for (const id of getDayActivityIds(graph, operation.day)) affectedNodeIds.add(id);
    affectedDayIds.add(operation.day);
    affectedConstraints.add("day_structure");
    reasons.push(`Day ${operation.day} requested for localized regeneration.`);
  }

  if (operation.type === "reoptimizeSegment") {
    const parsed = parseSegment(operation.segmentId);
    const day = operation.day || parsed.day;
    const slots = operation.slots || (operation.slot ? [operation.slot] : parsed.slot ? [parsed.slot] : []);

    for (const id of getDayActivityIds(graph, day)) {
      const node = getActivityNode(graph, id);
      if (!slots.length || slots.includes(node.slot)) {
        affectedNodeIds.add(id);
      }
    }

    if (day) affectedDayIds.add(day);
    affectedConstraints.add("segment_timing");
    affectedConstraints.add("route_sequence");
    reasons.push(`Segment ${operation.segmentId || `${day}:${slots.join(",")}`} requested for localized reoptimization.`);
  }

  if (operation.type === "updateConstraint" && operation.constraintId === "budget") {
    affectedConstraints.add("budget");
    for (const day of itinerary.days || []) {
      for (const activity of day.activities || []) {
        if (!isBudgetCompatible(activity, operation.value)) {
          affectedNodeIds.add(activity.placeId);
          affectedDayIds.add(day.day);
        }
      }
    }
    reasons.push(`Budget constraint changed to ${operation.value}.`);
  }

  if (operation.type === "weatherDisruption") {
    affectedConstraints.add("weather");
    for (const day of itinerary.days || []) {
      if (operation.day && day.day !== operation.day) continue;
      for (const activity of day.activities || []) {
        const slotMatches = !operation.slot || activity.slot === operation.slot;
        const weatherSensitive = activity.weatherSensitivity !== "indoor" && !activity.tags?.includes("indoor");
        if (slotMatches && weatherSensitive) {
          affectedNodeIds.add(activity.placeId);
          affectedDayIds.add(day.day);
        }
      }
    }
    reasons.push(`Weather disruption affects ${operation.slot || "selected"} slots.`);
  }

  if (operation.type === "openingHoursConflict") {
    markActivityWithNeighbors(graph, operation.activityId, affectedNodeIds, affectedDayIds);
    affectedConstraints.add("opening_hours");
    reasons.push(`${operation.activityId} conflicts with opening hours or requested slot.`);
  }

  if (operation.type === "travelDelay") {
    const target = getActivityNode(graph, operation.activityId);
    if (target) {
      for (const id of getDayActivityIds(graph, target.day).slice(target.index + 1)) {
        affectedNodeIds.add(id);
      }
      affectedNodeIds.add(operation.activityId);
      affectedDayIds.add(target.day);
      affectedConstraints.add("timing");
      affectedConstraints.add("travel_duration");
      reasons.push(`Travel delay after ${operation.activityId} affects downstream timing on Day ${target.day}.`);
    }
  }

  const filteredAffected = [...affectedNodeIds].filter((id) => !lockedNodeIds.has(id));
  const preservedNodeIds = graph.nodes
    .filter((node) => node.type === "activity" && !filteredAffected.includes(node.id))
    .map((node) => node.id);

  return {
    operation,
    affectedNodeIds: filteredAffected,
    affectedDayIds: [...affectedDayIds],
    lockedNodeIds: [...lockedNodeIds],
    preservedNodeIds,
    affectedConstraints: [...affectedConstraints],
    recomputeScopes: {
      retrieval: filteredAffected.length > 0 && operation.type !== "travelDelay",
      ranking: filteredAffected.length > 0 && operation.type !== "travelDelay",
      optimization: [...affectedDayIds],
      validation: [...affectedDayIds],
      fullItinerary: false
    },
    reasons
  };
};

const markActivityWithNeighbors = (graph, activityId, affectedNodeIds, affectedDayIds) => {
  const node = getActivityNode(graph, activityId);
  if (!node) return;

  affectedNodeIds.add(activityId);
  affectedDayIds.add(node.day);

  for (const neighbor of getNeighborActivityIds(graph, activityId)) {
    affectedNodeIds.add(neighbor);
  }
};

const isBudgetCompatible = (activity, budget) => {
  const placeRank = budgetRank[activity.budgetTier] ?? 2;
  const target = budgetTarget[budget] ?? budgetTarget.balanced;
  return budget === "luxury" || placeRank <= target + 1;
};

const parseSegment = (segmentId = "") => {
  const [, dayPart, slot] = String(segmentId).match(/^day:(\d+):?([a-z_]+)?$/) || [];
  return {
    day: dayPart ? Number(dayPart) : undefined,
    slot
  };
};

module.exports = analyzeImpact;
