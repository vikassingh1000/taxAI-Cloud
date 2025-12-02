# Tax Alert API Documentation

Complete API reference for tax alert ingestion and retrieval endpoints.

---

## Base URL

```
http://localhost:3000/api/tax-alerts
```

---

## Authentication

Currently no authentication required. Add authentication middleware as needed in production.

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ingest` | Ingest single tax notification |
| POST | `/ingest/batch` | Ingest multiple notifications |
| GET | `/` | Get all alerts (with filtering) |
| GET | `/:id` | Get alert by ID |
| GET | `/search/:keyword` | Search alerts by keyword |
| GET | `/meta/stats` | Get database statistics |

---

## 1. Ingest Single Tax Notification

**Endpoint:** `POST /api/tax-alerts/ingest`

**Description:** Extract structured data from tax notification text using AI and save to database.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "text": "DEPARTMENT OF THE TREASURY...",
  "sourceDocument": "IRS-Notice-2024-45.pdf",
  "saveSourceText": false,
  "minConfidence": 0.7
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | ✅ Yes | Tax notification text (min 50 chars) |
| `sourceDocument` | string | ❌ No | Source filename or reference |
| `saveSourceText` | boolean | ❌ No | Store original text in DB (default: false) |
| `minConfidence` | number | ❌ No | Minimum confidence threshold 0-1 (default: 0) |

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Tax alert ingested successfully",
  "alert": {
    "id": 42,
    "country": "US",
    "taxType": "GILTI",
    "priority": "HIGH",
    "title": "Guidance on Global Intangible Low-Taxed Income",
    "summary": "IRS provides updated guidance...",
    "keyChanges": [
      "Oil & gas extraction income treated as tested income",
      "Depreciation deductions allowed in full"
    ],
    "affectedEntities": [
      "Oil & Gas Companies",
      "US Shareholders of CFCs"
    ],
    "bpSpecificImpact": "This affects BP's US upstream operations...",
    "requiredActions": [
      "Update Form 8992 calculations",
      "Review CFC income classifications"
    ],
    "complianceRisk": "HIGH",
    "estimatedDeadline": "2025-01-31",
    "overallConfidence": 0.94,
    "classificationConfidence": 0.96,
    "interpretationConfidence": 0.92,
    "confidenceNotes": null,
    "sourceLength": 2372,
    "modelUsed": "claude-sonnet-4-20250514",
    "extractedAt": "2025-11-13T20:00:00.000Z",
    "createdAt": "2025-11-13T20:00:01.000Z",
    "updatedAt": "2025-11-13T20:00:01.000Z",
    "sourceDocument": "IRS-Notice-2024-45.pdf",
    "sourceText": null
  },
  "confidence": 0.94,
  "warnings": []
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Text is too short. Minimum 50 characters required.",
  "message": "Failed to ingest tax alert"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "text",
      "message": "Text must be at least 50 characters"
    }
  ]
}
```

### Example Request

```bash
curl -X POST http://localhost:3000/api/tax-alerts/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "DEPARTMENT OF THE TREASURY\nINTERNAL REVENUE SERVICE\nWashington, DC 20224\n\nNotice 2024-45...",
    "sourceDocument": "IRS-Notice-2024-45.pdf",
    "minConfidence": 0.75
  }'
```

---

## 2. Ingest Batch

**Endpoint:** `POST /api/tax-alerts/ingest/batch`

**Description:** Ingest multiple tax notifications in one request.

### Request

**Body:**
```json
{
  "texts": [
    "First tax notification text...",
    "Second tax notification text..."
  ],
  "saveSourceText": false,
  "minConfidence": 0.7
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `texts` | string[] | ✅ Yes | Array of tax notification texts (min 1, max 20) |
| `saveSourceText` | boolean | ❌ No | Store original texts in DB (default: false) |
| `minConfidence` | number | ❌ No | Minimum confidence threshold 0-1 (default: 0) |

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Batch ingestion complete: 2 successful, 0 failed",
  "results": [
    {
      "success": true,
      "alert": {
        "id": 1,
        "country": "US",
        "priority": "HIGH",
        "title": "Guidance on GILTI"
      },
      "confidence": 0.94
    },
    {
      "success": true,
      "alert": {
        "id": 2,
        "country": "UK",
        "priority": "CRITICAL",
        "title": "Energy Profits Levy Extension"
      },
      "confidence": 0.91
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  }
}
```

