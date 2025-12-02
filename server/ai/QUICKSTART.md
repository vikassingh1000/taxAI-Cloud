# Tax Alert Extraction - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Environment Setup

Add your Anthropic API key to `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Run the Example

```bash
npx tsx server/ai/example.ts
```

This will run 5 example scenarios showing different use cases.

---

## 📝 Basic Usage

### Quick Extract (One-Liner)

```typescript
import { extractTaxAlert } from './server/ai/taxAlertExtraction';

const pdfText = "... your PDF text here ...";
const alert = await extractTaxAlert(pdfText);

console.log(alert.classification.priority);  // "HIGH"
console.log(alert.content.summary);          // "IRS provides guidance..."
```

### Full Example

```typescript
import TaxAlertExtractionService from './server/ai/taxAlertExtraction';

// Initialize once, reuse multiple times
const service = new TaxAlertExtractionService();

// Extract from PDF text
const alert = await service.extractTaxAlert(pdfText);

// Check if requires immediate action
if (alert.classification.priority === "CRITICAL") {
  console.log("🚨 CRITICAL ALERT!");
  console.log("Required Actions:", alert.interpretation.required_actions);
}

// Check confidence
if (alert.confidence.overall_score < 0.7) {
  console.log("⚠️  Low confidence - manual review recommended");
}
```

---

## 📊 Output Structure

```typescript
{
  classification: {
    country: "US",              // US, UK, EU, OTHER
    tax_type: "GILTI",          // Corporate Tax, VAT, etc.
    priority: "HIGH"            // CRITICAL, HIGH, MEDIUM, LOW
  },

  content: {
    title: "Guidance on GILTI Regulations",
    summary: "IRS provides updated guidance...",
    key_changes: [
      "Oil & gas extraction income treated as tested income",
      "Depreciation deductions allowed in full"
    ],
    affected_entities: [
      "Oil & Gas Companies",
      "US Shareholders of CFCs"
    ]
  },

  interpretation: {
    bp_specific_impact: "This affects BP's US upstream operations...",
    required_actions: [
      "Update Form 8992 calculations",
      "Review CFC income classifications"
    ],
    compliance_risk: "HIGH",
    estimated_deadline: "2025-01-31"
  },

  confidence: {
    overall_score: 0.92,
    classification_confidence: 0.95,
    interpretation_confidence: 0.89,
    notes: "Clear guidance with specific deadlines"
  },

  metadata: {
    extracted_at: "2025-11-13T10:30:45.123Z",
    source_length: 5432,
    model_used: "claude-sonnet-4-20250514"
  }
}
```

---

## 🔧 Common Use Cases

### 1. Process Single PDF

```typescript
import { extractTaxAlert } from './server/ai/taxAlertExtraction';
import fs from 'fs';
import pdfParse from 'pdf-parse';

// Read PDF file
const pdfBuffer = fs.readFileSync('tax-notice.pdf');
const pdfData = await pdfParse(pdfBuffer);

// Extract alert
const alert = await extractTaxAlert(pdfData.text);
```

### 2. Batch Process Multiple PDFs

```typescript
const service = new TaxAlertExtractionService();

const pdfTexts = [text1, text2, text3];
const alerts = await service.extractBatch(pdfTexts);

// Filter by priority
const criticalAlerts = alerts.filter(a =>
  a.classification.priority === "CRITICAL"
);
```

### 3. Auto-Route Based on Country

```typescript
const alert = await extractTaxAlert(pdfText);

switch (alert.classification.country) {
  case "US":
    // Send to US tax team
    break;
  case "UK":
    // Send to UK tax team
    break;
  case "EU":
    // Send to EU tax team
    break;
}
```

### 4. Confidence-Based Workflow

```typescript
const alert = await extractTaxAlert(pdfText);

if (alert.confidence.overall_score >= 0.85) {
  // High confidence - auto-process
  await saveToDatabase(alert);
  await sendNotification(alert);
} else if (alert.confidence.overall_score >= 0.70) {
  // Medium confidence - flag for review
  await flagForReview(alert);
} else {
  // Low confidence - manual processing
  await sendToManualQueue(alert);
}
```

---

## 🏗️ Express Route Example

```typescript
import express from 'express';
import { extractTaxAlert } from './server/ai/taxAlertExtraction';
import multer from 'multer';
import pdfParse from 'pdf-parse';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/tax-alerts/extract', upload.single('pdf'), async (req, res) => {
  try {
    // Parse PDF
    const pdfData = await pdfParse(req.file.buffer);

    // Extract alert
    const alert = await extractTaxAlert(pdfData.text);

    // Return result
    res.json({ success: true, data: alert });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## ⚙️ Configuration Options

### Logging Level

```typescript
import { logger, LogLevel } from './server/ai/logger';

// Set log level
logger.setLevel(LogLevel.DEBUG);  // DEBUG, INFO, WARN, ERROR

// Or via environment variable
// LOG_LEVEL=DEBUG
```

### Model Selection

```typescript
// Use different Claude model
const service = new TaxAlertExtractionService(
  process.env.ANTHROPIC_API_KEY,
  "claude-sonnet-4-20250514"  // or "claude-opus-4-20250514"
);
```

---

## 🐛 Troubleshooting

### Error: "API key is required"

**Solution:** Set `ANTHROPIC_API_KEY` in `.env` file

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Error: "PDF text is too short"

**Solution:** Ensure PDF parsing extracted full text (minimum 50 characters)

```typescript
console.log("PDF text length:", pdfText.length);
console.log("First 100 chars:", pdfText.substring(0, 100));
```

### Low Confidence Scores

**Causes:**
- Document is draft/proposed
- Missing key information
- Non-standard format

**Solution:** Flag for manual review or provide additional context

---

## 📚 Next Steps

1. **Read Full Documentation**: See [README.md](./README.md) for complete API reference
2. **Review Examples**: Check [example.ts](./example.ts) for detailed usage patterns
3. **Test with Real Data**: Try with your actual tax notification PDFs
4. **Integrate into App**: Add to your Express routes or background jobs

---

## 🔗 File Structure

```
server/ai/
├── taxAlertExtraction.ts     # Main service (use this!)
├── logger.ts                  # Logging utility
├── jurisdictionHandlers.ts    # US/UK/EU detection
├── example.ts                 # Working examples
├── README.md                  # Full documentation
└── QUICKSTART.md             # This file
```

---

## 💡 Tips

1. **Reuse Service Instance**: Create once, use multiple times
2. **Check Confidence**: Always verify confidence scores before auto-processing
3. **Handle Errors**: Wrap in try-catch for production use
4. **Log Everything**: Enable DEBUG logging during development
5. **Batch When Possible**: Use `extractBatch()` for multiple documents

---

## 📞 Support

- Full docs: [README.md](./README.md)
- Examples: [example.ts](./example.ts)
- Requirements: [req/instruction.md](../../req/instruction.md)

**Last Updated:** November 13, 2025
