const buildItineraryGraph = (itinerary) => {
  const nodes = [];
  const edges = [];

  nodes.push({
    id: "constraint:budget",
    type: "constraint",
    constraintType: "budget",
    value: itinerary.input?.budget || itinerary.optimizationMode || "balanced"
  });

  for (const day of itinerary.days || []) {
    const dayNodeId = `day:${day.day}`;
    nodes.push({
      id: dayNodeId,
      type: "day",
      day: day.day,
      fatigueScore: day.fatigueScore,
      estimatedTravelMinutes: day.estimatedTravelMinutes
    });

    const hotelStartId = `hotel:day:${day.day}:start`;
    const hotelEndId = `hotel:day:${day.day}:end`;
    nodes.push({ id: hotelStartId, type: "hotel", day: day.day, label: "Day start hotel placeholder", locked: true });
    nodes.push({ id: hotelEndId, type: "hotel", day: day.day, label: "Day end hotel placeholder", locked: true });

    let previousNodeId = hotelStartId;

    for (const [index, activity] of day.activities.entries()) {
      const activityNodeId = activity.placeId;
      nodes.push({
        id: activityNodeId,
        type: "activity",
        day: day.day,
        index,
        slot: activity.slot,
        locked: Boolean(activity.locked),
        activity
      });

      edges.push({
        from: dayNodeId,
        to: activityNodeId,
        type: "contains",
        reason: `Day ${day.day} contains ${activity.title}`
      });

      edges.push({
        from: "constraint:budget",
        to: activityNodeId,
        type: "constraint",
        reason: `${activity.title} must remain compatible with budget mode`
      });

      edges.push({
        from: previousNodeId,
        to: activityNodeId,
        type: "sequence",
        day: day.day,
        reason: `${activity.title} depends on the previous stop and travel duration`
      });

      edges.push({
        from: `constraint:time:${activity.slot}`,
        to: activityNodeId,
        type: "constraint",
        reason: `${activity.title} depends on ${activity.slot} timing`
      });

      if (!nodes.find((node) => node.id === `constraint:time:${activity.slot}`)) {
        nodes.push({
          id: `constraint:time:${activity.slot}`,
          type: "constraint",
          constraintType: "timeWindow",
          value: activity.slot
        });
      }

      if (activity.weatherSensitivity || activity.semanticSignals) {
        const weatherNodeId = `constraint:weather:${activity.slot}`;
        if (!nodes.find((node) => node.id === weatherNodeId)) {
          nodes.push({
            id: weatherNodeId,
            type: "constraint",
            constraintType: "weather",
            value: activity.slot
          });
        }
        edges.push({
          from: weatherNodeId,
          to: activityNodeId,
          type: "constraint",
          reason: `${activity.title} may depend on weather suitability`
        });
      }

      previousNodeId = activityNodeId;
    }

    edges.push({
      from: previousNodeId,
      to: hotelEndId,
      type: "sequence",
      day: day.day,
      reason: `End Day ${day.day} after final planned stop`
    });
  }

  return {
    nodes,
    edges,
    byId: Object.fromEntries(nodes.map((node) => [node.id, node]))
  };
};

const getActivityNode = (graph, activityId) => graph.byId[activityId];

const getNeighborActivityIds = (graph, activityId) => {
  const neighbors = new Set();

  for (const edge of graph.edges) {
    if (edge.type !== "sequence") continue;
    if (edge.from === activityId && graph.byId[edge.to]?.type === "activity") neighbors.add(edge.to);
    if (edge.to === activityId && graph.byId[edge.from]?.type === "activity") neighbors.add(edge.from);
  }

  return [...neighbors];
};

const getDayActivityIds = (graph, day) => graph.nodes
  .filter((node) => node.type === "activity" && node.day === day)
  .sort((a, b) => a.index - b.index)
  .map((node) => node.id);

module.exports = {
  buildItineraryGraph,
  getActivityNode,
  getDayActivityIds,
  getNeighborActivityIds
};