### Example Request

```bash
curl -X POST http://localhost:3000/api/tax-alerts/ingest/batch \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "First notification text...",
      "Second notification text..."
    ],
    "minConfidence": 0.8
  }'
```

---

## 3. Get All Alerts

**Endpoint:** `GET /api/tax-alerts`

**Description:** Get all tax alerts with optional filtering.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country` | string | ❌ No | Filter by country: US, UK, EU, OTHER |
| `priority` | string | ❌ No | Filter by priority: CRITICAL, HIGH, MEDIUM, LOW |
| `taxType` | string | ❌ No | Filter by tax type: GILTI, Corporate Tax, etc. |
| `minConfidence` | number | ❌ No | Minimum confidence score 0-1 |
| `limit` | number | ❌ No | Max results (1-1000, default: 100) |
| `offset` | number | ❌ No | Pagination offset (default: 0) |

### Response

**Success (200):**
```json
{
  "success": true,
  "alerts": [
    {
      "id": 1,
      "country": "US",
      "taxType": "GILTI",
      "priority": "HIGH",
      "title": "Guidance on GILTI",
      "summary": "IRS provides...",
      "overallConfidence": 0.94,
      "extractedAt": "2025-11-13T20:00:00.000Z"
    }
  ],
  "count": 1,
  "limit": 100,
  "offset": 0
}
```

### Example Requests

```bash
# Get all alerts
curl http://localhost:3000/api/tax-alerts

# Get US alerts only
curl "http://localhost:3000/api/tax-alerts?country=US"

# Get critical alerts
curl "http://localhost:3000/api/tax-alerts?priority=CRITICAL"

# Get high-confidence alerts
curl "http://localhost:3000/api/tax-alerts?minConfidence=0.9"

# Pagination
curl "http://localhost:3000/api/tax-alerts?limit=10&offset=20"
```

---

## 4. Get Alert by ID

**Endpoint:** `GET /api/tax-alerts/:id`

**Description:** Get a single tax alert by its database ID.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | ✅ Yes | Alert ID (path parameter) |

### Response

**Success (200):**
```json
{
  "success": true,
  "alert": {
    "id": 1,
    "country": "US",
    "taxType": "GILTI",
    "priority": "HIGH",
    "title": "Guidance on GILTI",
    "summary": "IRS provides...",
    "keyChanges": [...],
    "affectedEntities": [...],
    "bpSpecificImpact": "...",
    "requiredActions": [...],
    "complianceRisk": "HIGH",
    "estimatedDeadline": "2025-01-31",
    "overallConfidence": 0.94,
    "classificationConfidence": 0.96,
    "interpretationConfidence": 0.92,
    "sourceLength": 2372,
    "modelUsed": "claude-sonnet-4-20250514",
    "extractedAt": "2025-11-13T20:00:00.000Z",
    "createdAt": "2025-11-13T20:00:01.000Z",
    "updatedAt": "2025-11-13T20:00:01.000Z",
    "sourceDocument": "IRS-Notice-2024-45.pdf"
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Alert not found"
}
```

### Example Request

```bash
curl http://localhost:3000/api/tax-alerts/1
```

---

## 5. Search Alerts

**Endpoint:** `GET /api/tax-alerts/search/:keyword`

**Description:** Search alerts by keyword in title or summary.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | ✅ Yes | Search keyword (path parameter) |
| `limit` | number | ❌ No | Max results (query parameter, default: 100) |

### Response

**Success (200):**
```json
{
  "success": true,
  "keyword": "GILTI",
  "alerts": [
    {
      "id": 1,
      "country": "US",
      "title": "Guidance on GILTI",
      "summary": "IRS provides updated GILTI guidance..."
    }
  ],
  "count": 1
}
```

### Example Requests

```bash
# Search for GILTI
curl http://localhost:3000/api/tax-alerts/search/GILTI

# Search with limit
curl "http://localhost:3000/api/tax-alerts/search/GILTI?limit=10"

# Search for Energy
curl http://localhost:3000/api/tax-alerts/search/Energy
```

---

## 6. Get Statistics

**Endpoint:** `GET /api/tax-alerts/meta/stats`

**Description:** Get database statistics and aggregations.

### Response

**Success (200):**
```json
{
  "success": true,
  "stats": {
    "total": 42,
    "byCountry": {
      "US": 20,
      "UK": 15,
      "EU": 5,
      "OTHER": 2
    },
    "byPriority": {
      "CRITICAL": 5,
      "HIGH": 15,
      "MEDIUM": 18,
      "LOW": 4
    },
    "byTaxType": {
      "GILTI": 8,
      "Corporate Tax": 12,
      "VAT": 6,
      "Energy Tax": 10,
      "Other": 6
    },
    "avgConfidence": 0.87
  }
}
```

### Example Request

```bash
curl http://localhost:3000/api/tax-alerts/meta/stats
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "text",
      "message": "Text must be at least 50 characters"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Alert not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message (development only)"
}
```

---

## Rate Limiting

Currently no rate limiting. Consider adding for production:
- 100 requests per minute per IP for single ingestion
- 10 requests per minute per IP for batch ingestion
- 1000 requests per minute per IP for read endpoints

---

## Performance

**Single Ingestion:**
- Average: 5-8 seconds (depends on AI processing)
- Cost: ~$0.02 per document (Claude Sonnet 4)

**Batch Ingestion:**
- Sequential processing: ~6 seconds per document
- 10 documents: ~60 seconds total

**Read Operations:**
- Database queries: <1ms (indexed)

---

## Data Flow

```
Client Request
    ↓
