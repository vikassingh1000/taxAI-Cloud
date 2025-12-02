# Tax Alert Extraction Service - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                          │
│  (Express Route, Background Job, CLI Tool, etc.)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ PDF Text Input
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               TAX ALERT EXTRACTION SERVICE                          │
│                  (taxAlertExtraction.ts)                            │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  1. Input Validation                                         │ │
│  │     • Check minimum length (50 chars)                        │ │
│  │     • Validate text format                                   │ │
│  └────────────────────────┬─────────────────────────────────────┘ │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐ │
│  │  2. Jurisdiction Detection                                    │ │
│  │     • Analyze document keywords                              │ │
│  │     • Pattern matching (IRS/HMRC/EU)                         │ │
│  │     • Extract document reference                             │ │
│  └────────────────────────┬─────────────────────────────────────┘ │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐ │
│  │  3. Prompt Engineering                                        │ │
│  │     • Build system prompt (tax analyst persona)              │ │
│  │     • Build user prompt (PDF text + hints)                   │ │
│  │     • Add jurisdiction-specific guidance                     │ │
│  └────────────────────────┬─────────────────────────────────────┘ │
│                           │                                         │
│                           │ API Request                             │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ANTHROPIC CLAUDE API                             │
│                  (claude-sonnet-4-20250514)                         │
│                                                                     │
│  • Temperature: 0.2 (factual, consistent)                          │
│  • Max Tokens: 4000                                                │
│  • System Prompt: Tax expert instructions                          │
│  • User Prompt: Document text + context                           │
│                                                                     │
│  → Returns: Structured JSON response                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ JSON Response
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               RESPONSE PROCESSING PIPELINE                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  4. JSON Extraction                                          │ │
│  │     • Remove markdown code blocks                            │ │
│  │     • Parse JSON string                                      │ │
│  │     • Handle malformed responses                             │ │
│  └────────────────────────┬─────────────────────────────────────┘ │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐ │
│  │  5. Metadata Addition                                         │ │
│  │     • Add extraction timestamp                               │ │
│  │     • Add source length                                      │ │
│  │     • Add model version                                      │ │
│  └────────────────────────┬─────────────────────────────────────┘ │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐ │
│  │  6. Schema Validation (Zod)                                  │ │
│  │     • Validate required fields                               │ │
│  │     • Check data types                                       │ │
│  │     • Verify enum values                                     │ │
│  │     • Validate constraints (min/max length)                  │ │
│  └────────────────────────┬─────────────────────────────────────┘ │
│                           │                                         │
│                           │ Validated TaxAlert                      │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     STRUCTURED TAX ALERT                            │
│  {                                                                  │
│    classification: { country, tax_type, priority },                │
│    content: { title, summary, key_changes, affected_entities },    │
│    interpretation: { bp_impact, actions, risk, deadline },         │
│    confidence: { scores, notes },                                  │
│    metadata: { timestamp, source_length, model }                   │
│  }                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Return to Client
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATION                             │
│  • Store in database                                               │
│  • Send notifications                                              │
│  • Trigger workflows                                               │
│  • Display in UI                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. TaxAlertExtractionService (Main Service)

**File**: `server/ai/taxAlertExtraction.ts`

**Responsibilities**:
- Orchestrate the entire extraction pipeline
- Manage API calls to Claude
- Validate inputs and outputs
- Handle errors and logging

**Key Methods**:
```typescript
class TaxAlertExtractionService {
  constructor(apiKey?: string, model?: string)
  extractTaxAlert(pdfText: string): Promise<TaxAlert>
  extractBatch(pdfTexts: string[]): Promise<TaxAlert[]>
  private callClaudeAPI(pdfText: string): Promise<string>
  private parseAndValidate(response: string, originalText: string): TaxAlert
}
```

**Error Handling**:
- API errors → Detailed logging with status codes
- Validation errors → Specific field-level error messages
- Input errors → Clear user-facing messages

---

### 2. JurisdictionDetector (Context Analysis)

**File**: `server/ai/jurisdictionHandlers.ts`

