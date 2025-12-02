# Tax Alert Extraction Service

AI-powered service for extracting and structuring tax notifications from PDF text using Claude Sonnet API.

## Overview

This service takes raw text from tax notification PDFs (IRS, HMRC, EU) and returns structured, validated JSON with:
- **Classification**: Country, tax type, priority level
- **Content**: Title, summary, key changes, affected entities
- **Interpretation**: BP-specific impact analysis, required actions, compliance risk, deadlines
- **Confidence Scoring**: Overall and per-section confidence metrics
- **Metadata**: Extraction timestamp, source info, model version

## Features

✅ **Production-Ready**: Full error handling, logging, validation
✅ **Multi-Jurisdiction**: Specialized support for US IRS, UK HMRC, EU notifications
✅ **Type-Safe**: Zod schema validation with TypeScript types
✅ **Confidence Scoring**: Transparent AI confidence metrics
✅ **BP-Specific Context**: Energy sector-focused interpretation
✅ **Batch Processing**: Process multiple documents efficiently

---

## Installation

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk zod
```

### 2. Set Environment Variables

Add to your `.env` file:

```env
# Required: Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Logging level (DEBUG, INFO, WARN, ERROR)
LOG_LEVEL=INFO
```

### 3. Verify Setup

```bash
# Check that files exist
ls server/ai/
# Should show: taxAlertExtraction.ts, logger.ts, jurisdictionHandlers.ts, README.md
```

---

## Quick Start

### Basic Usage

```typescript
import { extractTaxAlert } from './server/ai/taxAlertExtraction';

// PDF text (from your PDF parser)
const pdfText = `
  IRS Notice 2024-45
  Guidance on Global Intangible Low-Taxed Income (GILTI)
  ... (full PDF text)
`;

// Extract structured data
const result = await extractTaxAlert(pdfText);

console.log(result.classification.priority); // "HIGH"
console.log(result.content.summary);         // "IRS provides updated guidance..."
console.log(result.interpretation.bp_specific_impact); // "This affects BP's US upstream..."
```

### Advanced Usage with Class

```typescript
import TaxAlertExtractionService from './server/ai/taxAlertExtraction';

// Initialize service (reusable for multiple extractions)
const service = new TaxAlertExtractionService(
  process.env.ANTHROPIC_API_KEY,
  "claude-sonnet-4-20250514"  // Optional: specify model
);

// Single extraction
const alert = await service.extractTaxAlert(pdfText);

// Batch processing
const alerts = await service.extractBatch([pdf1Text, pdf2Text, pdf3Text]);
```

---

## API Reference

### `extractTaxAlert(pdfText: string, apiKey?: string): Promise<TaxAlert>`

**Parameters:**
- `pdfText` (string): Raw text extracted from PDF (minimum 50 characters)
- `apiKey` (string, optional): Anthropic API key (defaults to `process.env.ANTHROPIC_API_KEY`)

**Returns:** Promise<TaxAlert>

**Throws:** Error if:
- API key missing
- PDF text too short (<50 chars)
- API request fails
- Response doesn't match schema

---

### `TaxAlertExtractionService`

#### Constructor

```typescript
new TaxAlertExtractionService(apiKey?: string, model?: string)
```

**Parameters:**
- `apiKey` (optional): Anthropic API key
- `model` (optional): Claude model version (default: `"claude-sonnet-4-20250514"`)

#### Methods

##### `extractTaxAlert(pdfText: string): Promise<TaxAlert>`

Extract single tax alert.

##### `extractBatch(pdfTexts: string[]): Promise<TaxAlert[]>`

Extract multiple tax alerts. Continues on error and logs failures.

---

## Output Schema

### TaxAlert Type

```typescript
type TaxAlert = {
  classification: {
    country: "US" | "UK" | "EU" | "OTHER";
    tax_type: "Corporate Tax" | "VAT" | "Transfer Pricing" | "GILTI" | "Sales Tax" | "Energy Tax" | "Withholding Tax" | "Customs Duty" | "Other";
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  };

  content: {
    title: string;              // 5-200 chars
    summary: string;            // 50-500 chars (2-3 sentences)
    key_changes: string[];      // 1-10 items
    affected_entities: string[]; // 1-15 items
  };

  interpretation: {
    bp_specific_impact: string;      // 50-800 chars
    required_actions: string[];       // 1-10 items
    compliance_risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    estimated_deadline: string | null; // ISO date or descriptive
  };

  confidence: {
    overall_score: number;            // 0.0-1.0
    classification_confidence: number; // 0.0-1.0
    interpretation_confidence: number; // 0.0-1.0
    notes?: string;                   // Optional caveats
  };

  metadata: {
    extracted_at: string;   // ISO timestamp
    source_length: number;  // Character count
    model_used: string;     // AI model version
  };
}
```

---

## Jurisdiction Support

### Automatic Detection

The service automatically detects jurisdiction based on document content:

```typescript
import { JurisdictionDetector, US_IRS_CONTEXT, UK_HMRC_CONTEXT } from './server/ai/jurisdictionHandlers';

