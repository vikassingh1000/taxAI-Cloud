# Tax Alert Extraction Service - Visual Flow Guide

## 📊 High-Level Flow

```
┌─────────────┐
│   PDF FILE  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Extract Text    │
│  (pdf-parse)     │
└──────┬───────────┘
       │
       ▼
┌────────────────────────────────┐
│   taxAlertExtraction.ts        │
│                                │
│   extractTaxAlert(pdfText)     │
└──────┬─────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   1. Validate Input             │
│      ✓ Length ≥ 50 chars        │
│      ✓ Non-empty                │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   2. Detect Jurisdiction        │
│      • Score US keywords        │
│      • Score UK keywords        │
│      • Score EU keywords        │
│      → Highest score wins       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   3. Build Prompts              │
│      • System: Tax analyst role │
│      • User: Document text      │
│      • Hints: Jurisdiction tips │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   4. Call Claude API            │
│      • Model: Sonnet 4          │
│      • Temp: 0.2                │
│      • Max tokens: 4000         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   5. Parse Response             │
│      • Extract JSON             │
│      • Remove markdown          │
│      • Add metadata             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   6. Validate (Zod)             │
│      ✓ All fields present       │
│      ✓ Types correct            │
│      ✓ Enums valid              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   TaxAlert Object               │
│   {                             │
│     classification: {...},      │
│     content: {...},             │
│     interpretation: {...},      │
│     confidence: {...},          │
│     metadata: {...}             │
│   }                             │
└─────────────────────────────────┘
```

---

## 🔄 Detailed Extraction Pipeline

```
START
  │
  ├─► Check API Key
  │   └─► Missing? → ERROR: "API key required"
  │
  ├─► Validate PDF Text
  │   ├─► Empty? → ERROR: "Text required"
  │   └─► < 50 chars? → ERROR: "Text too short"
  │
  ├─► Detect Jurisdiction
  │   │
  │   ├─► Scan for "IRS", "Notice", "Revenue Ruling"
  │   │   └─► Score = 45 → US IRS
  │   │
  │   ├─► Scan for "HMRC", "Finance Act", "SI"
  │   │   └─► Score = 38 → UK HMRC
  │   │
  │   └─► Scan for "EU Directive", "Council"
  │       └─► Score = 32 → EU
  │
  │   → Winner: US IRS (Score = 45)
  │
  ├─► Build System Prompt
  │   │
  │   ├─► Add: "You are an expert tax analyst..."
  │   ├─► Add: BP context (energy company)
  │   ├─► Add: Priority criteria
  │   ├─► Add: JSON schema
  │   └─► Add: Confidence guidelines
  │
  ├─► Build User Prompt
  │   │
  │   ├─► Add: "Extract tax alert from..."
  │   ├─► Add: Full PDF text
  │   ├─► Add: US IRS-specific hints
  │   │        - Look for Notice numbers
  │   │        - GILTI, Transfer Pricing
  │   │        - Section 45, 48 (energy)
  │   └─► Add: Specific instructions
  │
  ├─► Call Claude API
  │   │
  │   ├─► Request
  │   │   • Model: claude-sonnet-4-20250514
  │   │   • Temperature: 0.2
  │   │   • Max tokens: 4000
  │   │   • System: [system prompt]
  │   │   • User: [user prompt]
  │   │
  │   ├─► Wait 5-8 seconds...
  │   │
  │   └─► Response
  │       • Content: JSON string
  │       • Usage: 3500 input + 650 output tokens
  │       • Cost: ~$0.02
  │
  ├─► Extract JSON
  │   │
  │   ├─► Raw response:
  │   │   ```json
  │   │   {
  │   │     "classification": {...},
  │   │     ...
  │   │   }
  │   │   ```
  │   │
  │   ├─► Remove ```json and ``` markers
  │   │
  │   └─► Parse JSON
  │       → JavaScript object
  │
  ├─► Add Metadata
  │   │
  │   ├─► extracted_at: "2025-11-13T10:30:45.123Z"
  │   ├─► source_length: 5432
  │   └─► model_used: "claude-sonnet-4-20250514"
  │
  ├─► Validate with Zod
  │   │
  │   ├─► Check: classification.country ∈ [US, UK, EU, OTHER]
  │   │   └─► ✓ "US"
  │   │
  │   ├─► Check: classification.priority ∈ [CRITICAL, HIGH, MEDIUM, LOW]
  │   │   └─► ✓ "HIGH"
  │   │
  │   ├─► Check: content.title length ∈ [5, 200]
  │   │   └─► ✓ 67 chars
  │   │
  │   ├─► Check: interpretation.bp_specific_impact length ∈ [50, 800]
  │   │   └─► ✓ 234 chars
  │   │
  │   ├─► Check: confidence.overall_score ∈ [0, 1]
  │   │   └─► ✓ 0.92
  │   │
  │   └─► All checks pass ✓
  │
  ├─► Log Results
  │   │
  │   └─► INFO: "Extraction completed"
  │       {
  │         "duration_ms": 7234,
  │         "country": "US",
  │         "priority": "HIGH",
  │         "confidence": 0.92
  │       }
  │
  └─► Return TaxAlert Object
      {
        classification: {
          country: "US",
          tax_type: "GILTI",
          priority: "HIGH"
        },
        content: {
          title: "Guidance on Global Intangible Low-Taxed Income (GILTI)",
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

END
```

