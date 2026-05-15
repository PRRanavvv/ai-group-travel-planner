# WayFinder AI Pipeline Documentation

## Purpose

This document defines how WayFinder thinks.

WayFinder should not behave like a chatbot that invents trips from a prompt. It should behave like a decision system that extracts intent, retrieves grounded options, ranks them with transparent scoring, optimizes them against real constraints, and only then asks an LLM to convert the selected plan into polished structured JSON.

The core principle is:

> The system decides. The LLM explains, sequences, and formats.

## Product Intelligence Model

WayFinder has five intelligence layers:

1. Intent understanding: converts user and group input into structured travel preferences.
2. Retrieval: finds candidate places, stays, restaurants, transport options, and route facts.
3. Ranking: scores candidates with deterministic recommendation logic.
4. Optimization: builds a realistic trip plan using timing, budget, distance, fatigue, weather, and diversity rules.
5. Generation and validation: asks the LLM to produce structured itinerary JSON, then validates and repairs or retries the result.

Each layer should produce inspectable intermediate outputs so the team can debug why an activity was selected, rejected, moved, or replaced.

## Full AI Pipeline Flow

```text
User Input
  -> Preference Extraction
  -> Constraint Analysis
  -> Retrieval Pipeline
  -> Recommendation Ranking
  -> Optimization Layer
  -> LLM Context Injection
  -> Structured JSON Generation
  -> Validation Layer
  -> Frontend Visualization
```

### 1. User Input

Inputs can come from solo trips, group trips, proposal updates, or future memory.

Minimum MVP inputs:

- Destination
- Start date and end date
- Number of travelers
- Trip type: solo, friends, family, couple, workation
- Budget mode: cheapest, balanced, luxury
- Optimization mode: cheapest, balanced, time-efficient, fuel-efficient, luxury
- Interests: food, nature, adventure, heritage, shopping, nightlife, beaches, cafes, museums
- Pace: relaxed, moderate, packed
- Hard constraints: must visit, avoid, accessibility, dietary, children, elder-friendly, alcohol-free, no late nights

For groups, WayFinder should merge member preferences into a group preference profile instead of treating the host as the only source of truth.

### 2. Preference Extraction

The input layer converts raw text and UI selections into a normalized preference object.

Example output:

```json
{
  "destination": "Jaipur",
  "days": 3,
  "travelers": 4,
  "tripType": "friends",
  "budgetMode": "balanced",
  "optimizationMode": "time_efficient",
  "pace": "moderate",
  "interests": ["heritage", "food", "shopping", "viewpoints"],
  "avoid": ["long walking"],
  "mustVisit": ["Amber Fort"],
  "timeWindows": {
    "startDay": "09:00",
    "endDay": "21:30"
  }
}
```

For free-text inputs, use the LLM only to extract structured preferences. Do not let this step generate itinerary content.

### 3. Constraint Analysis

Constraints are split into hard constraints and soft constraints.

Hard constraints must not be violated:

- Trip dates and duration
- Destination
- Budget ceiling, when provided
- Closed hours
- Required accessibility constraints
- Must-avoid locations or activity types
- Group size capacity
- Safety restrictions

Soft constraints influence ranking:

- Preferred vibe
- Lower walking
- More scenic spots
- More local food
- Less crowded
- Lower travel fatigue
- More premium comfort

Constraint analysis produces:

```json
{
  "hardFilters": {
    "destination": "Jaipur",
    "maxBudgetTier": "mid",
    "excludeTags": ["alcohol-heavy"],
    "requiresAccessibility": false
  },
  "softPreferences": {
    "heritage": 0.9,
    "food": 0.8,
    "shopping": 0.6,
    "nightlife": 0.2
  },
  "dailyLimits": {
    "maxActivitiesPerDay": 5,
    "maxTravelMinutesPerDay": 120,
    "maxFatigueScorePerDay": 75
  }
}
```

## Retrieval Strategy

Retrieval answers: what candidate options are available before ranking?