// Detect jurisdiction
const context = JurisdictionDetector.detect(pdfText);
console.log(context.country);    // "US"
console.log(context.authority);  // "Internal Revenue Service (IRS)"

// Extract document reference
const ref = JurisdictionDetector.extractDocumentReference(pdfText, context);
console.log(ref); // "Notice 2024-45"
```

### Supported Jurisdictions

| Jurisdiction | Authority | Common Documents | Key Tax Types |
|-------------|-----------|------------------|---------------|
| **US** | IRS | Notices, Revenue Rulings, Treasury Regs | Corporate Tax, GILTI, Transfer Pricing, Energy Tax |
| **UK** | HMRC | Revenue & Customs Briefs, Finance Acts | Corporation Tax, VAT, EPL, Ring Fence CT |
| **EU** | European Commission | Directives, Regulations | VAT, CBAM, ATAD, Transfer Pricing |

---

## Priority Classification

The AI assigns priority based on:

| Priority | Criteria | Example |
|----------|----------|---------|
| **CRITICAL** | Immediate compliance risk OR major financial impact (>$10M) | Tax rate increase effective next quarter |
| **HIGH** | Significant impact with <90 day deadline | New reporting requirement due in 60 days |
| **MEDIUM** | Moderate impact, longer timeline | Proposed regulation for next tax year |
| **LOW** | Informational, minor impact | Clarification of existing guidance |

---

## Error Handling

The service provides detailed error messages:

```typescript
try {
  const alert = await extractTaxAlert(pdfText);
} catch (error) {
  if (error.message.includes("API key is required")) {
    // Handle missing API key
  } else if (error.message.includes("too short")) {
    // Handle invalid input
  } else if (error.message.includes("Schema validation failed")) {
    // Handle unexpected API response
  } else if (error.message.includes("Anthropic API error")) {
    // Handle API errors (rate limit, auth, etc.)
  }
}
```

All errors are logged with context for debugging.

---

## Logging

### Log Levels

```typescript
import { logger, LogLevel } from './server/ai/logger';

// Set log level programmatically
logger.setLevel(LogLevel.DEBUG);

