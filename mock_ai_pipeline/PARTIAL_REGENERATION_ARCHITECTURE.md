# Partial Regeneration Architecture

## Purpose

The partial regeneration engine lets WayFinder update only the affected section of an itinerary instead of rebuilding the whole trip.

The goal is collaborative planning behavior:

- preserve stable parts of the itinerary
- respect locked activities
- recompute only impacted sections
- explain what changed and why
- measure how disruptive the edit was

This is a local prototype, but the module boundaries are designed so the same ideas can later move into the backend service layer.

## Folder Structure

```text
mock_ai_pipeline/
  runPartialRegenerationScenarios.js
  src/
    partialRegeneration/
      itineraryGraph.js
      impactAnalysis.js
      partialRegenerationEngine.js
      stabilityScoring.js
```

Supporting shared modules:

```text
src/retrieveCandidates.js
src/scoreCandidates.js
src/validateItinerary.js
src/utils.js
```

The partial engine intentionally reuses retrieval, ranking, and validation instead of creating a separate planning stack.

## Core Interfaces

### Operation

```json
{
  "type": "replaceActivity",
  "activityId": "jaipur_lassiwala",
  "replacementInterests": ["museum", "heritage", "indoor"],
  "reason": "User wants a more cultural indoor stop."
}
```

Supported operation types:

- `replaceActivity`
- `regenerateDay`
- `reoptimizeSegment`
- `updateConstraint`
- `weatherDisruption`
- `openingHoursConflict`
- `travelDelay`

### Partial Regeneration Result

```json
{
  "operation": {},
  "updatedItinerary": {},
  "impact": {},
  "stability": {},
  "explanation": {
    "changeReason": "Rain makes the outdoor evening viewpoint unsuitable.",
    "preserved": ["jaipur_city_palace", "jaipur_laxmi_mishthan_bhandar"],
    "recomputed": ["jaipur_albert_hall"],
    "constraintsTriggered": ["weather"],
    "changeLog": []
  }
}
```

## Regeneration Orchestration Flow

```text
Existing itinerary
  -> Build itinerary graph
  -> Analyze operation impact
  -> Identify affected nodes and constraints
  -> Preserve locked and unaffected nodes
  -> Rerun retrieval only for impacted replacement scopes
  -> Rerun ranking only for impacted candidates
  -> Apply localized replacement or timing shift
  -> Recompute affected day stats
  -> Validate updated itinerary
  -> Score stability
  -> Return explanation trace
```

## Dependency Graph Logic

The graph model represents itinerary elements as nodes:

- day nodes
- activity nodes
- hotel placeholder nodes
- budget constraint node
- time-window constraint nodes
- weather constraint nodes

Edges represent dependencies:

- `contains`: day contains activity
- `sequence`: one node depends on previous node and travel duration
- `constraint`: activity depends on budget, time, or weather

Example:

```text
hotel:day:1:start -> jaipur_city_palace -> jaipur_laxmi_mishthan_bhandar -> jaipur_nahargarh_fort -> hotel:day:1:end
constraint:budget -> jaipur_city_palace
constraint:time:morning -> jaipur_city_palace
constraint:weather:evening -> jaipur_nahargarh_fort
```

## Impact Analysis

Impact analysis determines:

- affected activity nodes
- affected day IDs
- locked nodes
- preserved nodes
- constraints triggered
- which pipeline scopes need recomputation

Example impact output:

```json
{
  "affectedNodeIds": ["jaipur_nahargarh_fort"],
  "affectedDayIds": [1],
  "affectedConstraints": ["weather"],
  "recomputeScopes": {
    "retrieval": true,
    "ranking": true,
    "optimization": [1],
    "validation": [1],
    "fullItinerary": false
  }
}
```

## Preservation Logic

The engine preserves:

- activities not in the affected node set
- locked activities
- unaffected days
- existing activity timing where possible
- existing day structure where possible
- itinerary input preferences
- previously valid constraints unless directly changed