WayFinder should retrieve multiple entity types:

- Attractions and landmarks
- Cafes and restaurants
- Hidden gems and local experiences
- Hotels and stays
- Transport modes
- Route segments
- Viewpoints and photo spots
- Events and seasonal experiences
- Weather-sensitive activities
- Backup indoor activities

### Retrieval Inputs

Retrieval should use:

- Destination
- Geographic bounds
- Tags
- Activity type
- Budget tier
- Opening hours
- Best time of day
- Popularity
- User interests
- Group preference profile
- Embedding similarity
- Weather conditions
- Current itinerary gaps

### MVP Retrieval Flow

```text
Build normalized query
  -> Apply hard filters in database
  -> Run semantic search over curated place records
  -> Retrieve top 40 to 80 candidates
  -> Group candidates by type and time window
  -> Send candidates to ranking engine
```

### What Gets Embedded

Each place should have an embedding text field composed from structured metadata:

```text
Name: Amber Fort
Type: heritage attraction
Destination: Jaipur
Tags: fort, history, architecture, viewpoint, family friendly
Budget tier: mid
Best time: morning
Duration: 150 minutes
Description: Historic hilltop fort with courtyards, viewpoints, and guided tours.
Good for: heritage lovers, first-time visitors, photography
Avoid if: mobility limitations, extreme afternoon heat
```

Do not embed raw JSON directly. Create a readable semantic summary string.

### Retrieval Fallbacks

If retrieval returns too few results:

1. Relax optional tags.
2. Expand budget tier by one level.
3. Include adjacent activity types.
4. Use destination-level popular defaults.
5. Ask the LLM to fill only generic time blocks, clearly marked as low-confidence, until curated data exists.

## Recommendation Logic System

Ranking answers: which retrieved candidates are best for this trip?

Each candidate receives a composite score from 0 to 100. The score should be explainable, stored, and available for debugging.

### Default Balanced Scoring

| Factor | Weight |
| --- | ---: |
| Group preference match | 25% |
| Budget match | 20% |
| Distance efficiency | 15% |
| Time-window fit | 15% |
| Activity diversity | 10% |
| Popularity and quality | 10% |
| Weather suitability | 5% |

Formula:

```text
score =
  0.25 * group_preference_match +
  0.20 * budget_match +
  0.15 * distance_efficiency +
  0.15 * time_window_fit +
  0.10 * diversity_score +
  0.10 * quality_score +
  0.05 * weather_suitability
```

Every sub-score should be normalized to 0 to 100.

### Candidate Score Object

```json
{
  "placeId": "amber_fort_jaipur",
  "name": "Amber Fort",
  "type": "heritage",
  "score": 87.4,
  "scoreBreakdown": {
    "groupPreferenceMatch": 94,
    "budgetMatch": 80,
    "distanceEfficiency": 82,
    "timeWindowFit": 95,
    "activityDiversity": 75,
    "quality": 90,
    "weatherSuitability": 85
  },
  "selectionReason": "High heritage match, strong morning fit, efficient route cluster."
}
```

### Group Preference Match

For group trips, calculate preference match from member-level preferences.

Recommended MVP approach:

```text
member_match = similarity(member_interests, candidate_tags)
group_preference_match = average(member_match) + consensus_bonus - conflict_penalty
```

Consensus bonus:

- Add points when many members share the candidate's tags.
- Example: 4 of 5 members like food experiences.

Conflict penalty:

- Subtract points if a candidate strongly violates one member's hard preference.
- Example: nightlife venue when a member has "no alcohol-heavy places."

Voting data should later update this model. If users repeatedly upvote cafes and downvote museums, the group preference profile should shift.

### Budget Match

Budget scoring should compare candidate cost tier against user mode:

| User Budget | Best Fit | Acceptable | Penalty |
| --- | --- | --- | --- |
| Cheapest | free, low | mid | high, luxury |
| Balanced | low, mid | free, high | luxury |
| Luxury | high, luxury | mid | free-only filler |

