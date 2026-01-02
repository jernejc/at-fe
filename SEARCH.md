# Search API Documentation

This document covers the search functionality in at-data, including both the simple REST endpoint and the advanced WebSocket-based agentic search.

## Overview

at-data provides two search interfaces:

| Endpoint | Type | Use Case |
|----------|------|----------|
| `GET /api/v1/search` | REST | Simple keyword/semantic search |
| `WS /ws/search` | WebSocket | Agentic NL search with streaming results |

Both interfaces search across **companies** and **partners** using a combination of:
- **Keyword matching** via PostgreSQL full-text search on `company_search_mv` and `partner_search_mv`
- **Semantic search** via pgvector embeddings (1536-dim, cosine similarity)
- **Hybrid scoring**: 60% vector score + 40% keyword score

---

## Simple REST Search (`/api/v1/search`)

Basic search endpoint for quick lookups without streaming or LLM interpretation.

### Request

```http
GET /api/v1/search?q={query}&entity_type={type}&limit={n}&semantic={bool}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | required | Search query (min 2 chars) |
| `entity_type` | string | `company` | One of: `company`, `employee`, `partner`, `all` |
| `limit` | int | 20 | Max results per entity type (1-100) |
| `semantic` | bool | false | Generate embedding for hybrid vector+keyword search |

### Response

```json
{
  "query": "restaurant technology",
  "total_results": 5,
  "companies": [
    {
      "id": 1,
      "domain": "partech.com",
      "name": "PAR Technology",
      "status": "active"
    }
  ],
  "employees": [],
  "partners": [
    {
      "id": 3,
      "name": "RetailEdge Consulting",
      "slug": "retailedge-consulting",
      "website": "https://retailedge.example.com",
      "status": "active"
    }
  ]
}
```

### Example

```bash
# Basic keyword search
curl "http://localhost:8000/api/v1/search?q=AI+automation&limit=5"

# Semantic search for partners
curl "http://localhost:8000/api/v1/search?q=healthcare+compliance&entity_type=partner&semantic=true"

# Search all entities
curl "http://localhost:8000/api/v1/search?q=fintech&entity_type=all&limit=10"
```

---

## Agentic WebSocket Search (`/ws/search`)

Advanced streaming search powered by LLM query interpretation, real-time results, and AI-generated insights.

### Connection

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/search");
```

### Request Format

Send JSON messages after connection:

```json
{
  "query": "restaurant point of sale systems",
  "entity_types": ["companies", "partners"],
  "limit": 10,
  "include_partner_suggestions": true,
  "partner_suggestion_limit": 5,
  "context": {},
  "request_id": "optional-tracking-id"
}
```

### Request Parameters

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `query` | string | required | Natural language search query |
| `entity_types` | string[] | `["companies"]` | Entity types: `companies`, `partners`, or both |
| `limit` | int | 20 | Max results (1-100) |
| `include_partner_suggestions` | bool | true | Suggest partners based on company interests |
| `partner_suggestion_limit` | int | 5 | Max partner suggestions |
| `context` | object | {} | Additional context for query interpretation |
| `request_id` | string | auto | Client-provided ID for request tracking |

### Response Stream

The WebSocket streams multiple message types as the search progresses:

#### Message Types

| Type | Description |
|------|-------------|
| `ack` | Request acknowledged, processing started |
| `result` | Search phase update or individual result |
| `error` | Error occurred during search |
| `complete` | Search finished with summary |

#### Search Phases (in `result` messages)

```
ack → interpreting → searching → ranking → results → suggesting → insights → complete
```

| Phase | Description | Payload Fields |
|-------|-------------|----------------|
| `interpreting` | LLM parsing query intent | `interpretation`, `partial` (streaming) |
| `searching` | Generating embedding, querying index | `message` |
| `ranking` | Scoring and ordering results | `message` (candidate count) |
| `results` | Individual result items | `company` or `partner` object |
| `suggesting` | Finding partner recommendations | `message` |
| `partner_suggestion` | Individual partner suggestion | `partner` object with match details |
| `suggestions_complete` | Partner suggestions finished | `count`, `based_on_interests` |
| `insights` | AI-generated observations | `insights` object |

### Interpretation Object

Returned during `interpreting` phase:

```json
{
  "intent": "Find companies providing POS solutions for restaurants",
  "semantic_query": "restaurant point of sale payment processing",
  "keywords": ["restaurant", "POS", "payments"],
  "filters": {},
  "suggested_queries": ["restaurant management software", "hospitality tech"],
  "feedback": {}
}
```

### Company Result Object

```json
{
  "entity_type": "company",
  "company_id": 1,
  "domain": "partech.com",
  "name": "PAR Technology",
  "description": "Restaurant technology and POS solutions",
  "match_score": 0.81,
  "vector_score": 0.85,
  "keyword_score": 0.75,
  "match_reasons": ["interest_signals", "keyword_match"],
  "top_interests": [
    {"category": "fintech", "strength": 0.9, "contributors": 5}
  ],
  "key_employees": ["John Doe - CTO", "Jane Smith - VP Engineering"]
}
```

### Partner Result Object

```json
{
  "entity_type": "partner",
  "partner_id": 3,
  "slug": "fintech-forward",
  "name": "FinTech Forward",
  "description": "Payment processing specialists",
  "website": "https://fintechforward.example.com",
  "match_score": 0.78,
  "vector_score": 0.80,
  "keyword_score": 0.74,
  "contact_name": "Alice Johnson",
  "contact_email": "alice@fintechforward.example.com"
}
```

### Partner Suggestion Object

Generated when `include_partner_suggestions=true` and company results have interests:

