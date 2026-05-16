# WayFinder Place Intelligence Layer

Dataset intelligence research and planner stabilization roadmap

Date: 2026-05-17

## Executive Summary

WayFinder's next intelligence jump should come from a richer "Place Intelligence Layer" rather than more frontend work or heavier infrastructure. The current planner already has retrieval, ranking, optimization, validation, graph modeling, and partial regeneration. Its weak output quality now comes from thin place semantics: places do not carry enough meaning about role, geography, pacing, crowd behavior, weather fit, or trip emotion.

The recommended architecture is a two-layer intelligence model:

- Static / semi-static dataset: curated place metadata, categories, locality clusters, trip roles, fatigue, budget, duration, photography value, hidden-gem score, semantic tags, and future embeddings. This is the planner memory.
- Live contextual data: weather, rain probability, AQI, traffic, route delays, opening hours, closures, crowd signals, event context, and surge-like cost signals. This is the planner's situational awareness.

The core shift is from "assign places to days" to "compose a trip using semantic roles, day archetypes, geographic continuity, fatigue pacing, and live constraints."

## Recommended Place Intelligence Schema

Each place should become a metadata-rich planning object, not only a title plus tags.

```json
{
  "placeId": "jaipur_amber_fort",
  "canonicalName": "Amber Fort",
  "aliases": ["Amer Fort"],
  "destination": "Jaipur",
  "country": "India",
  "localityClusterId": "amer_north_jaipur",
  "coordinates": { "lat": 26.9855, "lng": 75.8513 },
  "primaryCategory": "heritage",
  "subcategories": ["fort", "viewpoint", "architecture"],
  "semanticTags": ["rajput history", "palace", "photography", "views"],
  "vibeTags": ["iconic", "grand", "historic", "photogenic"],
  "tripRoles": ["anchor_activity", "exploration_activity"],
  "idealVisitWindows": ["morning"],
  "typicalDurationMinutes": 150,
  "budgetTier": "mid",
  "estimatedCost": { "currency": "INR", "min": 100, "max": 600 },
  "fatigueScore": 55,
  "indoorOutdoor": "mixed",
  "weatherSuitability": {
    "clear": 0.95,
    "hot": 0.55,
    "rain": 0.35
  },
  "crowdProfile": {
    "weekdayMorning": "medium",
    "weekendAfternoon": "high"
  },
  "qualitySignals": {
    "popularityScore": 0.92,
    "hiddenGemScore": 0.18,
    "photographyValue": 0.95,
    "familyFit": 0.82,
    "groupFit": 0.88,
    "nightlifeSuitability": 0.05
  },
  "routing": {
    "routeZone": "north",
    "nearbyPlaceIds": ["jaipur_panna_meena_ka_kund", "jaipur_jaigarh_fort"],
    "backtrackingPenaltyGroup": "amer_cluster"
  },
  "sourceRefs": {
    "googlePlaceId": null,
    "foursquareId": null,
    "openTripMapXid": null,
    "geoapifyPlaceId": null
  },
  "confidence": {
    "metadataCompleteness": 0.82,
    "sourceConfidence": 0.76,
    "lastVerifiedAt": "2026-05-17"
  },
  "embedding": {
    "embeddingText": "Amber Fort is a major historic fort in Jaipur...",
    "embeddingModel": null,
    "embeddingVersion": null,
    "vector": null
  }
}
```

Key design rules:

- Store stable planning semantics locally.
- Store external IDs separately so provider data can be refreshed without replacing WayFinder's canonical place identity.
- Keep `semanticTags`, `vibeTags`, and `tripRoles` separate. Tags describe content; vibes describe experience; roles describe itinerary function.
- Add confidence metadata now so low-quality or stale data can be down-ranked later.

## Activity Taxonomy

The taxonomy should be hierarchical and extensible. This lets ranking enforce diversity at multiple levels.