Locked activities are never replaced by the partial engine.

## Localized Reoptimization

The current prototype supports lightweight local reoptimization:

- `replaceActivity`: replaces one activity while preserving the slot and time
- `regenerateDay`: replaces only unlocked activities on the target day
- `reoptimizeSegment`: replaces activities inside a scoped day/slot segment
- `updateConstraint`: replaces activities violating the changed constraint
- `weatherDisruption`: replaces weather-sensitive impacted activities
- `openingHoursConflict`: replaces the unavailable activity
- `travelDelay`: shifts downstream activities in the affected day

Retrieval and ranking run only for affected replacement scopes.

## Stability Scoring

Stability scoring measures how much of the original itinerary survived.

Metrics:

- `preservedActivitiesPct`
- `preservedTimingPct`
- `preservedRoutePct`
- `budgetDelta`
- `budgetDeltaPct`
- `preferenceRetentionPct`
- `overall`

The overall score is weighted:

```text
overall =
  preservedActivities * 0.35 +
  preservedTimings * 0.25 +
  preservedRoute * 0.20 +
  budgetStability * 0.10 +
  preferenceRetention * 0.10
```

Small edits should produce high stability. Full day changes should produce lower but still explainable stability.

## Example Workflows

### Replace One Activity

```text
replaceActivity(activityId)
  -> impact target activity and route neighbors
  -> retrieve replacement candidates
  -> rank candidates
  -> replace only the target
  -> validate affected day
```

### Weather Disruption

```text
weatherDisruption(day, slot)
  -> find outdoor or mixed activities in that slot
  -> retrieve indoor or weather-safe alternatives
  -> replace impacted activities
  -> preserve unaffected day sections
```

### Travel Delay

```text
travelDelay(activityId, delayMinutes)
  -> identify downstream activities on same day
  -> shift downstream times
  -> validate timing order
```

### Locked Activity Preservation

```text
regenerateDay(day)
  -> find all day activities
  -> skip locked nodes
  -> regenerate only unlocked activities
```

## Suggested Data Models

### Activity Node

```json
{
  "id": "jaipur_amber_fort",
  "type": "activity",
  "day": 2,
  "slot": "morning",
  "locked": true,
  "activity": {}
}
```

### Dependency Edge

```json
{
  "from": "jaipur_city_palace",
  "to": "jaipur_laxmi_mishthan_bhandar",
  "type": "sequence",
  "day": 1,
  "reason": "Lunch timing depends on previous activity and travel duration."
}
```

### Regeneration Metadata

```json
{
  "recomputed": true,
  "previousPlaceId": "jaipur_lassiwala",
  "preservedTime": "01:30 PM",
  "preservedSlot": "afternoon",
  "affectedConstraints": ["activity_selection"]
}
```

## Implementation Plan

1. Keep graph construction dependency-free and deterministic.
2. Add real coordinates and transport nodes when map data becomes available.
3. Replace placeholder hotel nodes with actual stay records.
4. Add constraint propagation for opening hours, weather, and reservations.
5. Add embedding-based retrieval behind the same `retrieveCandidates` interface.
6. Add collaborative operation metadata: user ID, vote threshold, approval state.
7. Store stability and explanation traces for evaluation.

## Test Strategy

The local runner covers:

- single activity replacement
- budget adjustment
- weather disruption
- opening-hours conflict
- travel delay
- locked activities preservation

Run:

```bash
node mock_ai_pipeline/runPartialRegenerationScenarios.js
```

Expected behavior:

- every scenario returns a valid itinerary
- locked activities are preserved
- affected day count stays localized
- stability score remains high for small edits
- explanations list changed, preserved, recomputed, and triggered constraints

## Future-Ready Design

This design can later support:

- collaborative multi-user planning
- real-time edits
- AI memory and personalization
- constraint propagation
- embeddings-based retrieval
- live route recalculation
- reservation-aware schedule locking

Embeddings are intentionally not implemented in this upgrade.