Budget score should use both tier and estimated cost when available.

### Distance Efficiency

Distance efficiency should reward candidates that fit the current route cluster.

Inputs:

- Distance from previous activity
- Distance to next likely activity
- Same neighborhood cluster
- Transport availability
- Travel time estimate

Simple MVP rule:

```text
distance_efficiency = 100 - normalized_travel_penalty
```

Where long travel between nearby activities, backtracking, and isolated locations reduce the score.

### Activity Diversity

WayFinder should avoid creating a day with five similar activities unless the user explicitly asks for that.

Diversity should track:

- Activity type
- Physical intensity
- Indoor/outdoor mix
- Paid/free mix
- Popular/local mix
- Food/non-food balance

Example:

```text
heritage fort + palace + museum + monument = low diversity
heritage fort + local lunch + market + viewpoint = high diversity
```

## Optimization Modes

Optimization modes change scoring weights and itinerary construction behavior.

### Balanced Mode

Goal: best overall trip quality.

Behavior:

- Mix popular and local experiences.
- Keep travel moderate.
- Balance budget and comfort.
- Include variety across each day.
- Prefer reliable, broadly appealing options.

Weights:

| Factor | Weight |
| --- | ---: |
| Group preference match | 25% |
| Budget match | 20% |
| Distance efficiency | 15% |
| Time-window fit | 15% |
| Activity diversity | 10% |
| Quality | 10% |
| Weather suitability | 5% |

### Cheapest Mode

Goal: reduce total trip cost without making the trip unrealistic.

Behavior:

- Prefer free and low-cost attractions.
- Prefer public transport and walkable clusters.
- Avoid premium restaurants and paid add-ons.
- Use budget stays.
- Group nearby activities to reduce travel cost.
- Keep one or two paid highlights if highly relevant.

Weights:

| Factor | Weight |
| --- | ---: |
| Budget match | 35% |
| Group preference match | 20% |
| Distance efficiency | 20% |
| Time-window fit | 10% |
| Activity diversity | 5% |
| Quality | 5% |
| Weather suitability | 5% |

### Luxury Mode

Goal: maximize comfort, quality, exclusivity, and low friction.

Behavior:

- Prefer premium stays and curated experiences.
- Reduce walking and waiting.
- Include reservations, private transport, guided experiences.
- Avoid overcrowded budget-heavy options unless iconic.
- Keep daily activity count lower.
- Add rest buffers.

Weights:

| Factor | Weight |
| --- | ---: |
| Quality | 25% |
| Group preference match | 20% |
| Comfort | 20% |
| Time-window fit | 15% |
| Distance efficiency | 10% |
| Activity diversity | 5% |
| Weather suitability | 5% |

### Time-Efficient Mode

Goal: maximize worthwhile experiences while minimizing wasted transit and waiting.

Behavior:

- Prefer geographic clusters.
- Start with must-visit anchors.
- Sequence by opening hours and route direction.
- Avoid isolated locations.
- Use tighter schedules with realistic buffers.
- Skip low-value detours.

Weights:

| Factor | Weight |
| --- | ---: |
| Distance efficiency | 30% |
| Time-window fit | 25% |
| Group preference match | 20% |
| Quality | 10% |
| Budget match | 5% |
| Activity diversity | 5% |
| Weather suitability | 5% |

### Fuel-Efficient Mode

Goal: minimize unnecessary driving distance and fuel use.

Behavior:

- Strongly prefer route clustering.
- Avoid backtracking.
- Use one area per half-day.
- Prefer public transit where feasible.
- Choose stays close to activity clusters.
- Penalize faraway attractions unless must-visit.

Weights:

| Factor | Weight |
| --- | ---: |
| Route clustering | 35% |
| Distance efficiency | 25% |
| Group preference match | 15% |
| Time-window fit | 10% |
| Budget match | 5% |
| Activity diversity | 5% |
| Weather suitability | 5% |

## Itinerary Rules Engine