| Family | Subcategories | Planning Meaning |
| --- | --- | --- |
| heritage | fort, palace, temple, museum, monument, architecture | Strong anchor candidates; usually daytime; often high photography value |
| food | street_food, cafe, fine_dining, local_specialty, brewery | Meal slots and social pacing; should not dominate full days |
| nature | viewpoint, lake, garden, forest, beach, waterfall | Weather-sensitive; useful for morning/evening pacing |
| adventure | trek, snow_activity, water_sport, safari, cycling | High fatigue; needs buffer time and weather checks |
| wellness | spa, hot_spring, yoga, meditation, slow_walk | Recovery roles; useful after dense days |
| shopping | bazaar, local_market, mall, craft_market | Flexible filler; good evening use |
| nightlife | bar, club, live_music, late_food, evening_walk | Evening only; should affect next-day fatigue |
| culture | workshop, performance, gallery, festival, local_experience | High memory value; schedule around timing constraints |
| logistics | hotel, airport, station, transfer, rest_stop | Supports itinerary realism rather than discovery |

Semantic grouping should happen at both exact and family levels. For example, two cafes are duplicates at the exact level, while cafe plus street food are both food-family activities and should be balanced.

## Trip Role System

Trip roles explain why an activity exists in the itinerary.

| Role | Purpose | Rules |
| --- | --- | --- |
| anchor_activity | Main reason to visit a day or locality | 1-2 per full day; requires enough duration and travel buffer |
| filler_activity | Low-risk activity between anchors | Must be near current route; easy to drop during disruptions |
| recovery_activity | Low fatigue decompression | Prefer after high-fatigue or late-night segments |
| arrival_activity | First-day soft landing | Nearby, flexible, low penalty if delayed |
| departure_activity | Last-day safe activity | Near hotel/station/airport; low timing risk |
| social_activity | Group bonding or shared meal | Often evening/food/culture; should match group interests |
| nightlife_activity | Late-day energy peak | Evening only; increases next-morning fatigue penalty |
| exploration_activity | Neighborhood wandering or mixed discovery | Works best inside a locality cluster |
| contingency_activity | Backup for weather/closure/time disruption | Indoor or flexible; should be pre-ranked per destination |

The planner should first decide the role mix for each day, then retrieve places that can satisfy those roles.

## Day Semantics Engine

Day archetypes help the itinerary feel intentional.

| Day Type | Recommended Shape | Constraints |
| --- | --- | --- |
| arrival_day | hotel/check-in, light local walk, relaxed dinner | low fatigue, high flexibility, avoid prepaid distant anchors |
| orientation_day | iconic anchor, local food, market/walk | strong first impression, medium fatigue |
| exploration_day | locality cluster, 1 anchor, 1-2 nearby fillers | minimize backtracking, category diversity |
| adventure_day | high-energy anchor, recovery meal, early finish | weather and travel buffers required |
| culture_day | museum/workshop/performance, heritage/food pairing | opening hours and ticket timing matter |
| social_nightlife_day | slow morning, evening social/nightlife | avoid early heavy next-day plan |
| recovery_day | wellness, cafe, scenic low-effort activities | after high fatigue or late night |
| departure_day | breakfast, nearby flexible activity, transfer | hard stop before departure |

Recommended pacing curve:

- Day 1: low-risk orientation.
- Middle days: strongest anchors and deeper exploration.
- Final day: lighter, flexible, transfer-safe.
- After any high-fatigue day, add either a recovery block or a softer morning.

## Geographic Intelligence Strategy

WayFinder should plan by locality cluster before individual place choice.

Recommended model:

- `localityCluster`: named zone such as "Old Manali", "Amer", "North Goa beaches", or "Jaipur walled city".
- `routeZone`: coarser zone used for day-level planning.
- `nearbyPlaceIds`: curated adjacency for fast local sequencing.
- `travelMatrixCache`: cached travel durations between high-value nodes.
- `backtrackingPenaltyGroup`: detects zig-zag routes.

Core planning rules:

- A normal day should use one primary cluster and at most one adjacent cluster.
- Penalize routes that cross the same city twice in one day.
- Keep high-fatigue or fixed-time anchors early enough to absorb delays.
- Prefer cluster-compatible fillers over globally higher-ranked but distant options.
- Use route matrix APIs only after candidate narrowing to control cost.