POST /api/tax-alerts/ingest
    ↓
Validation (Zod schema)
    ↓
TaxAlertIngestionService.ingest()
    ├─ AI Extraction (Claude Sonnet 4)
    ├─ Confidence Check
    └─ Database Save
    ↓
Response with saved alert
```

---

## Example Workflow

### Complete Ingestion Flow

```javascript
// 1. Ingest a tax notification
const response = await fetch('http://localhost:3000/api/tax-alerts/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: taxNotificationText,
    sourceDocument: 'IRS-Notice-2024-45.pdf',
    minConfidence: 0.75
  })
});

const result = await response.json();
console.log('Saved alert ID:', result.alert.id);

// 2. Get the saved alert
const alertResponse = await fetch(`http://localhost:3000/api/tax-alerts/${result.alert.id}`);
const alertData = await alertResponse.json();

// 3. Search for related alerts
const searchResponse = await fetch('http://localhost:3000/api/tax-alerts/search/GILTI');
const searchResults = await searchResponse.json();

// 4. Get statistics
const statsResponse = await fetch('http://localhost:3000/api/tax-alerts/meta/stats');
const stats = await statsResponse.json();
```

---

## TypeScript Types

```typescript
interface IngestRequest {
  text: string;
  sourceDocument?: string;
  saveSourceText?: boolean;
  minConfidence?: number;
}

interface IngestResponse {
  success: boolean;
  message: string;
  alert: TaxAlert;
  confidence: number;
  warnings?: string[];
}

interface TaxAlert {
  id: number;
  country: 'US' | 'UK' | 'EU' | 'OTHER';
  taxType: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  summary: string;
  keyChanges: string[];
  affectedEntities: string[];
  bpSpecificImpact: string;
  requiredActions: string[];
  complianceRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedDeadline: string | null;
  overallConfidence: number;
  classificationConfidence: number;
  interpretationConfidence: number;
  confidenceNotes: string | null;
  sourceLength: number;
  modelUsed: string;
  extractedAt: string;
  createdAt: string;
  updatedAt: string;
  sourceDocument: string | null;
  sourceText: string | null;
}
```

---

## Testing

See `server/routes/test-api.http` for ready-to-use HTTP requests (VS Code REST Client).

---

**Last Updated:** November 13, 2025
**API Version:** 1.0.0
**Base URL:** `http://localhost:3000/api/tax-alerts`
