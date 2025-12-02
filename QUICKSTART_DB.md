# Tax Alerts Database - Quick Start Guide

## ✅ Setup Complete!

The SQLite database for tax alerts has been successfully set up and initialized.

---

## 📊 What Was Created

### Database Files
- **Location**: `data/tax_alerts.db`
- **Type**: SQLite3 database
- **Size**: ~4KB (empty, will grow with data)

### NPM Scripts Added

| Command | What It Does |
|---------|--------------|
| `npm run db:init` | Initialize/reset database |
| `npm run db:stats` | View database statistics |
| `npm run db:studio` | Open visual database browser |
| `npm run ai:example` | Run AI extraction & save to DB |

---

## 🚀 Quick Usage

### 1. Run Examples (with Database Save)

```bash
# Make sure your API key is set
# ANTHROPIC_API_KEY=sk-ant-... in .env

npm run ai:example
```

This runs 6 examples including database save:
1. Simple extraction (IRS Notice)
2. Advanced extraction (HMRC Brief)
3. Batch processing
4. Error handling
5. Confidence filtering
6. **Save to database** ← NEW!

### 2. View Statistics

```bash
npm run db:stats
```

Shows:
- Total alerts count
- Distribution by country (bar chart)
- Distribution by priority (color-coded)
- Distribution by tax type
- Recent alerts
- Critical/high priority alerts

### 3. Browse Database Visually

```bash
npm run db:studio
```

Opens Drizzle Studio in your browser at `https://local.drizzle.studio/`

---

## 💻 Programmatic Usage

### Save AI Output to Database

```typescript
import { extractTaxAlert } from './server/ai';
import { getDbService } from './server/db/taxAlertService';

// Extract from PDF
const pdfText = "... your PDF text ...";
const aiOutput = await extractTaxAlert(pdfText);

// Save to database
const db = getDbService();
const savedAlert = await db.createFromAiOutput(
  aiOutput,
  'my-document.pdf',  // optional: source filename
  pdfText              // optional: store original text
);

console.log(`Saved with ID: ${savedAlert.id}`);
```

### Query Database

```typescript
import { getDbService } from './server/db/taxAlertService';

const db = getDbService();

// Get all alerts
const allAlerts = await db.getAll();

// Get by country
const usAlerts = await db.getByCountry('US');

// Get critical alerts only
const criticalAlerts = await db.getCriticalAlerts();

// Search by keyword
const giltAlerts = await db.search('GILTI');

// Get high-confidence alerts
const highConfidence = await db.getByConfidence(0.85);

// Get statistics
const stats = await db.getStats();
console.log(`Total: ${stats.total}`);
console.log(`By Country:`, stats.byCountry);
console.log(`By Priority:`, stats.byPriority);
```

---

## 📁 Project Structure

```
VisualProto/
├── data/
│   └── tax_alerts.db          ← SQLite database
│
├── server/
│   ├── ai/
│   │   ├── taxAlertExtraction.ts
│   │   ├── example.ts         ← Updated with DB save
│   │   └── ...
│   │
│   └── db/                    ← NEW!
│       ├── schema.ts          ← Database schema
│       ├── taxAlertService.ts ← Database service
│       ├── init.ts            ← Init script
│       ├── stats.ts           ← Stats script
│       └── README.md          ← Full documentation
│
└── package.json               ← Updated with scripts
```

---

## 🔧 Available Operations

### Database Service Methods

```typescript
const db = getDbService();

// CREATE
await db.create(data);
await db.createFromAiOutput(aiOutput, sourceDoc, sourceText);

// READ
await db.getAll(limit, offset);
await db.getById(id);
await db.getByCountry(country);
await db.getByPriority(priority);
await db.getByTaxType(taxType);
await db.getCriticalAlerts();
await db.getByConfidence(minConfidence);
await db.getByDateRange(startDate, endDate);
await db.search(keyword);
await db.getStats();

// UPDATE
await db.update(id, data);

// DELETE
await db.delete(id);
await db.deleteAll();

// EXPORT
await db.exportToJson(outputPath);
```

---

## 📊 Database Schema Summary

### Main Fields

**Classification**: country, tax_type, priority
**Content**: title, summary, key_changes, affected_entities
**Interpretation**: bp_specific_impact, required_actions, compliance_risk, estimated_deadline
**Confidence**: overall_confidence, classification_confidence, interpretation_confidence
**Metadata**: source_length, model_used, extracted_at, created_at, updated_at

See [server/db/README.md](./server/db/README.md) for complete schema.

---

## 🎯 Next Steps

### Option 1: Run the Full Example

```bash
# Set API key in .env first!
npm run ai:example
```

This will extract 2 sample tax alerts and save them to the database.

### Option 2: Integrate into Your Code

```typescript
// In your extraction workflow
import { extractTaxAlert } from './server/ai';
import { getDbService } from './server/db/taxAlertService';

async function processNewPDF(pdfPath: string) {
  // 1. Extract text from PDF (use pdf-parse or similar)
  const pdfText = await extractTextFromPDF(pdfPath);

  // 2. Extract with AI
  const alert = await extractTaxAlert(pdfText);

  // 3. Save to database
  const db = getDbService();
  const saved = await db.createFromAiOutput(alert, pdfPath, pdfText);

  // 4. Check priority
  if (saved.priority === 'CRITICAL') {
    await sendNotification(saved);
  }

  return saved;
}
```

### Option 3: Explore the Database

```bash
# View statistics
npm run db:stats

# Open visual browser
npm run db:studio
```

---

## 📚 Documentation

- **Database Setup**: [server/db/README.md](./server/db/README.md)
- **AI Extraction**: [server/ai/README.md](./server/ai/README.md)
- **Quick Start**: [server/ai/QUICKSTART.md](./server/ai/QUICKSTART.md)

---

## 🐛 Troubleshooting

### "Cannot find module 'better-sqlite3'"

```bash
npm install
```

### "Database is locked"

Close any running `db:studio` sessions or other database connections.

### "No such table: tax_alerts"

```bash
npm run db:init
```

### View Raw Database

```bash
# Install sqlite3 CLI (if needed)
# macOS: brew install sqlite3
# Ubuntu: apt-get install sqlite3

# Open database
sqlite3 data/tax_alerts.db

# Run queries
sqlite> SELECT COUNT(*) FROM tax_alerts;
sqlite> SELECT country, priority, title FROM tax_alerts LIMIT 5;
sqlite> .quit
```

---

## ✅ Checklist

- [x] SQLite database created
- [x] Schema defined (tax_alerts table)
- [x] Database service implemented
- [x] NPM scripts added
- [x] Example updated to save to DB
- [x] Documentation created
- [x] Dependencies installed
- [x] Database initialized

**Status**: ✅ **Ready to use!**

---

## 🎉 Summary

You now have a fully functional SQLite database for storing tax alerts!

**To get started:**

```bash
# 1. Set API key (if not already done)
echo 'ANTHROPIC_API_KEY=sk-ant-your-key' >> .env

# 2. Run examples (includes DB save)
npm run ai:example

# 3. View results
npm run db:stats
```

**Questions?** See [server/db/README.md](./server/db/README.md) for complete documentation.