## Static vs Live Data Architecture

Static dataset:

- Canonical place identity.
- Activity taxonomy and role metadata.
- Vibe tags and semantic tags.
- Budget tier, duration estimate, fatigue score, photography value.
- Locality clusters and curated adjacency.
- Provider IDs and enrichment provenance.
- Embedding text and future vector fields.

Live context overlay:

- Current and forecast weather.
- Rain probability and temperature risk.
- AQI and pollution risk.
- Opening hours, temporary closures, and holiday schedules.
- Route duration, traffic, and travel delay.
- Local events and crowd pressure.
- Surge-like price signals where available.

Recommended flow:

1. Retrieve candidates from the static WayFinder dataset.
2. Enrich the narrowed candidate set with live context.
3. Re-rank using live suitability and confidence.
4. Validate the final itinerary against timing, geography, budget, fatigue, and availability.
5. Store the generated context snapshot for explainability and regeneration.

## API Ecosystem Comparison

| API | Best Use In WayFinder | Strengths | Cautions |
| --- | --- | --- | --- |
| Google Places API | Production-grade POI enrichment, opening hours, ratings, price level, photos, place identity | Rich global place data and structured fields | Cost and terms require careful caching design; use after candidate narrowing |
| Foursquare Places API | Alternative/complementary POI discovery, categories, photos, tips, local place context | Large POI database and useful place discovery metadata | Pricing/field availability can vary by endpoint and plan |
| OpenTripMap | Bootstrap tourism dataset and attractions | Tourism POIs, hierarchical object types, open-data-friendly caching | Less reliable for commercial venue freshness |
| Geoapify Places | Affordable OSM-based places, categories, conditions, details | Hierarchical categories, conditions like opening hours/accessibility, useful free tier | Quality varies by OSM coverage |
| OpenWeather | Weather, forecast, weather maps, air pollution | Current weather and 5-day/3-hour forecast included in free and paid subscriptions; AQI API available | Forecast depth and One Call features depend on plan |
| WeatherAPI | Weather, 3-day free forecast, AQI, astronomy, location search | Developer-friendly JSON/XML, generous monthly free call volume | Some advanced AQI/pollen/history features are plan-dependent |
| Google Routes API | Production travel time and route matrix | Compute routes and route matrices; strong traffic-aware routing | Paid usage; call only after narrowing candidates |
| Mapbox Directions/Matrix | Routing, travel-time matrix, map stack integration | Directions with traffic-aware profile; Matrix returns durations/distances between points | Matrix billed by elements; traffic availability depends on profile/geography |
| Ticketmaster Discovery API | Ticketed events and venues | Search events, attractions, and venues | Better for concerts/sports than small local events |
| PredictHQ | Demand-aware event context and crowd pressure | Clean enriched event data plus ML features | More useful at scale; subscription coverage matters |

API recommendations for MVP-plus:

- Use Geoapify or OpenTripMap to bootstrap destination seed data.
- Use Google Places selectively for high-confidence enrichment of top places only.
- Use OpenWeather or WeatherAPI for immediate live weather and AQI context.
- Use Mapbox Matrix or Google Routes only after retrieval narrows to the final candidate pool.
- Add Ticketmaster first for public event context; consider PredictHQ later for demand/crowd intelligence.

## Diversity and Quality Rules

Minimum viable rules:

- Max 1 cafe-only activity per day unless the user explicitly requests cafe hopping.
- Max 2 food-family activities per day excluding required meals.
- Minimum 1 anchor activity per full exploration day.
- No nightlife before evening.
- No high-fatigue activity immediately after late nightlife.
- No more than 1 distant cluster jump per day.
- Avoid repeating the same exact subcategory in adjacent slots.
- Add a recovery block if daily fatigue exceeds threshold.
- Require weather-safe alternatives for outdoor anchors during rain risk.
- Prefer hidden gems as fillers, not as the only anchor, unless confidence is high.
- Keep departure-day activities within a safe transfer radius.

Ranking should include a diversity penalty:

```text
finalScore =
  semanticMatch * 0.22 +
  roleFit * 0.18 +
  localityFit * 0.16 +
  budgetFit * 0.12 +
  timeWindowFit * 0.10 +
  fatigueFit * 0.08 +
  qualitySignals * 0.08 +
  liveContextFit * 0.04 +
  confidence * 0.02 -
  repetitionPenalty -
  backtrackingPenalty
```

## Embedding-Ready Retrieval Design

The schema should be ready for hybrid retrieval without requiring embeddings today.

Add these fields early:

- `embeddingText`: a normalized natural-language description of place meaning.
- `embeddingVector`: nullable until vector search exists.
- `embeddingVersion`: model/version used.
- `semanticFacets`: compact facets for deterministic filtering.
- `sourceConfidence`: confidence score per provider.
- `lastEnrichedAt`: refresh planning.

Recommended future retrieval flow:

1. Hard filters: destination, open/available status, budget, time window, basic safety.
2. Sparse semantic retrieval: tags, taxonomy, synonyms, fuzzy matching.
3. Vector retrieval: compare user intent to `embeddingText`.
4. Hybrid merge: combine deterministic and vector candidates.
5. Role-aware ranking: choose places by day role, not just user interest.
6. Context overlay: re-rank with live weather/traffic/opening-hours data.
7. Diversity pass: enforce category, cluster, fatigue, and pacing rules.

## Planner Intelligence Roadmap

Phase 1 - Data foundation:

- Add the full place schema.
- Curate 50-200 high-quality places per supported destination.
- Add locality clusters and trip roles manually for seed cities.
- Add confidence metadata and source IDs.

Phase 2 - Enrichment:

- Add provider enrichment jobs for Geoapify/OpenTripMap and selective Google Places.
- Cache provider responses according to terms.
- Add live weather/AQI and route duration overlays.

Phase 3 - Semantics:

- Add day archetype selection before candidate retrieval.
- Add role-first retrieval.
- Add diversity and fatigue constraints in ranking.

Phase 4 - Hybrid retrieval:

- Add embeddings for `embeddingText`.
- Blend vector retrieval with deterministic filters.
- Track retrieval coverage and candidate exhaustion.

Phase 5 - Adaptive intelligence:

- Add preference memory from user edits, upvotes, skips, and regeneration requests.
- Use user and group preference profiles to adjust weights.
- Add low-confidence warnings and fallback itineraries.

## Source Notes

- Google Places API supports field masks for Place Details, Text Search, and Nearby Search; fields include location, opening hours, price level, ratings, photos, and related place metadata depending on SKU and API surface: https://developers.google.com/maps/documentation/places/web-service/data-fields
- Google Routes API provides route and route-matrix methods for distances and routes: https://developers.google.com/maps/documentation/routes/reference/rest
- Foursquare Places API supports place discovery and nearby/contextual POI workflows: https://docs.foursquare.com/developer/reference/places-api-overview
- OpenTripMap is based on open data sources including OpenStreetMap, Wikidata, and Wikipedia; it supports place lists, details, autosuggest, and geocoding: https://dev.opentripmap.org/product
- Geoapify Places API supports hierarchical categories and conditions such as opening hours and accessibility; its free plan currently offers 3,000 credits/day: https://apidocs.geoapify.com/docs/places/
- OpenWeather provides current weather, forecast, and air pollution APIs; current weather, 5-day/3-hour forecast, and Air Pollution API are listed as included in free and paid subscriptions: https://openweathermap.org/api
- WeatherAPI provides weather and geolocation APIs, including AQI fields via `aqi=yes`; its free plan currently lists 100K calls/month and 3-day forecast: https://www.weatherapi.com/docs/
- Mapbox Directions supports driving, walking, cycling, and traffic-aware driving profiles; Mapbox Matrix returns travel times/distances between points and bills by matrix elements: https://docs.mapbox.com/api/navigation/directions/ and https://docs.mapbox.com/api/navigation/matrix/
- Ticketmaster Discovery API supports event, attraction, and venue search: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
- PredictHQ provides event, feature, forecast, and filtering APIs for real-world demand intelligence: https://docs.predicthq.com/api
