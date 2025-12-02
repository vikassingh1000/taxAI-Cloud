# Tax Alerts SQLite Database

SQLite database for storing AI-extracted tax alert data.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `better-sqlite3` - Fast SQLite3 library
- `drizzle-orm` - Type-safe ORM
- `@types/better-sqlite3` - TypeScript types

### 2. Initialize Database

```bash
npm run db:init
```

This creates:
- `data/` directory
- `data/tax_alerts.db` database file
- `tax_alerts` table with indexes

### 3. Run AI Extraction (saves to DB)

```bash
npm run ai:example
```

Extracts sample tax alerts and saves them to the database.

### 4. View Statistics

```bash
npm run db:stats
```

Shows database statistics, charts, and recent alerts.

### 5. Browse Database (Visual Studio)

```bash
npm run db:studio
```

Opens Drizzle Studio in your browser to visually explore the database.

---

## 📊 Database Schema

### Table: `tax_alerts`

| Field | Type | Description |
|-------|------|-------------|
| **id** | INTEGER | Primary key (auto-increment) |
| **Classification** |
| country | TEXT | US, UK, EU, OTHER |
| tax_type | TEXT | Corporate Tax, VAT, GILTI, etc. |
| priority | TEXT | CRITICAL, HIGH, MEDIUM, LOW |
| **Content** |
| title | TEXT | Alert title (5-200 chars) |
| summary | TEXT | Brief summary (50-500 chars) |
| key_changes | TEXT (JSON) | Array of key regulatory changes |
| affected_entities | TEXT (JSON) | Array of affected entity types |
| **Interpretation** |
| bp_specific_impact | TEXT | BP-specific impact analysis |
| required_actions | TEXT (JSON) | Array of required actions |
| compliance_risk | TEXT | CRITICAL, HIGH, MEDIUM, LOW |
| estimated_deadline | TEXT | Compliance deadline (ISO or text) |
| **Confidence** |
| overall_confidence | REAL | 0.0-1.0 overall confidence |
| classification_confidence | REAL | 0.0-1.0 classification confidence |
| interpretation_confidence | REAL | 0.0-1.0 interpretation confidence |
| confidence_notes | TEXT | Optional caveats/notes |
| **Metadata** |
| source_length | INTEGER | Source PDF text length |
| model_used | TEXT | AI model version used |
| extracted_at | TEXT | ISO timestamp of extraction |
| **Audit** |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Last update timestamp |
| **Optional** |
| source_document | TEXT | PDF filename/reference |
| source_text | TEXT | Original PDF text (optional) |

### Indexes

- `idx_tax_alerts_country` - Filter by country
- `idx_tax_alerts_priority` - Filter by priority
- `idx_tax_alerts_tax_type` - Filter by tax type
- `idx_tax_alerts_extracted_at` - Sort by date (DESC)
- `idx_tax_alerts_confidence` - Sort by confidence (DESC)

---

## 📝 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run db:init` | `tsx server/db/init.ts` | Initialize database & create tables |
| `npm run db:stats` | `tsx server/db/stats.ts` | Show database statistics |
| `npm run db:studio` | `drizzle-kit studio` | Open visual database browser |
| `npm run db:migrate` | `drizzle-kit generate` | Generate migrations |
| `npm run ai:example` | `tsx server/ai/example.ts` | Run AI extraction & save to DB |

---

## 💻 Usage Examples

### Basic Operations

```typescript
import { getDbService } from './server/db/taxAlertService';

const db = getDbService();

// Create from AI output
const alert = await db.createFromAiOutput(aiOutput);

// Get all alerts
const allAlerts = await db.getAll();

// Get by country
const usAlerts = await db.getByCountry('US');

// Get critical alerts
const criticalAlerts = await db.getCriticalAlerts();

// Search
const results = await db.search('GILTI');

// Get statistics
const stats = await db.getStats();
```

### Advanced Queries

```typescript
// Get high-confidence alerts
const highConfidence = await db.getByConfidence(0.85);

// Get alerts by date range
const recentAlerts = await db.getByDateRange(
  '2025-01-01T00:00:00Z',
  '2025-12-31T23:59:59Z'
);

// Get alerts by priority
const highPriority = await db.getByPriority('HIGH');

// Get alerts by tax type
const giltAlerts = await db.getByTaxType('GILTI');
```

### Using in AI Extraction

```typescript
import { extractTaxAlert } from './server/ai';
import { getDbService } from './server/db/taxAlertService';

// Extract and save
const pdfText = "... your PDF text ...";
const aiOutput = await extractTaxAlert(pdfText);

const db = getDbService();
const savedAlert = await db.createFromAiOutput(
  aiOutput,
  'irs-notice-2024-45.pdf',  // source document
  pdfText                     // source text (optional)
);

console.log(`Saved alert ID: ${savedAlert.id}`);
```

---

## 🔧 Database Location

**Default**: `data/tax_alerts.db`

To use a custom location:

```typescript
import TaxAlertDbService from './server/db/taxAlertService';

const db = new TaxAlertDbService('/custom/path/database.db');
```

---

## 📦 Database File

The database is a single file: `data/tax_alerts.db`

**Advantages**:
- ✅ No server required
- ✅ Easy backup (copy file)
- ✅ Fast queries
- ✅ Perfect for local development
- ✅ Can be committed to git (if small)

