# News Connector Service

## Overview

The News Connector Service is a background service that periodically fetches tax-related news articles from NewsAPI and automatically ingests them into the tax alert system via the `/api/tax-alerts/ingest` endpoint.

Instead of modifying the core ingest endpoint, the connector runs independently and:
- Fetches top N news articles based on a configurable query
- Passes each article individually to the ingest endpoint as JSON
- Runs on a configurable polling interval (default: 60 minutes)
- Can be started, stopped, and reconfigured at runtime without restarting the server

## Files

- **Service:** `server/services/newsConnector.ts` — Core service logic
- **Routes:** `server/routes/newsConnectorRoutes.ts` — API endpoints to manage the connector
- **Example:** `server/examples/newsConnectorExample.ts` — Demonstration of connector usage
- **Server Integration:** `server/index.ts` — Routes registered at `/api/news-connector`

## Prerequisites

Ensure the following environment variables are set in `.env`:

```env
NEWSAPI_KEY=your_newsapi_key_here
PORT=3000
NODE_ENV=development
```

To get a NewsAPI key, visit [https://newsapi.org](https://newsapi.org) and sign up for a free account.

## API Endpoints

All endpoints are prefixed with `/api/news-connector`.

### 1. Start the Connector

**Endpoint:** `POST /api/news-connector/start`

**Request Body:**
```json
{
  "newsQuery": "tax",
  "topN": 5,
  "pollingIntervalMinutes": 60,
  "ingestEndpointUrl": "http://localhost:3000/api/tax-alerts/ingest"
}
```

**Parameters:**
- `newsQuery` (string, optional): The search query for NewsAPI. Default: `"tax"`
- `topN` (number, optional): Number of top articles to fetch per poll. Min: 1, Max: 50. Default: `5`
- `pollingIntervalMinutes` (number, optional): Time between polls in minutes. Min: 1, Max: 1440. Default: `60`
- `ingestEndpointUrl` (string, optional): The ingest endpoint URL. Default: `http://localhost:3000/api/tax-alerts/ingest`

**Response:**
```json
{
  "success": true,
  "message": "News Connector started",
  "status": {
    "isRunning": true,
    "newsQuery": "tax",
    "topN": 5,
    "pollingIntervalMinutes": 60,
    "ingestEndpointUrl": "http://localhost:3000/api/tax-alerts/ingest"
  }
}
```

**Example (PowerShell):**
```powershell
$body = @{
    newsQuery = "tax reform UK"
    topN = 3
    pollingIntervalMinutes = 30
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/start" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/news-connector/start \
  -H "Content-Type: application/json" \
  -d '{
    "newsQuery": "tax reform UK",
    "topN": 3,
    "pollingIntervalMinutes": 30
  }'
```

### 2. Stop the Connector

**Endpoint:** `POST /api/news-connector/stop`

**Response:**
```json
{
  "success": true,
  "message": "News Connector stopped"
}
```

**Example (PowerShell):**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/stop" -Method Post
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/news-connector/stop
```

### 3. Get Connector Status

**Endpoint:** `GET /api/news-connector/status`

**Response:**
```json
{
  "success": true,
  "status": {
    "isRunning": true,
    "newsQuery": "tax",
    "topN": 5,
    "pollingIntervalMinutes": 60,
    "ingestEndpointUrl": "http://localhost:3000/api/tax-alerts/ingest"
  }
}
```

**Example (PowerShell):**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/status" -Method Get | ConvertTo-Json
```

**Example (curl):**
```bash
curl http://localhost:3000/api/news-connector/status
```

### 4. Manually Trigger a Poll

**Endpoint:** `POST /api/news-connector/poll`

Manually trigger one poll cycle without waiting for the interval.

**Response:**
```json
{
  "success": true,
  "message": "Poll triggered (running in background)"
}
```

**Example (PowerShell):**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/poll" -Method Post
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/news-connector/poll
```

### 5. Update Configuration

**Endpoint:** `POST /api/news-connector/config`

Update the connector configuration without restarting the service.

**Request Body:**
```json
{
  "newsQuery": "tax compliance",
  "topN": 5,
  "pollingIntervalMinutes": 45
}
```

**Parameters:** (all optional)
- `newsQuery` (string): New search query
- `topN` (number): New number of articles to fetch. Min: 1, Max: 50
- `pollingIntervalMinutes` (number): New polling interval in minutes. Min: 1, Max: 1440

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated",
  "status": {
    "isRunning": true,
    "newsQuery": "tax compliance",
    "topN": 5,
    "pollingIntervalMinutes": 45,
    "ingestEndpointUrl": "http://localhost:3000/api/tax-alerts/ingest"
  }
}
```

**Example (PowerShell):**
```powershell
$body = @{
    newsQuery = "tax compliance"
    topN = 5
    pollingIntervalMinutes = 45
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/config" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/news-connector/config \
  -H "Content-Type: application/json" \
  -d '{
    "newsQuery": "tax compliance",
    "topN": 5,
    "pollingIntervalMinutes": 45
  }'
```

## How It Works

### Flow

1. **Start** — Call `/api/news-connector/start` with optional config
2. **Immediate Poll** — The connector performs one poll immediately
3. **Scheduled Polling** — Polls run every N minutes as configured
4. **Article Processing** — For each fetched article:
   - Extract title, description, source, and URL
   - Format as text: `Title: ... \n\n Description: ... \n\n Source: ... \n\n URL: ...`
   - POST to `/api/tax-alerts/ingest` with payload:
     ```json
     {
       "text": "...",
       "sourceDocument": "news:source_name:index",
       "saveSourceText": true,
       "minConfidence": 0.0
     }
     ```
5. **Logging** — Each ingestion attempt is logged to the console
6. **Stop** — Call `/api/news-connector/stop` to halt polling

### Ingest Endpoint (Unchanged)

The `/api/tax-alerts/ingest` endpoint remains unchanged. The connector simply calls it with news article data:

```json
{
  "text": "Title: Tax Reforms Announced\n\nDescription: The government...",
  "sourceDocument": "news:BBC News:1",
  "saveSourceText": true,
  "minConfidence": 0.0
}
```

The ingest endpoint then:
1. Extracts tax information from the article text using AI
2. Saves the structured alert to the database
3. Returns the result

## Example Usage

### Run the Example Script

```powershell
npx tsx server/examples/newsConnectorExample.ts
```

This script demonstrates:
1. Starting the connector with custom config
2. Checking status
3. Manually triggering a poll
4. Updating configuration
5. Stopping the connector

### Manual Workflow

**Start the server:**
```powershell
npm run dev
```

**In another terminal, start the connector:**
```powershell
$body = @{
    newsQuery = "tax reform"
    topN = 3
    pollingIntervalMinutes = 30
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/start" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Monitor status:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/status" -Method Get | ConvertTo-Json
```

**Manually fetch articles immediately:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/poll" -Method Post
```

**Check ingested alerts:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/tax-alerts" -Method Get | ConvertTo-Json
```

**Stop the connector:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/stop" -Method Post
```

## Configuration Examples

### Quick News Fetch (Every 10 Minutes)

```powershell
$body = @{
    newsQuery = "tax"
    topN = 5
    pollingIntervalMinutes = 10
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/start" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### Deep Dive (Fewer Articles, Longer Interval)

```powershell
$body = @{
    newsQuery = "corporate tax compliance regulations"
    topN = 3
    pollingIntervalMinutes = 120
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/news-connector/start" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### Multiple Queries (One Connector Instance)

The current implementation supports a single connector instance with one query. To monitor multiple topics, you can:

1. Use a comma-separated query: `newsQuery = "tax,compliance,regulation"`
2. Manually trigger polls with different queries via the API
3. Run multiple connector instances on different ports (advanced)

## Troubleshooting

### Connector Not Starting

**Error:** `NEWSAPI_KEY is required to start News Connector`

**Solution:** Ensure `NEWSAPI_KEY` is set in your `.env` file.

### Articles Not Being Ingested

**Check:**
1. Is the connector running? `GET /api/news-connector/status`
2. Are there articles for the query? Try a more generic query like `"tax"`
3. Are there ingest endpoint errors? Check the server logs
4. Is the ingest endpoint accessible? Test: `curl http://localhost:3000/api/tax-alerts`

### Slow Polling

The connector includes a 500ms delay between articles to avoid overwhelming the API. For faster ingestion, reduce `topN` or trigger manual polls.

## Architecture Notes

- **Service:** `NewsConnectorService` manages the background polling loop
- **Singleton:** One global instance per server process
- **Non-blocking:** Polls run in the background using `setInterval`
- **Resilient:** Failed polls log errors but don't crash the service
- **Flexible:** Configuration can be updated without restarting

## Performance

- **Memory:** Minimal (stores only current config and articles during a poll)
- **CPU:** Minimal (idle between polls)
- **Network:** One API call per poll + one call per article to ingest endpoint
- **Database:** One DB write per successfully extracted article

## Security

- NewsAPI key is read from environment variables (not exposed in API responses)
- Connector validates all configuration parameters with Zod schemas
- Ingest endpoint applies its own validation and AI extraction logic
