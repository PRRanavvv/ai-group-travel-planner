# Mock AI Pipeline

This folder is a local, dependency-free prototype of the WayFinder recommendation pipeline.

It turns a simple trip request into a grounded itinerary by running:

```text
input
  -> retrieve mock candidate places
  -> score candidates
  -> optimize sequencing
  -> generate structured itinerary JSON
  -> validate output
```

## Run

From the repo root:

```bash
node mock_ai_pipeline/runMockPipeline.js
```

Named demos:

```bash
node mock_ai_pipeline/runMockPipeline.js jaipur
node mock_ai_pipeline/runMockPipeline.js goa
node mock_ai_pipeline/runMockPipeline.js manali
```

Default demo input:

```json
{
  "destination": "Jaipur",
  "days": 3,
  "budget": "balanced",
  "interests": ["heritage", "food"]
}
```

You can also pass JSON:

```bash
node mock_ai_pipeline/runMockPipeline.js "{\"destination\":\"Goa\",\"days\":2,\"budget\":\"cheapest\",\"interests\":[\"beaches\",\"food\"]}"
```

## Why This Exists

The goal is to test WayFinder's decision logic before heavy implementation:

- Does retrieval return useful candidates?
- Do scores match the intended product behavior?
- Does sequencing avoid obvious itinerary mistakes?
- Does the final JSON match the product schema?
- Do validation errors reveal weak planning logic early?