The rules engine prevents AI slop.

It should run before and after LLM generation.

### Daily Structure Rules

MVP defaults:

- Relaxed pace: 2 to 3 activities per day
- Moderate pace: 3 to 5 activities per day
- Packed pace: 5 to 7 activities per day
- At least one meal block for full travel days
- Add buffer time between activities
- Avoid starting before 7:00 AM unless requested
- Avoid ending after 11:00 PM unless nightlife is requested

### Timing Rules

Invalid timing examples:

- Two activities at the same time
- Travel time not accounted for
- Activity scheduled outside opening hours
- Breakfast after lunch
- Outdoor desert or fort visit during unsafe heat when avoidable
- Long-distance travel inserted into a short gap

### Route Rules

WayFinder should:

- Avoid backtracking.
- Cluster activities by area.
- Prefer nearest-next sequencing after anchor activities.
- Treat hotels/stays as daily start and end points when known.
- Penalize isolated candidates.

### Fatigue Rules

Each activity should have a fatigue score:

| Activity Type | Example Fatigue |
| --- | ---: |
| Cafe or restaurant | 5 |
| Museum | 15 |
| Market | 25 |
| Fort or large landmark | 35 |
| Trek/adventure | 55 |
| Long transport segment | 30 |

Daily fatigue limits:

- Relaxed: max 50
- Moderate: max 75
- Packed: max 100
- Luxury: max 55 unless explicitly overridden

### Diversity Rules

A valid day should avoid:

- More than two similar heritage stops in a row
- More than two heavy physical activities in one day
- All outdoor activities during bad weather
- Repeating the same location or activity type too often
- No food/rest breaks across a long day

## Optimization Layer

The optimization layer converts ranked candidates into a draft itinerary.

### Draft Planning Algorithm

```text
1. Select anchor activities:
   - must-visit places
   - highest scoring iconic places
   - time-sensitive activities

2. Place anchors into valid day/time slots:
   - opening hours
   - best time of day
   - weather
   - start/end dates

3. Build route clusters around anchors:
   - nearby cafes
   - nearby viewpoints
   - nearby markets
   - nearby restaurants

4. Fill remaining slots:
   - preserve diversity
   - stay within fatigue limit
   - respect budget and travel limits

5. Sequence each day:
   - morning -> afternoon -> evening
   - minimize travel time
   - include meals and buffers

6. Produce draft plan JSON with selected place IDs.
```

### Optimization Output

The optimization layer should produce machine-readable context for the LLM:

```json
{
  "days": [
    {
      "day": 1,
      "theme": "Forts, old city food, and market evening",
      "selectedItems": [
        {
          "placeId": "amber_fort_jaipur",
          "time": "09:00",
          "durationMinutes": 150,
          "reason": "Must-visit, best in morning, high heritage match."
        }
      ],
      "estimatedTravelMinutes": 75,
      "fatigueScore": 68,
      "budgetEstimate": "mid"
    }
  ]
}
```

## AI Context Assembly Logic

The LLM should receive only the information needed to produce the final structured itinerary.

Do not send:

- Entire database dumps
- Unranked candidate lists
- Sensitive user data
- Raw tokens or internal secrets
- Conflicting instructions from previous generations

Send:

- User trip summary
- Group preference summary
- Hard constraints
- Optimization mode
- Ranked selected places
- Backup candidates
- Required output schema
- Rules the LLM must obey

### LLM Context Packet

```json
{
  "trip": {
    "destination": "Jaipur",
    "days": 3,
    "dates": ["2026-06-12", "2026-06-14"],
    "travelers": 4,
    "pace": "moderate",
    "optimizationMode": "time_efficient"
  },
  "constraints": {
    "mustVisit": ["Amber Fort"],
    "avoid": ["long walking"],
    "maxActivitiesPerDay": 5,
    "maxDailyTravelMinutes": 120
  },
  "selectedPlaces": [
    {
      "placeId": "amber_fort_jaipur",
      "name": "Amber Fort",
      "type": "heritage",
      "scheduledTime": "09:00",
      "durationMinutes": 150,
      "notes": "Best visited in morning."
    }
  ],
  "outputRules": {
    "useOnlyProvidedPlaceIds": true,
    "returnOnlyJson": true,
    "includeValidationMetadata": true
  }
}
```

