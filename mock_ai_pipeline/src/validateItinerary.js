const { timeToMinutes } = require("./utils");

const requiredActivityFields = [
  "placeId",
  "time",
  "durationMinutes",
  "title",
  "description",
  "type",
  "budgetTier",
  "source"
];

const validateItinerary = (itinerary) => {
  const errors = [];
  const warnings = [];
  const seenPlaceIds = new Set();

  if (!itinerary.destination) errors.push("Missing destination.");
  if (!Array.isArray(itinerary.days)) errors.push("Missing days array.");
  if (itinerary.days?.length !== Number(itinerary.input?.days)) {
    errors.push(`Expected ${itinerary.input?.days} days, received ${itinerary.days?.length}.`);
  }

  for (const day of itinerary.days || []) {
    if (!day.day) errors.push("Day is missing day number.");
    if (!day.title) errors.push(`Day ${day.day} is missing title.`);
    if (!Array.isArray(day.activities)) {
      errors.push(`Day ${day.day} is missing activities array.`);
      continue;
    }

    let previousStart = -1;

    for (const activity of day.activities) {
      for (const field of requiredActivityFields) {
        if (activity[field] === undefined || activity[field] === null || activity[field] === "") {
          errors.push(`Activity on day ${day.day} is missing ${field}.`);
        }
      }

      if (seenPlaceIds.has(activity.placeId)) {
        errors.push(`Duplicate place detected: ${activity.placeId}.`);
      }
      seenPlaceIds.add(activity.placeId);

      const start = parseDisplayTime(activity.time);
      if (Number.isNaN(start)) {
        errors.push(`Invalid time "${activity.time}" for ${activity.title}.`);
      }

      if (start <= previousStart) {
        errors.push(`Activities on day ${day.day} are not in chronological order.`);
      }
      previousStart = start;

      if (activity.bestTime && !activity.bestTime.includes(activity.slot)) {
        warnings.push(
          `${activity.title} is scheduled for ${activity.slot}, but its best time is ${activity.bestTime.join(", ")}.`
        );
      }
    }

    if (day.activities.length > 5) {
      warnings.push(`Day ${day.day} has more than 5 activities.`);
    }

    if (day.fatigueScore > 100) {
      warnings.push(`Day ${day.day} has high fatigue score: ${day.fatigueScore}.`);
    }

    if (day.estimatedTravelMinutes > 180) {
      warnings.push(`Day ${day.day} has high travel time: ${day.estimatedTravelMinutes} minutes.`);
    }
  }

  const status = errors.length ? "invalid" : "valid";

  return {
    ...itinerary,
    validation: {
      status,
      errors,
      warnings
    }
  };
};

const parseDisplayTime = (displayTime) => {
  if (!displayTime || typeof displayTime !== "string") return NaN;
  const match = displayTime.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) return NaN;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3].toUpperCase();

  if (hours === 12) hours = 0;
  if (suffix === "PM") hours += 12;

  return timeToMinutes(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
};

module.exports = validateItinerary;