// Or via environment variable
// LOG_LEVEL=DEBUG
```

**Levels:**
- `DEBUG`: Detailed extraction info, API responses, validation details
- `INFO`: High-level progress (extraction started/completed, jurisdiction detected)
- `WARN`: Non-fatal issues (batch item failures, low confidence)
- `ERROR`: Fatal errors (API failures, validation errors)

### Log Output Example

```
[2025-11-13T10:30:45.123Z] INFO  [TaxAlertService] Starting tax alert extraction
{
  "textLength": 5432,
  "preview": "IRS Notice 2024-45..."
}
[2025-11-13T10:30:47.456Z] INFO  [TaxAlertService] Detected jurisdiction: US
{
  "confidence": 45
}
[2025-11-13T10:30:52.789Z] INFO  [TaxAlertService] Tax alert extraction completed
{
  "duration_ms": 7666,
  "country": "US",
  "priority": "HIGH",
  "confidence": 0.92
}
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         INPUT: PDF Text                          │
│             (Raw text extracted from tax notification)           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1. Input Validation                           │
│  • Check minimum length (50 chars)                              │
│  • Detect jurisdiction (IRS/HMRC/EU)                            │
│  • Extract document reference                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 2. Claude API Call (Sonnet 4)                    │
│  • System Prompt: Tax analyst instructions + JSON schema        │
│  • User Prompt: PDF text + jurisdiction hints                   │
│  • Parameters: temperature=0.2 (factual), max_tokens=4000       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. Response Processing                        │
│  • Extract JSON from response (handle markdown wrapping)        │
│  • Parse JSON                                                    │
│  • Add metadata (timestamp, source length, model)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. Schema Validation (Zod)                    │
│  • Validate all required fields                                 │
│  • Check field types and constraints                            │
│  • Verify enum values                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      5. Confidence Scoring                       │
│  • Overall confidence (0.0-1.0)                                 │
│  • Classification confidence                                     │
│  • Interpretation confidence                                     │
│  • Confidence notes (caveats)                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OUTPUT: TaxAlert                            │
│  {                                                               │
│    classification: { country, tax_type, priority },             │
│    content: { title, summary, key_changes, affected_entities }, │
│    interpretation: { bp_impact, actions, risk, deadline },      │
│    confidence: { scores, notes },                               │
│    metadata: { timestamp, source_length, model }                │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Example

### Express Route Integration

```typescript
import express from 'express';
import { extractTaxAlert } from './server/ai/taxAlertExtraction';
import multer from 'multer';
import pdfParse from 'pdf-parse';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/tax-alerts/extract
router.post('/tax-alerts/extract', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Parse PDF to text
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    // Extract tax alert
    const alert = await extractTaxAlert(pdfText);

    // Return structured data
    res.json({
      success: true,
      data: alert
    });

  } catch (error) {
    console.error('Tax alert extraction failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```

---

## Best Practices

### 1. API Key Security
```typescript
// ✅ Good: Use environment variables
const service = new TaxAlertExtractionService(process.env.ANTHROPIC_API_KEY);

// ❌ Bad: Hardcode API keys
const service = new TaxAlertExtractionService("sk-ant-...");
```

### 2. Error Handling
```typescript
// ✅ Good: Handle errors gracefully
try {
  const alert = await extractTaxAlert(pdfText);
  // Process alert
} catch (error) {
  logger.error('Extraction failed', { error });
  // Fallback or notify admin
}
```

### 3. Input Validation
```typescript
// ✅ Good: Validate input before extraction
if (pdfText.trim().length < 50) {
  throw new Error('PDF text too short for meaningful extraction');
}

// Check for non-tax documents
if (!pdfText.toLowerCase().includes('tax')) {
  logger.warn('Document may not be tax-related');
}
```

### 4. Batch Processing
```typescript
// ✅ Good: Use batch method for multiple documents
const alerts = await service.extractBatch(pdfTexts);

// ❌ Bad: Sequential individual calls
for (const text of pdfTexts) {
  await service.extractTaxAlert(text); // Slower
}
```

### 5. Confidence Thresholds
```typescript
// ✅ Good: Check confidence before using results
if (alert.confidence.overall_score < 0.7) {
  logger.warn('Low confidence extraction - manual review recommended');
  // Flag for human review
}
```

---

## Performance

- **Average extraction time**: 5-10 seconds per document
- **Token usage**: ~2,000-4,000 tokens per extraction
- **Batch processing**: Processes sequentially (future: parallel with rate limiting)
- **Recommended batch size**: 10-20 documents at a time

---

## Troubleshooting

### Issue: "API key is required"
**Solution:** Set `ANTHROPIC_API_KEY` in `.env` file or pass to constructor

### Issue: "PDF text is too short"
**Solution:** Ensure PDF parsing extracts full text (minimum 50 characters)

### Issue: "Schema validation failed"
**Solution:** Check logs for specific field errors. May indicate:
- AI response format issue (rare with Sonnet 4)
- Document not actually a tax notification
- Extremely ambiguous or incomplete document

### Issue: Low confidence scores
**Causes:**
- Document is draft/proposed (not final)
- Missing key information (deadlines, affected entities)
- Non-standard document format
- Multiple interpretations possible

**Solution:** Flag for manual review, or provide additional context in prompt

---

## Future Enhancements

- [ ] Parallel batch processing with rate limiting
- [ ] PDF parsing integration (direct PDF → Alert)
- [ ] Historical alert storage and tracking
- [ ] Change detection (compare against previous versions)
- [ ] Multi-language support (beyond English)
- [ ] Custom prompt templates per jurisdiction
- [ ] Webhook notifications for CRITICAL alerts

---

## License

Internal BP use only. Anthropic API usage subject to Anthropic terms of service.

---

## Support

For issues or questions:
1. Check logs for detailed error context
2. Verify API key and environment variables
3. Test with known-good sample documents
4. Contact AI platform team for assistance

---

**Last Updated:** November 13, 2025
**Version:** 1.0.0
**Maintained By:** BP Tax Intelligence Team