**Responsibilities**:
- Detect document jurisdiction (US/UK/EU)
- Extract document reference numbers
- Provide jurisdiction-specific hints

**Detection Algorithm**:
```
Score = 0

IF document contains authority name (e.g., "IRS")
  → Score += 10

FOR EACH key term match (e.g., "GILTI", "Notice")
  → Score += 2

FOR EACH document pattern match (e.g., "Notice 2024-45")
  → Score += 5

RETURN jurisdiction with highest score
```

**Supported Patterns**:
- **US IRS**: Notice \d{4}-\d+, Rev. Rul. \d{4}-\d+, IRC § \d+
- **UK HMRC**: Revenue & Customs Brief \d+/\d{4}, Finance Act \d{4}
- **EU**: Directive \d{4}/\d+/EU, Regulation (EU) \d{4}/\d+

---

### 3. Logger (Structured Logging)

**File**: `server/ai/logger.ts`

**Log Levels**:
- **DEBUG**: Detailed extraction info, API responses, validation
- **INFO**: High-level progress, jurisdiction detection
- **WARN**: Non-fatal issues, low confidence
- **ERROR**: Fatal errors, API failures

**Log Format**:
```
[2025-11-13T10:30:45.123Z] INFO  [TaxAlertService] Message
{
  "context_key": "context_value"
}
```

**Key Log Events**:
- Service initialization
- Extraction start/complete
- Jurisdiction detection
- API call timing
- Validation results
- Error details

---

### 4. Zod Schema (Type Safety & Validation)

**File**: `server/ai/taxAlertExtraction.ts` (TaxAlertSchema)

**Validation Rules**:

```typescript
TaxAlertSchema = {
  classification: {
    country: enum["US", "UK", "EU", "OTHER"],
    tax_type: enum[...9 tax types],
    priority: enum["CRITICAL", "HIGH", "MEDIUM", "LOW"]
  },

  content: {
    title: string(5-200 chars),
    summary: string(50-500 chars),
    key_changes: array(1-10 strings),
    affected_entities: array(1-15 strings)
  },

  interpretation: {
    bp_specific_impact: string(50-800 chars),
    required_actions: array(1-10 strings),
    compliance_risk: enum["CRITICAL", "HIGH", "MEDIUM", "LOW"],
    estimated_deadline: string | null
  },

  confidence: {
    overall_score: number(0-1),
    classification_confidence: number(0-1),
    interpretation_confidence: number(0-1),
    notes: string (optional)
  },

  metadata: {
    extracted_at: string (ISO),
    source_length: number,
    model_used: string
  }
}
```

---

## Data Flow Diagram

```
PDF Text
   │
   ├─► Input Validation ─────► PASS ─────┐
   │                                      │
   └─► FAIL ──► Error: "Text too short"  │
                                          │
                                          ▼
                              Jurisdiction Detection
                                          │
                                          ├─► US IRS Context
                                          ├─► UK HMRC Context
                                          └─► EU Context
                                          │
                                          ▼
                              Prompt Engineering
                                          │
                                          ├─► System Prompt
                                          ├─► User Prompt
                                          └─► Jurisdiction Hints
                                          │
                                          ▼
                              Claude API Call
                                          │
                                          ├─► Success ─────┐
                                          └─► API Error ───┘
                                                           │
                                                           ▼
                                          JSON Extraction & Parse
                                                           │
                                                           ├─► Valid JSON ───┐
                                                           └─► Parse Error ──┘
                                                                             │
                                                                             ▼
                                          Add Metadata
                                                                             │
                                                                             ▼
                                          Zod Schema Validation
                                                                             │
                                                                             ├─► Valid ────► TaxAlert
                                                                             └─► Invalid ──► Error
```

---

## Prompt Engineering Strategy

### System Prompt Structure

```
1. Role Definition
   "You are an expert tax analyst specializing in..."

2. Context
   "Your role is to extract and interpret tax notifications for BP..."

3. Critical Guidelines
   - Be precise and factual
   - Consider BP's energy operations
   - Priority assessment criteria
   - Confidence scoring rules

4. Output Format
   - JSON schema definition
   - Field descriptions
   - Example structure
```