### LLM Responsibility

The LLM may:

- Write clear titles and descriptions.
- Smooth the day narrative.
- Convert selected places into user-facing itinerary JSON.
- Add short practical notes using supplied context.
- Suggest backup options only from provided backup candidates.

The LLM must not:

- Invent places.
- Invent prices.
- Invent opening hours.
- Change selected place IDs.
- Add unsupported transport claims.
- Ignore hard constraints.

## Structured JSON Generation

The final itinerary should use a stable schema.

MVP shape:

```json
{
  "itineraryId": "generated_id",
  "destination": "Jaipur",
  "optimizationMode": "time_efficient",
  "days": [
    {
      "day": 1,
      "date": "2026-06-12",
      "title": "Forts and Old City Flavors",
      "subtitle": "A compact day around Jaipur's northern and central highlights.",
      "fatigueScore": 68,
      "estimatedTravelMinutes": 75,
      "activities": [
        {
          "placeId": "amber_fort_jaipur",
          "time": "09:00",
          "durationMinutes": 150,
          "title": "Explore Amber Fort",
          "description": "Start early at Amber Fort for cooler weather, heritage views, and strong photo opportunities.",
          "type": "heritage",
          "budgetTier": "mid",
          "source": "retrieved"
        }
      ]
    }
  ],
  "validation": {
    "status": "valid",
    "warnings": []
  },
  "reliability": {
    "confidenceScore": 0.87,
    "groundingStrength": 0.91,
    "retrievalCoverage": 0.78,
    "fallbackUsed": false
  }
}
```

## Confidence and Reliability Metadata

WayFinder should attach confidence metadata to every generated itinerary and, later, to every individual recommendation.

This lets the product handle uncertainty instead of hiding it. A low-confidence trip can show warnings, request more input, use fallback planning, or flag the output for review.

### Reliability Object

```json
{
  "confidenceScore": 0.87,
  "groundingStrength": 0.91,
  "retrievalCoverage": 0.78,
  "rankingConfidence": 0.84,
  "constraintSatisfaction": 0.96,
  "fallbackUsed": false,
  "fallbackReason": null,
  "warnings": []
}
```

### Field Definitions

| Field | Meaning |
| --- | --- |
| `confidenceScore` | Overall confidence that the itinerary is useful, realistic, and aligned with the user intent. |
| `groundingStrength` | How strongly the itinerary is grounded in retrieved place records instead of generic generation. |
| `retrievalCoverage` | Whether retrieval found enough relevant candidates across stays, food, activities, transport, and backups. |
| `rankingConfidence` | How clearly the top-ranked candidates beat weaker alternatives. |
| `constraintSatisfaction` | How well the itinerary satisfies hard and soft constraints after validation. |
| `fallbackUsed` | Whether the system had to relax filters, use generic defaults, or produce a partial itinerary. |
| `fallbackReason` | Why fallback was needed, such as sparse destination data or too many constraints. |
| `warnings` | User-safe warnings that can be shown in the frontend or used for debugging. |

### Scoring Guidance

The overall confidence score should be computed from system signals, not guessed by the LLM.

Recommended MVP formula:

```text
confidenceScore =
  0.30 * groundingStrength +
  0.25 * retrievalCoverage +
  0.20 * constraintSatisfaction +
  0.15 * rankingConfidence +
  0.10 * validationQuality
```

Confidence bands:

| Score | Meaning | Product Behavior |
| --- | --- | --- |
| 0.85 to 1.00 | Strong | Show normally. |
| 0.70 to 0.84 | Usable | Show with light caveats if needed. |
| 0.50 to 0.69 | Weak | Show warnings and suggest refinement. |
| Below 0.50 | Unsafe | Do not present as final; retry or request more input. |

