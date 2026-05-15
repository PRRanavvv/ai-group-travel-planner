const places = require("../data/places");
const { budgetRank, budgetTarget } = require("./utils");

const normalize = (value) => String(value || "").trim().toLowerCase();

const hasInterestMatch = (place, interests) => {
  if (!interests.length) return true;
  const tagSet = new Set([place.type, ...place.tags].map(normalize));
  return interests.some((interest) => tagSet.has(normalize(interest)));
};

const isBudgetCompatible = (place, budget) => {
  const mode = normalize(budget) || "balanced";
  if (mode === "luxury") return true;
  const placeRank = budgetRank[place.budgetTier] ?? 2;
  const target = budgetTarget[mode] ?? budgetTarget.balanced;
  return placeRank <= target + 1;
};

const retrieveCandidates = (tripInput) => {
  const destination = normalize(tripInput.destination);
  const interests = (tripInput.interests || []).map(normalize);

  const destinationMatches = places.filter(
    (place) => normalize(place.destination) === destination
  );

  let candidates = destinationMatches
    .filter((place) => isBudgetCompatible(place, tripInput.budget))
    .filter((place) => hasInterestMatch(place, interests));

  let fallbackUsed = false;
  let fallbackReason = null;

  if (candidates.length < Math.min(6, destinationMatches.length)) {
    fallbackUsed = true;
    fallbackReason = "Interest filters were relaxed because too few candidates matched.";
    candidates = destinationMatches.filter((place) => isBudgetCompatible(place, tripInput.budget));
  }

  if (candidates.length < Math.min(6, destinationMatches.length)) {
    fallbackUsed = true;
    fallbackReason = "Budget filters were relaxed because destination coverage was sparse.";
    candidates = destinationMatches;
  }

  const enrichedCandidates = candidates.map((place) => {
    const matchedTags = [...new Set(
      [place.type, ...place.tags].filter((tag) =>
        interests.includes(normalize(tag))
      )
    )];

    return {
      ...place,
      matchedTags,
      retrievalReason: matchedTags.length
        ? `Matched interests: ${matchedTags.join(", ")}`
        : "Included by destination fallback coverage"
    };
  });

  return {
    candidates: enrichedCandidates,
    retrievalMeta: {
      destinationMatches: destinationMatches.length,
      returnedCandidates: enrichedCandidates.length,
      retrievalCoverage: destinationMatches.length
        ? Number((enrichedCandidates.length / destinationMatches.length).toFixed(2))
        : 0,
      fallbackUsed,
      fallbackReason
    }
  };
};

module.exports = retrieveCandidates;