### User Prompt Structure

```
1. Task Description
   "Extract structured tax alert information from..."

2. Document Content
   === TAX NOTIFICATION DOCUMENT ===
   [PDF TEXT]
   === END OF DOCUMENT ===

3. Specific Instructions
   - Focus on facts
   - Consider BP context
   - Provide actionable insights
   - Be conservative with confidence

4. Jurisdiction Hints (Dynamic)
   [US IRS / UK HMRC / EU specific guidance]
```

### Temperature Selection

**Temperature = 0.2** (Low)

**Reasoning**:
- Factual extraction task (not creative)
- Consistency required across extractions
- Minimize hallucination risk
- Reliable JSON output format

---

## Error Handling Strategy

### Error Categories

```
1. Input Errors
   ├─► Empty/null text → "PDF text is required"
   ├─► Too short → "PDF text too short (min 50 chars)"
   └─► Invalid format → "Unable to extract meaningful text"

2. API Errors
   ├─► Authentication → "Invalid API key"
   ├─► Rate limit → "API rate limit exceeded"
   ├─► Timeout → "API request timeout"
   └─► Service error → "Anthropic API error (status)"

3. Parsing Errors
   ├─► Invalid JSON → "Failed to parse JSON response"
   ├─► Missing fields → "Response missing required field: [field]"
   └─► Schema validation → "Schema validation failed: [errors]"

4. Business Logic Errors
   ├─► Low confidence → "Confidence below threshold - review required"
   ├─► Ambiguous document → "Unable to determine jurisdiction"
   └─► Non-tax document → "Document may not be tax-related"
```

### Error Recovery

```
IF API rate limit error
  → Log error
  → Wait with exponential backoff
  → Retry (max 3 attempts)
  → ELSE throw error

IF parsing error
  → Log raw response
  → Check for markdown wrapping
  → Attempt alternative parsing
  → ELSE throw error

IF validation error
  → Log specific field errors
  → Return partial data (if safe)
  → ELSE throw error
```

---

## Performance Characteristics

### Timing Breakdown

```
Operation                   Time (ms)    % of Total
────────────────────────────────────────────────────
Input Validation            5-10         0.1%
Jurisdiction Detection      10-20        0.2%
Prompt Construction         5-10         0.1%
Claude API Call            5000-8000    95.0%
Response Parsing            50-100       1.0%
Schema Validation          100-200       2.0%
Logging                     10-50        0.5%
────────────────────────────────────────────────────
TOTAL                      5180-8390    100%
```

**Average**: ~6.5 seconds per extraction

### Token Usage

```
Component                   Tokens      % of Total
────────────────────────────────────────────────────
System Prompt               800         20%
User Prompt (PDF text)      2000-3000   60%
Response (JSON)            500-800      20%
────────────────────────────────────────────────────
TOTAL per Request          3300-4600
```

**Cost Estimate** (Claude Sonnet 4):
- Input: 3500 tokens × $3/MTok = $0.0105
- Output: 650 tokens × $15/MTok = $0.0098
- **Total per extraction: ~$0.02**

### Scalability

**Sequential Processing**:
- 10 documents = ~65 seconds
- 100 documents = ~650 seconds (11 minutes)

**Batch Processing** (current):
- Sequential with error recovery
- Continues on individual failures
- Full logging per document

**Future Optimization**:
- Parallel processing (5 concurrent)
- Rate limit management
- Connection pooling
- 100 documents = ~130 seconds (2 minutes)

---

## Security Considerations

### API Key Management

```
✅ DO:
- Store in environment variables
- Use secret management systems
- Rotate keys regularly
- Restrict key permissions

❌ DON'T:
- Hardcode in source code
- Commit to version control
- Share keys between environments
- Log API keys
```

### Input Sanitization

```
✅ Validate:
- Minimum/maximum length
- Character encoding (UTF-8)
- Content type (text only)

❌ Accept:
- Binary data without parsing
- Untrusted file uploads without scanning
- Unvalidated user input
```

### Output Validation