```json
{
  "partner_id": 5,
  "slug": "securefirst-consulting",
  "name": "SecureFirst Consulting",
  "description": "Security and compliance experts",
  "match_score": 1.95,
  "interest_coverage": 0.40,
  "matched_interests": [
    {
      "interest": "security_compliance",
      "partner_weight": 0.95,
      "interest_importance": 1.0,
      "contribution": 0.95,
      "reasoning": "SOC2 and PCI-DSS certified",
      "certifications": ["SOC2", "PCI-DSS"]
    }
  ]
}
```

### Insights Object

```json
{
  "observation": "The search identified PAR Technology as a key player...",
  "insight": "Companies in this space prioritize security compliance.",
  "suggested_queries": ["restaurant inventory management", "kitchen display systems"],
  "refinement_tips": ["Try filtering by company size", "Add geographic constraints"]
}
```

### Complete Message

Final summary when search finishes:

```json
{
  "type": "complete",
  "request_id": "abc123",
  "total_results": 3,
  "partner_results": 5,
  "partner_suggestions": [/* full list */],
  "partner_suggestion_summary": {
    "count": 3,
    "based_on_interests": [
      {"interest": "security_compliance", "frequency": 2},
      {"interest": "fintech", "frequency": 1}
    ]
  },
  "search_time_ms": 12500,
  "observation": "...",
  "suggested_queries": ["..."],
  "refinement_tips": ["..."]
}
```

### JavaScript Client Example

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/search");

ws.onopen = () => {
  ws.send(JSON.stringify({
    query: "AI automation cloud infrastructure",
    entity_types: ["companies", "partners"],
    include_partner_suggestions: true,
    limit: 10
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "ack":
      console.log("Search started:", data.request_id);
      break;

    case "result":
      if (data.phase === "results") {
        if (data.company) console.log("Company:", data.company.name);
        if (data.partner) console.log("Partner:", data.partner.name);
      } else if (data.phase === "partner_suggestion") {
        console.log("Suggested:", data.partner.name, "score:", data.partner.match_score);
      } else if (data.phase === "insights") {
        console.log("Insight:", data.insights.observation);
      }
      break;

    case "complete":
      console.log(`Found ${data.total_results} companies, ${data.partner_results} partners`);
      console.log(`${data.partner_suggestions.length} partner suggestions`);
      console.log(`Search took ${data.search_time_ms}ms`);
      break;

    case "error":
      console.error("Search failed:", data.message);
      break;
  }
};
```

### Python Client Example

```python
import asyncio
import json
import websockets

async def search(query: str, entity_types: list[str] = None):
    async with websockets.connect("ws://localhost:8000/ws/search") as ws:
        await ws.send(json.dumps({
            "query": query,
            "entity_types": entity_types or ["companies", "partners"],
            "include_partner_suggestions": True,
            "limit": 10
        }))

        async for message in ws:
            data = json.loads(message)

            if data["type"] == "complete":
                print(f"Found {data['total_results']} results in {data['search_time_ms']}ms")
                break
            elif data["type"] == "result" and data.get("phase") == "results":
                entity = data.get("company") or data.get("partner")
                print(f"  - {entity['name']} (score: {entity['match_score']:.2f})")

asyncio.run(search("healthcare compliance HIPAA"))
```

---

## Partner Suggestion Algorithm

When `include_partner_suggestions=true` and company results are found:

1. **Interest Extraction**: Collects `top_interests` from all company results
2. **Frequency Weighting**: More frequent interests get higher weight
3. **Partner Matching**: Finds partners whose `interest_weights` overlap
4. **Scoring Formula**:
   ```
   match_score = Σ (partner_weight × interest_importance)
   interest_coverage = matched_interests / total_search_interests
   ```
5. **Ranking**: Partners sorted by `match_score` descending

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
     ▼                         ▼
┌─────────────┐         ┌─────────────────┐
│ REST Search │         │ WebSocket Search│
│ /api/v1/... │         │ /ws/search      │
└──────┬──────┘         └────────┬────────┘
       │                         │
       │                         ▼
       │                ┌─────────────────┐
       │                │  NLSearchAgent  │
       │                │  (Gemini Flash) │
       │                └────────┬────────┘
       │                         │
       └────────────┬────────────┘
                    ▼
          ┌─────────────────────┐
          │   SearchService     │
          │  (Hybrid Search)    │
          └─────────┬───────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
┌─────────┐  ┌───────────┐  ┌─────────────┐
│Embedding│  │ Keyword   │  │ Partner     │
│ Service │  │ Search    │  │ Matching    │
│(Azure)  │  │ (pg_trgm) │  │ Service     │
└────┬────┘  └─────┬─────┘  └──────┬──────┘
     │             │               │
     └──────┬──────┴───────────────┘
            ▼
     ┌─────────────────┐
     │   PostgreSQL    │
     │  (pgvector +    │
     │   materialized  │
     │   views)        │
     └─────────────────┘
```

---

## Configuration

Environment variables affecting search:

| Variable | Default | Description |
|----------|---------|-------------|
| `SEARCH_DEFAULT_LIMIT` | 20 | Default result limit |
| `SEARCH_MAX_LIMIT` | 100 | Maximum allowed limit |
| `AZURE_OPENAI_EMBEDDING_*` | - | Embedding model config |
| `GEMINI_API_KEY` | - | For NL query interpretation |

---

## Materialized Views

Search uses pre-computed materialized views for performance:

### `company_search_mv`
- Aggregates company data with employees, jobs, signals
- Includes `search_text` for full-text search
- Pre-computed `top_interests`, `top_events` for filtering
- Refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY company_search_mv`

### `partner_search_mv`
- Aggregates partner data with interest weights
- Includes `search_text` from name, description, interests
- Pre-computed `top_interests` (weights >= 0.7)
- Refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY partner_search_mv`

Refresh views after data changes for search to reflect updates.