### Example Low-Confidence Warning

```json
{
  "confidenceScore": 0.62,
  "groundingStrength": 0.54,
  "retrievalCoverage": 0.48,
  "fallbackUsed": true,
  "fallbackReason": "Only 4 curated activity records were available for this destination.",
  "warnings": [
    "Some itinerary blocks use general destination guidance because curated data coverage is low."
  ]
}
```

### Why This Matters

Reliability metadata supports:

- Low-confidence warnings
- Fallback itineraries
- Debugging bad recommendations
- Ranking quality evaluation
- A/B testing scoring weights
- Human review queues
- Future model and retrieval benchmarking

## Validation Logic Planning

Validation answers: is this itinerary safe, realistic, grounded, and useful?

Validation should run after LLM output and before saving to the database.

### Invalid Itinerary Conditions

An itinerary is invalid if:

- It includes places not present in the provided context.
- It has missing required fields.
- It has invalid JSON.
- It has fewer or more days than requested.
- It duplicates the same activity without reason.
- It schedules impossible overlaps.
- It exceeds max daily travel time.
- It exceeds max daily fatigue score.
- It violates hard avoid constraints.
- It schedules outdoor-heavy days during bad weather without backups.
- It contains unsupported claims about bookings, exact prices, opening hours, or availability.

### Validation Checks

| Check | Rule | Action |
| --- | --- | --- |
| JSON shape | Must match schema | Retry or repair |
| Day count | Must equal trip duration | Retry |
| Place grounding | Every `placeId` must exist in context | Remove or retry |
| Time order | Activities must be chronological | Repair |
| Duplicate activity | No repeated `placeId` unless intentional | Repair |
| Fatigue | Under pace-specific daily limit | Re-optimize |
| Travel time | Under mode-specific limit | Re-optimize |
| Budget | Within user budget mode | Re-rank |
| Hard constraints | No violations | Reject and retry |

### Retry Strategy

1. Try schema repair for small formatting issues.
2. Retry LLM generation with validation errors included.
3. If still invalid, reduce itinerary complexity.
4. If still invalid, return a safe partial itinerary with warnings.

## Hallucination Prevention Strategy

WayFinder should prevent hallucination by design.

Required rules:

- Use retrieval-grounded context only.
- Require `placeId` for every generated activity.
- Validate every `placeId` against candidate context.
- Keep LLM output schema strict.
- Store source metadata for every recommendation.
- Never ask the LLM to "find places" unless it is explicitly a fallback research mode.
- Separate recommendation scoring from itinerary wording.
- Log validation failures for prompt and ranking improvements.

Prompt rule:

```text
You may only use places, stays, routes, and activities included in the provided context.
If a needed item is missing, return a warning instead of inventing it.
```

## Proposal and Regeneration Logic

Group proposals should not cause a full random rewrite.

Proposal flow:

```text
Proposal submitted
  -> Classify proposal: add, remove, modify, timing, budget, route
  -> Match proposal to target activity or empty itinerary slot
  -> Score impact against constraints
  -> Host approves or group threshold passes
  -> Regenerate affected day only
  -> Validate updated itinerary
```

Proposal impact score:

| Factor | Weight |
| --- | ---: |
| Vote approval | 30% |
| Preference match | 25% |
| Route impact | 20% |
| Budget impact | 10% |
| Timing feasibility | 10% |
| Diversity improvement | 5% |

The system should prefer localized regeneration:

- Replace one activity.
- Re-sequence one day.
- Recalculate route and fatigue.
- Preserve all unaffected days.

## Data Needed For The Engine

WayFinder needs structured records for:

### Places

- `id`
- `name`
- `destination`
- `type`
- `tags`
- `description`
- `coordinates`
- `budgetTier`
- `estimatedCost`
- `durationMinutes`
- `bestTimeOfDay`
- `openingHours`
- `popularityScore`
- `qualityScore`
- `weatherSensitivity`
- `fatigueScore`
- `accessibilityTags`
- `embeddingText`
- `embedding`