```
✅ Validate:
- Schema compliance (Zod)
- Field constraints
- Enum values
- Data types

✅ Sanitize:
- Remove potential XSS in titles/summaries
- Validate URLs/dates
- Limit array sizes
```

---

## Testing Strategy

### Unit Tests

```
Test: Input validation
├─► Empty text → Error
├─► Short text → Error
└─► Valid text → Pass

Test: Jurisdiction detection
├─► IRS notice → US context
├─► HMRC brief → UK context
└─► EU directive → EU context

Test: Schema validation
├─► Valid alert → Pass
├─► Missing field → Error
└─► Invalid enum → Error

Test: Error handling
├─► API error → Proper error message
├─► Parse error → Fallback behavior
└─► Validation error → Field-level details
```

### Integration Tests

```
Test: End-to-end extraction
├─► Sample IRS notice → Valid TaxAlert
├─► Sample HMRC brief → Valid TaxAlert
└─► Sample EU directive → Valid TaxAlert

Test: Batch processing
├─► Multiple documents → All processed
├─► Mixed success/failure → Partial results
└─► All failures → Empty array with errors logged

Test: Confidence thresholds
├─► Clear document → High confidence (>0.85)
├─► Ambiguous document → Medium confidence (0.70-0.85)
└─► Unclear document → Low confidence (<0.70)
```

---

## Monitoring & Observability

### Key Metrics

```
Business Metrics:
- Extractions per day
- Average confidence score
- Priority distribution (CRITICAL/HIGH/MEDIUM/LOW)
- Country distribution (US/UK/EU/OTHER)

Performance Metrics:
- Average extraction time
- API latency
- Error rate
- Retry attempts

Quality Metrics:
- Validation failure rate
- Manual review rate (low confidence)
- Confidence score distribution
```

### Logging Events

```
INFO Events:
- Service initialization
- Extraction start
- Extraction complete
- Jurisdiction detected

WARN Events:
- Low confidence score
- Batch item failure
- Retry attempt
- Ambiguous jurisdiction

ERROR Events:
- API failure
- Validation failure
- Parse error
- Timeout
```

---

## Extension Points

### 1. Custom Jurisdictions

```typescript
// Add new jurisdiction context
export const CANADA_CRA_CONTEXT: JurisdictionContext = {
  country: "CA",
  authority: "Canada Revenue Agency (CRA)",
  commonTaxTypes: ["Corporate Tax", "GST/HST", ...],
  keyTerms: ["CRA", "Income Tax Act", ...],
  documentPatterns: [/Technical\s+Interpretation\s+\d+/i, ...]
};
```

### 2. Custom Tax Types

```typescript
// Extend TaxAlertSchema
tax_type: z.enum([
  ...existing types,
  "Carbon Tax",
  "Digital Services Tax",
  "Financial Transaction Tax"
])
```

### 3. Custom Validation Rules

```typescript
// Add domain-specific validation
const CustomTaxAlertSchema = TaxAlertSchema.extend({
  internal: z.object({
    department: z.enum(["Upstream", "Downstream", "Trading"]),
    impact_score: z.number().min(0).max(100),
    reviewer: z.string()
  })
});
```

### 4. Webhooks & Notifications

```typescript
// Add notification hooks
service.on('extraction_complete', (alert) => {
  if (alert.classification.priority === 'CRITICAL') {
    sendSlackNotification(alert);
    createJiraTicket(alert);
  }
});
```

---

## Future Enhancements

### Phase 2
- [ ] Parallel batch processing with rate limiting
- [ ] Webhook support for async processing
- [ ] PDF parsing integration (direct PDF → Alert)
- [ ] Change detection (compare vs previous versions)

### Phase 3
- [ ] Historical alert storage & analytics
- [ ] Trend detection (similar alerts over time)
- [ ] Multi-language support
- [ ] Custom prompt templates per jurisdiction

### Phase 4
- [ ] Real-time streaming extraction
- [ ] Automated action execution
- [ ] ML-based confidence calibration
- [ ] Integration with tax research databases

---

**Last Updated:** November 13, 2025
**Version:** 1.0.0
