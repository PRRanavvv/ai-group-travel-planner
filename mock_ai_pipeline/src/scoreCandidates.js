const { budgetRank, budgetTarget, clamp } = require("./utils");

const weightsByMode = {
  balanced: {
    preference: 0.25,
    budget: 0.2,
    distance: 0.15,
    timeFit: 0.15,
    diversity: 0.1,
    quality: 0.1,
    weather: 0.05
  },
  cheapest: {
    preference: 0.2,
    budget: 0.35,
    distance: 0.2,
    timeFit: 0.1,
    diversity: 0.05,
    quality: 0.05,
    weather: 0.05
  },
  luxury: {
    preference: 0.2,
    budget: 0.1,
    distance: 0.1,
    timeFit: 0.15,
    diversity: 0.05,
    quality: 0.25,
    weather: 0.05,
    comfort: 0.1
  },
  time_efficient: {
    preference: 0.2,
    budget: 0.05,
    distance: 0.3,
    timeFit: 0.25,
    diversity: 0.05,
    quality: 0.1,
    weather: 0.05
  },
  fuel_efficient: {
    preference: 0.15,
    budget: 0.05,
    distance: 0.35,
    timeFit: 0.1,
    diversity: 0.05,
    quality: 0.05,
    weather: 0.05,
    clustering: 0.2
  }
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const scorePreference = (place, interests) => {
  if (!interests.length) return 70;
  const searchSpace = new Set([place.type, ...place.tags].map(normalize));
  const matches = interests.filter((interest) => searchSpace.has(normalize(interest)));
  const directTypeBonus = interests.includes(normalize(place.type)) ? 15 : 0;
  return clamp(45 + matches.length / interests.length * 45 + directTypeBonus);
};

const scoreBudget = (place, budget) => {
  const mode = normalize(budget) || "balanced";
  const placeRank = budgetRank[place.budgetTier] ?? 2;
  const target = budgetTarget[mode] ?? budgetTarget.balanced;
  const distance = Math.abs(placeRank - target);

  if (mode === "luxury" && placeRank >= 3) return 95;
  if (mode === "cheapest" && placeRank <= 1) return 95;

  return clamp(100 - distance * 22);
};

const scoreTimeFit = (place) => {
  if (place.bestTime.includes("morning") && place.bestTime.includes("evening")) return 95;
  if (place.bestTime.length >= 2) return 88;
  return 78;
};

const scoreDistanceProxy = (place, candidates) => {
  const sameAreaCount = candidates.filter((candidate) => candidate.area === place.area).length;
  return clamp(55 + sameAreaCount * 12);
};

const scoreDiversity = (place, candidates) => {
  const sameTypeCount = candidates.filter((candidate) => candidate.type === place.type).length;
  return clamp(100 - Math.max(0, sameTypeCount - 2) * 8);
};

const scoreWeather = (place) => {
  if (place.weatherSensitivity === "indoor") return 90;
  if (place.weatherSensitivity === "mixed") return 82;
  return 74;
};

const scoreComfort = (place) => {
  const lowerFatigueBonus = 100 - place.fatigueScore;
  const premiumBonus = ["high", "luxury"].includes(place.budgetTier) ? 12 : 0;
  return clamp(lowerFatigueBonus + premiumBonus);
};

const scoreCandidates = (candidates, tripInput) => {
  const mode = normalize(tripInput.optimizationMode || tripInput.budget || "balanced").replace("-", "_");
  const weights = weightsByMode[mode] || weightsByMode.balanced;
  const interests = (tripInput.interests || []).map(normalize);

  return candidates
    .map((place) => {
      const breakdown = {
        preference: scorePreference(place, interests),
        budget: scoreBudget(place, tripInput.budget),
        distance: scoreDistanceProxy(place, candidates),
        timeFit: scoreTimeFit(place),
        diversity: scoreDiversity(place, candidates),
        quality: Math.round((place.qualityScore + place.popularityScore) / 2),
        weather: scoreWeather(place),
        comfort: scoreComfort(place),
        clustering: scoreDistanceProxy(place, candidates)
      };

      const score = Object.entries(weights).reduce(
        (sum, [factor, weight]) => sum + (breakdown[factor] || 0) * weight,
        0
      );

      return {
        ...place,
        score: Number(score.toFixed(2)),
        scoreBreakdown: breakdown,
        selectionReason: buildSelectionReason(place, breakdown)
      };
    })
    .sort((a, b) => b.score - a.score);
};

const buildSelectionReason = (place, breakdown) => {
  const strengths = Object.entries(breakdown)
    .filter(([, score]) => score >= 85)
    .map(([name]) => name);

  if (!strengths.length) {
    return `${place.name} is a usable ${place.type} option with balanced fit.`;
  }

  return `${place.name} ranks strongly for ${strengths.slice(0, 3).join(", ")}.`;
};

module.exports = scoreCandidates;