---

## 🌍 Jurisdiction Detection Flow

```
Input: PDF Text
   │
   ▼
┌──────────────────────────────────────┐
│  Initialize Scores                    │
│  US = 0, UK = 0, EU = 0              │
└────┬─────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Scan for Authority Names             │
├──────────────────────────────────────┤
│  "Internal Revenue Service" → US+10   │
│  "HMRC" → UK+10                       │
│  "European Commission" → EU+10        │
└────┬─────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Scan for Key Terms                   │
├──────────────────────────────────────┤
│  "GILTI" → US+2                       │
│  "IRC" → US+2                         │
│  "Section 482" → US+2                 │
│  "EPL" → UK+2                         │
│  "Ring Fence" → UK+2                  │
│  "CBAM" → EU+2                        │
│  "ATAD" → EU+2                        │
└────┬─────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Scan for Document Patterns           │
├──────────────────────────────────────┤
│  "Notice 2024-45" → US+5              │
│  "Revenue & Customs Brief" → UK+5     │
│  "Directive 2024/123/EU" → EU+5       │
└────┬─────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Calculate Final Scores               │
├──────────────────────────────────────┤
│  US = 10 + (3×2) + 5 = 21            │
│  UK = 0 + (2×2) + 0 = 4              │
│  EU = 0 + (1×2) + 0 = 2              │
└────┬─────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Select Winner: US (Score = 21)       │
│                                       │
│  Return: US_IRS_CONTEXT              │
└──────────────────────────────────────┘
```

---

## ⚠️ Error Handling Flow

```
Try: Extract Tax Alert
  │
  ├─► API Key Missing
  │   └─► throw Error("API key is required")
  │       └─► Catch → Log ERROR → Return to User
  │
  ├─► PDF Text Too Short
  │   └─► throw Error("PDF text is too short (min 50 chars)")
  │       └─► Catch → Log ERROR → Return to User
  │
  ├─► Claude API Error
  │   ├─► Status 401 (Auth)
  │   │   └─► throw Error("Invalid API key")
  │   │
  │   ├─► Status 429 (Rate Limit)
  │   │   └─► throw Error("API rate limit exceeded")
  │   │
  │   └─► Status 500 (Server)
  │       └─► throw Error("Anthropic API error (500)")
  │
  ├─► JSON Parse Error
  │   ├─► Try: Remove markdown
  │   ├─► Try: Parse again
  │   └─► Fail → throw Error("Failed to parse JSON")
  │       └─► Catch → Log ERROR with raw response
  │
  ├─► Schema Validation Error
  │   ├─► Missing field: "classification.country"
  │   │   └─► throw Error("Schema validation failed: classification.country: Required")
  │   │
  │   ├─► Invalid enum: priority = "URGENT"
  │   │   └─► throw Error("Schema validation failed: priority: Invalid enum value")
  │   │
  │   └─► Type mismatch: overall_score = "0.92"
  │       └─► throw Error("Schema validation failed: overall_score: Expected number")
  │
  └─► Success → Return TaxAlert
```

---

## 🔄 Batch Processing Flow