### Routes

- `fromPlaceId`
- `toPlaceId`
- `distanceKm`
- `durationMinutes`
- `transportMode`
- `estimatedCost`
- `fuelEstimate`

### User and Group Preferences

- Interests
- Avoids
- Budget range
- Pace
- Travel style
- Accessibility needs
- Vote history
- Proposal history

## Implementation Modules

Recommended backend modules:

```text
server/
  services/
    preferenceExtractionService.js
    constraintAnalysisService.js
    retrievalService.js
    rankingService.js
    optimizationService.js
    contextAssemblyService.js
    itineraryGenerationService.js
    itineraryValidationService.js
    proposalImpactService.js
```

Recommended build order:

1. Define place and itinerary schemas.
2. Build ranking service with mocked candidate data.
3. Build validation service.
4. Build context assembly service.
5. Connect LLM generation to strict JSON schema.
6. Add retrieval with embeddings.
7. Add route/time/fatigue optimization.
8. Add proposal impact scoring and localized regeneration.

## Memory and Preference Learning Layer

This is not MVP-critical, but it is a major future intelligence layer.

WayFinder should eventually learn from repeated user and group behavior. If a user consistently upvotes cafes, scenic viewpoints, relaxed pacing, and low-walking plans, future recommendations should adapt automatically.

### Learning Signals

Useful signals:

- Upvoted proposals
- Downvoted proposals
- Approved itinerary changes
- Removed activities
- Regenerated activities
- Skipped activity types
- Saved trips
- Manual edits
- Time spent viewing recommendations
- Repeated destination or trip-style choices

### Preference Memory Object

```json
{
  "userId": "user_123",
  "learnedPreferences": {
    "cafes": 0.82,
    "scenic_places": 0.76,
    "museums": 0.31,
    "nightlife": 0.22,
    "slow_itineraries": 0.88,
    "public_transport": 0.64
  },
  "confidence": {
    "cafes": 0.74,
    "slow_itineraries": 0.81
  },
  "lastUpdated": "2026-05-15"
}
```

### How Memory Should Affect Ranking

Memory should adjust ranking softly, not override explicit trip input.

```text
final_preference_score =
  0.70 * current_trip_preference_match +
  0.20 * learned_user_preference_match +
  0.10 * group_history_match
```

Hard constraints always win over memory. If the user says "avoid cafes" on a specific trip, the system should obey that even if the user previously liked cafes.

### Group-Level Learning

For recurring groups, WayFinder can learn group patterns:

- This group likes relaxed mornings.
- This group accepts one premium experience per trip.
- This group downvotes nightlife.
- This group prefers scenic food spots over crowded landmarks.

Group memory should only be used when the same members or mostly overlapping members plan together again.

### Privacy and Control

Preference learning should be transparent and controllable:

- Users can reset learned preferences.
- Users can disable memory.
- Sensitive preferences should not be inferred aggressively.
- Memory should explain itself: "Recommended because you often prefer scenic cafes and relaxed pacing."

## MVP Decision Boundaries

For MVP, WayFinder should implement:

- Structured user input
- Basic group preference aggregation
- Curated candidate place records
- Deterministic ranking
- Optimization modes
- Strict LLM JSON output
- Validation before saving
- Proposal approval and localized itinerary updates

Post-MVP:

- Real-time pricing
- Live maps distance matrix
- Weather-aware auto-adjustment
- Hotel and transport booking agents
- Long-term user memory
- Preference learning from votes and edits
- Multi-city planning
- Advanced route optimization

## Core System Rule

WayFinder should always be able to answer:

1. Why was this activity recommended?
2. Why was it placed at this time?
3. What user or group preference caused it?
4. What constraint does it satisfy?
5. What would break if it changed?

If the system cannot answer those questions, the recommendation is not intelligent enough yet.