**To backup**:
```bash
cp data/tax_alerts.db data/tax_alerts_backup_$(date +%Y%m%d).db
```

**To reset**:
```bash
rm data/tax_alerts.db
npm run db:init
```

---

## 🌐 Drizzle Studio (Visual Browser)

View and edit your database visually:

```bash
npm run db:studio
```

Opens at `https://local.drizzle.studio/`

Features:
- Browse tables visually
- Run queries
- Edit records
- View schema
- Export data

---

## 🔍 Query Examples

### SQL Queries (Direct)

```typescript
const db = getDbService();

// Custom SQL query
const results = await db.db.execute(sql`
  SELECT country, COUNT(*) as count
  FROM tax_alerts
  WHERE priority = 'CRITICAL'
  GROUP BY country
`);
```

### Drizzle ORM Queries

```typescript
import { eq, and, or, gte, desc } from 'drizzle-orm';
import { taxAlerts } from './server/db/schema';

const db = getDbService();

// Complex filter
const alerts = await db.db
  .select()
  .from(taxAlerts)
  .where(
    and(
      eq(taxAlerts.country, 'US'),
      gte(taxAlerts.overallConfidence, 0.8),
      or(
        eq(taxAlerts.priority, 'CRITICAL'),
        eq(taxAlerts.priority, 'HIGH')
      )
    )
  )
  .orderBy(desc(taxAlerts.extractedAt))
  .limit(10);
```

---

## 📊 Statistics Script Output

```bash
npm run db:stats
```

Shows:
- Total alerts count
- Average confidence score
- Distribution by country (bar chart)
- Distribution by priority (color-coded)
- Distribution by tax type
- Recent alerts (last 5)
- Critical/high priority alerts
- Database file location

---

## 🔄 Migrations

Generate migration files:

```bash
npm run db:migrate
```

This creates SQL migration files in `server/db/migrations/`

**When to use**:
- Changing table structure
- Adding new columns
- Creating new tables
- Production deployments

---

## 🧪 Testing

```typescript
// Test database operations
import { getDbService } from './server/db/taxAlertService';

const db = getDbService();

// Create test alert
const testAlert = await db.create({
  country: 'US',
  taxType: 'GILTI',
  priority: 'HIGH',
  title: 'Test Alert',
  summary: 'This is a test alert for development purposes.',
  keyChanges: ['Test change 1', 'Test change 2'],
  affectedEntities: ['Test Entity'],
  bpSpecificImpact: 'Test impact description for BP operations.',
  requiredActions: ['Test action 1', 'Test action 2'],
  complianceRisk: 'MEDIUM',
  estimatedDeadline: '2025-12-31',
  overallConfidence: 0.95,
  classificationConfidence: 0.98,
  interpretationConfidence: 0.92,
  confidenceNotes: null,
  sourceLength: 1000,
  modelUsed: 'test-model',
  extractedAt: new Date().toISOString(),
  sourceDocument: null,
  sourceText: null,
});

console.log('Test alert created:', testAlert.id);

// Clean up
await db.delete(testAlert.id);
```

---

## 🔒 Security

**SQLite is safe for**:
- Local development
- Single-user applications
- Low-concurrency scenarios

**Not recommended for**:
- High-concurrency web apps (use PostgreSQL)
- Distributed systems
- Multi-server deployments

**Best Practices**:
- Don't store sensitive data without encryption
- Keep database file out of public directories
- Regular backups
- Use parameterized queries (Drizzle handles this)

---

## 📈 Performance

**SQLite is fast**:
- Reads: Very fast (in-memory caching)
- Writes: Fast for single writer
- Queries: Sub-millisecond for indexed queries

**Optimization**:
- Use indexes (already created)
- Enable WAL mode (already enabled)
- Limit result sets
- Use pagination

---

## 🐛 Troubleshooting

### "database is locked"

**Cause**: Multiple write operations simultaneously

**Solution**:
- Close other connections
- Check for zombie processes
- Enable WAL mode (already done)

### "no such table: tax_alerts"

**Solution**:
```bash
npm run db:init
```

### "Cannot find module 'better-sqlite3'"

**Solution**:
```bash
npm install
```

---

## 🔗 Integration with Express

```typescript
// server/index.ts
import express from 'express';
import { getDbService } from './db/taxAlertService';
import { extractTaxAlert } from './ai';

const app = express();
const db = getDbService();

// Get all alerts
app.get('/api/tax-alerts', async (req, res) => {
  const alerts = await db.getAll();
  res.json(alerts);
});

// Get alert by ID
app.get('/api/tax-alerts/:id', async (req, res) => {
  const alert = await db.getById(parseInt(req.params.id));
  res.json(alert);
});

// Extract and save new alert
app.post('/api/tax-alerts/extract', async (req, res) => {
  const { pdfText } = req.body;
  const aiOutput = await extractTaxAlert(pdfText);
  const savedAlert = await db.createFromAiOutput(aiOutput);
  res.json(savedAlert);
});

// Close DB on shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
```

---

## 📚 Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Better SQLite3](https://github.com/WiseLibs/better-sqlite3)

---

**Created:** November 13, 2025
**Version:** 1.0.0
**Database File:** `data/tax_alerts.db`