```
Input: [text1, text2, text3, text4, text5]
   │
   ▼
Initialize:
   results = []
   errors = []
   │
   ▼
┌─────────────────────────────────┐
│  For Each Document (Sequential) │
└─────────────────────────────────┘
   │
   ├─► Document 1
   │   ├─► Try: extractTaxAlert(text1)
   │   ├─► Success → results.push(alert1)
   │   └─► Log: "Document 1/5 completed"
   │
   ├─► Document 2
   │   ├─► Try: extractTaxAlert(text2)
   │   ├─► Success → results.push(alert2)
   │   └─► Log: "Document 2/5 completed"
   │
   ├─► Document 3
   │   ├─► Try: extractTaxAlert(text3)
   │   ├─► ERROR: "Text too short"
   │   ├─► errors.push({index: 2, error: "..."})
   │   └─► Log: "Document 3/5 failed"
   │   └─► Continue to next... (don't stop)
   │
   ├─► Document 4
   │   ├─► Try: extractTaxAlert(text4)
   │   ├─► Success → results.push(alert4)
   │   └─► Log: "Document 4/5 completed"
   │
   └─► Document 5
       ├─► Try: extractTaxAlert(text5)
       ├─► Success → results.push(alert5)
       └─► Log: "Document 5/5 completed"
   │
   ▼
Log Summary:
   "Batch completed: 4/5 successful, 1 failed"
   │
   ▼
Return: results
   [alert1, alert2, alert4, alert5]
```

---

## 🎯 Confidence Scoring Logic (Inside Claude)

```
Analyze Document
   │
   ├─► Classification Confidence
   │   │
   │   ├─► Clear Authority Name (IRS/HMRC)
   │   │   └─► +0.3
   │   │
   │   ├─► Explicit Document Reference
   │   │   └─► +0.2
   │   │
   │   ├─► Unambiguous Tax Type Keywords
   │   │   └─► +0.3
   │   │
   │   └─► Clear Priority Indicators
   │       └─► +0.2
   │       │
   │       └─► Classification Confidence = 1.0
   │
   ├─► Interpretation Confidence
   │   │
   │   ├─► Explicit BP Impact Stated
   │   │   └─► +0.3
   │   │
   │   ├─► Clear Action Items Listed
   │   │   └─► +0.2
   │   │
   │   ├─► Specific Deadline Mentioned
   │   │   └─► +0.3
   │   │
   │   └─► Quantified Financial Impact
   │       └─► +0.2
   │       │
   │       └─► Interpretation Confidence = 0.85
   │
   └─► Overall Confidence
       │
       └─► Average(Classification, Interpretation)
           = (1.0 + 0.85) / 2 = 0.925
```

---

## 📦 Usage Patterns

### Pattern 1: Single Extraction

```
User Code
   │
   ├─► import { extractTaxAlert }
   │
   ├─► pdfText = readPDF("notice.pdf")
   │
   ├─► alert = await extractTaxAlert(pdfText)
   │       │
   │       └─► [5-8 seconds API call]
   │
   ├─► if (alert.classification.priority === "CRITICAL")
   │       │
   │       └─► sendEmailAlert(alert)
   │
   └─► saveToDatabase(alert)
```

### Pattern 2: Batch Processing

```
User Code
   │
   ├─► import TaxAlertExtractionService
   │
   ├─► service = new TaxAlertExtractionService()
   │
   ├─► pdfs = loadAllPDFs()
   │       │
   │       └─► [pdf1, pdf2, pdf3, ..., pdf10]
   │
   ├─► alerts = await service.extractBatch(pdfs)
   │       │
   │       └─► [50-80 seconds for 10 docs]
   │
   ├─► highPriority = alerts.filter(a =>
   │       a.classification.priority === "HIGH" ||
   │       a.classification.priority === "CRITICAL"
   │   )
   │
   └─► sendReport(highPriority)
```

### Pattern 3: Confidence-Based Routing

```
User Code
   │
   ├─► alert = await extractTaxAlert(pdfText)
   │
   ├─► if (alert.confidence.overall_score >= 0.85)
   │   │
   │   ├─► Log: "High confidence - auto-process"
   │   └─► autoProcess(alert)
   │
   ├─► else if (alert.confidence.overall_score >= 0.70)
   │   │
   │   ├─► Log: "Medium confidence - queue for review"
   │   └─► queueForReview(alert)
   │
   └─► else
       │
       ├─► Log: "Low confidence - manual processing"
       └─► sendToManualQueue(alert)
```

---

## 🔌 Integration Points

```
┌──────────────────────┐
│  Express Route       │
│  POST /api/extract   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Multer Upload       │
│  Handle PDF File     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  pdf-parse           │
│  Extract Text        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  extractTaxAlert()   │
│  ← This Service      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Drizzle ORM         │
│  Save to Database    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  React Query         │
│  Update Frontend     │
└──────────────────────┘
```

---

**This visual guide complements:**
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup guide
- [README.md](./README.md) - Full API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture
- [example.ts](./example.ts) - Working code examples
