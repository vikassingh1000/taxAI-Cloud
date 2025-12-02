import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { logger } from "./logger";

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * Zod schema for validating the extracted tax alert data
 */
export const TaxAlertSchema = z.object({
  classification: z.object({
    country: z.enum(["US", "UK", "EU", "OTHER"]).describe("Country/jurisdiction of the tax notification"),
    tax_type: z.enum([
      "Corporate Tax",
      "VAT",
      "Transfer Pricing",
      "GILTI",
      "Sales Tax",
      "Energy Tax",
      "Withholding Tax",
      "Customs Duty",
      "Other"
    ]).describe("Type of tax regulation"),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).describe("Priority level based on impact and urgency")
  }),

  content: z.object({
    title: z.string().min(5).max(200).describe("Concise title of the tax notification"),
    summary: z.string().min(50).max(500).describe("2-3 sentence summary of the notification"),
    key_changes: z.array(z.string()).min(1).max(10).describe("List of key regulatory changes"),
    affected_entities: z.array(z.string()).min(1).max(15).describe("Types of entities affected (e.g., 'Oil & Gas Companies', 'Renewable Energy Producers')")
  }),

  interpretation: z.object({
    bp_specific_impact: z.string().min(50).max(800).describe("Analysis of how this affects BP's operations specifically"),
    required_actions: z.array(z.string()).min(1).max(10).describe("Concrete action items BP should take"),
    compliance_risk: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).describe("Risk level if not addressed"),
    estimated_deadline: z.string().nullable().describe("Deadline for compliance (ISO date or descriptive like 'Q1 2025')")
  }),

  confidence: z.object({
    overall_score: z.number().min(0).max(1).describe("Overall confidence in the extraction (0-1)"),
    classification_confidence: z.number().min(0).max(1),
    interpretation_confidence: z.number().min(0).max(1),
    notes: z.string().optional().describe("Any caveats or uncertainty notes")
  }),

  metadata: z.object({
    extracted_at: z.string().describe("ISO timestamp of extraction"),
    source_length: z.number().describe("Character count of input PDF text"),
    model_used: z.string().describe("AI model version used")
  })
});

export type TaxAlert = z.infer<typeof TaxAlertSchema>;

// ============================================================================
// EXTRACTION SERVICE
// ============================================================================

export class TaxAlertExtractionService {
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model: string = "claude-sonnet-4-20250514") {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!key) {
      throw new Error(
        "Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or pass it to constructor."
      );
    }

    this.client = new Anthropic({ apiKey: key });
    this.model = model;

    logger.info("TaxAlertExtractionService initialized", { model: this.model });
  }

  /**
   * Main extraction method: Takes PDF text and returns structured tax alert data
   */
  async extractTaxAlert(pdfText: string): Promise<TaxAlert> {
    const startTime = Date.now();

    try {
      logger.info("Starting tax alert extraction", {
        textLength: pdfText.length,
        preview: pdfText.substring(0, 100) + "..."
      });

      // Validate input
      if (!pdfText || pdfText.trim().length < 50) {
        throw new Error("PDF text is too short or empty. Minimum 50 characters required.");
      }

      // Call Claude API with structured prompt
      const response = await this.callClaudeAPI(pdfText);

      // Parse and validate response
      const extractedData = this.parseAndValidate(response, pdfText);

      const duration = Date.now() - startTime;
      logger.info("Tax alert extraction completed", {
        duration_ms: duration,
        country: extractedData.classification.country,
        priority: extractedData.classification.priority,
        confidence: extractedData.confidence.overall_score
      });

      return extractedData;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Tax alert extraction failed", {
        error: error instanceof Error ? error.message : String(error),
        duration_ms: duration,
        textLength: pdfText.length
      });
      throw error;
    }
  }

  /**
   * Calls Claude API with carefully engineered prompt
   */
  private async callClaudeAPI(pdfText: string): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(pdfText);

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.2, // Low temperature for consistent, factual extraction
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ]
      });

      // Extract text from response
      const responseText = message.content
        .filter(block => block.type === "text")
        .map(block => block.type === "text" ? block.text : "")
        .join("\n");

      logger.debug("Claude API response received", {
        responseLength: responseText.length,
        usage: message.usage
      });

      return responseText;

    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        logger.error("Anthropic API error", {
          status: error.status,
          message: error.message
          // type: error.type
        });
        throw new Error(`Anthropic API error (${error.status}): ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * System prompt engineering for tax alert extraction
   */
  private buildSystemPrompt(): string {
    return `You are an expert tax analyst specializing in extracting and interpreting tax notifications for BP (British Petroleum), a global energy company.

Your role is to:
1. Accurately extract structured information from tax notifications (US IRS, UK HMRC, EU, etc.)
2. Classify the notification by country, tax type, and priority
3. Provide BP-specific interpretation and action items
4. Assess compliance risks and deadlines

CRITICAL GUIDELINES:
- Be precise and factual - only extract information explicitly stated in the document
- For BP-specific impact: Consider BP's global energy operations (oil & gas, renewables, trading, refining)
- Priority assessment: CRITICAL = immediate compliance risk or major financial impact (>$10M), HIGH = significant impact (<90 days), MEDIUM = moderate impact, LOW = informational
- Tax type classification: Use the most specific category available
- Confidence scoring: Be honest about uncertainty - score lower if document is ambiguous
- Deadlines: Extract exact dates if stated, otherwise provide best estimate with caveats

IMPORTANT - EXACT ENUM VALUES:
Use ONLY these exact values (no additional text or descriptions):
- country: "US", "UK", "EU", or "OTHER"
- tax_type: "Corporate Tax", "VAT", "Transfer Pricing", "GILTI", "Sales Tax", "Energy Tax", "Withholding Tax", "Customs Duty", or "Other"
- priority: "CRITICAL", "HIGH", "MEDIUM", or "LOW"
- compliance_risk: "CRITICAL", "HIGH", "MEDIUM", or "LOW"

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this structure (no markdown, no additional text):
{
  "classification": { "country": "US", "tax_type": "GILTI", "priority": "HIGH" },
  "content": { "title": "...", "summary": "...", "key_changes": [...], "affected_entities": [...] },
  "interpretation": { "bp_specific_impact": "...", "required_actions": [...], "compliance_risk": "HIGH", "estimated_deadline": "..." },
  "confidence": { "overall_score": 0.92, "classification_confidence": 0.95, "interpretation_confidence": 0.89, "notes": "..." }
}`;
  }

  /**
   * User prompt with the actual PDF text
   */
  private buildUserPrompt(pdfText: string): string {
    return `Extract structured tax alert information from the following tax notification document:

=== TAX NOTIFICATION DOCUMENT ===
${pdfText}
=== END OF DOCUMENT ===

Please analyze this document and return a JSON object with the classification, content summary, BP-specific interpretation, and confidence scores.

Remember:
- Focus on facts stated in the document
- Consider BP's global energy business context (upstream oil & gas, downstream refining, renewables, trading)
- Provide actionable insights and specific deadline information
- Be conservative with confidence scores if information is unclear`;
  }

  /**
   * Normalize enum values that may have extra descriptive text
   * Example: "GILTI (Global Intangible Low-Taxed Income)" -> "GILTI"
   */
  private normalizeEnumValues(data: any): any {
    if (!data || typeof data !== 'object') return data;

    // Tax type mapping - extract base value from descriptive strings
    const taxTypeMapping: Record<string, string> = {
      'Corporate Tax': 'Corporate Tax',
      'VAT': 'VAT',
      'Transfer Pricing': 'Transfer Pricing',
      'GILTI': 'GILTI',
      'Sales Tax': 'Sales Tax',
      'Energy Tax': 'Energy Tax',
      'Withholding Tax': 'Withholding Tax',
      'Customs Duty': 'Customs Duty',
      'Other': 'Other'
    };

    // Priority/Risk mapping
    const priorityMapping: Record<string, string> = {
      'CRITICAL': 'CRITICAL',
      'HIGH': 'HIGH',
      'MEDIUM': 'MEDIUM',
      'LOW': 'LOW'
    };

    // Country mapping
    const countryMapping: Record<string, string> = {
      'US': 'US',
      'UK': 'UK',
      'EU': 'EU',
      'OTHER': 'OTHER'
    };

    // Clone the data to avoid mutation
    const normalized = { ...data };

    // Normalize classification fields
    if (normalized.classification) {
      // Normalize country
      if (normalized.classification.country) {
        const country = normalized.classification.country.toUpperCase();
        for (const [key, value] of Object.entries(countryMapping)) {
          if (country.includes(key)) {
            normalized.classification.country = value;
            break;
          }
        }
      }

      // Normalize tax_type - find matching base type
      if (normalized.classification.tax_type) {
        const taxType = normalized.classification.tax_type;
        let matched = false;

        for (const [key, value] of Object.entries(taxTypeMapping)) {
          if (taxType.includes(key)) {
            normalized.classification.tax_type = value;
            matched = true;
            break;
          }
        }

        // If no match found, try to extract first part before parenthesis
        if (!matched && taxType.includes('(')) {
          const baseType = taxType.split('(')[0].trim();
          if (taxTypeMapping[baseType]) {
            normalized.classification.tax_type = baseType;
          } else {
            normalized.classification.tax_type = 'Other';
          }
        }
      }

      // Normalize priority
      if (normalized.classification.priority) {
        const priority = normalized.classification.priority.toUpperCase();
        for (const [key, value] of Object.entries(priorityMapping)) {
          if (priority.includes(key)) {
            normalized.classification.priority = value;
            break;
          }
        }
      }
    }

    // Normalize interpretation.compliance_risk
    if (normalized.interpretation?.compliance_risk) {
      const risk = normalized.interpretation.compliance_risk.toUpperCase();
      for (const [key, value] of Object.entries(priorityMapping)) {
        if (risk.includes(key)) {
          normalized.interpretation.compliance_risk = value;
          break;
        }
      }
    }

    return normalized;
  }

  /**
   * Parse JSON response and validate against schema
   */
  private parseAndValidate(responseText: string, originalText: string): TaxAlert {
    try {
      // Extract JSON from response (handle potential markdown wrapping)
      let jsonText = responseText.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith("```")) {
        const matches = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (matches && matches[1]) {
          jsonText = matches[1];
        }
      }

      // Parse JSON
      const parsed = JSON.parse(jsonText);

      // Normalize enum values before validation
      const normalized = this.normalizeEnumValues(parsed);

      // Add metadata
      const withMetadata = {
        ...normalized,
        metadata: {
          extracted_at: new Date().toISOString(),
          source_length: originalText.length,
          model_used: this.model
        }
      };

      // Validate against Zod schema
      const validated = TaxAlertSchema.parse(withMetadata);

      logger.debug("JSON validation successful", {
        hasAllFields: true,
        confidence: validated.confidence.overall_score
      });

      return validated;

    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Schema validation failed", {
          errors: error.errors,
          response_preview: responseText.substring(0, 200)
        });
        throw new Error(`Schema validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }

      if (error instanceof SyntaxError) {
        logger.error("JSON parse failed", {
          error: error.message,
          response_preview: responseText.substring(0, 200)
        });
        throw new Error(`Failed to parse JSON response: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Batch processing: Extract alerts from multiple PDF texts
   */
  async extractBatch(pdfTexts: string[]): Promise<TaxAlert[]> {
    logger.info("Starting batch extraction", { count: pdfTexts.length });

    const results: TaxAlert[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < pdfTexts.length; i++) {
      try {
        const result = await this.extractTaxAlert(pdfTexts[i]);
        results.push(result);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ index: i, error: errorMsg });
        logger.warn(`Batch item ${i} failed`, { error: errorMsg });
      }
    }

    logger.info("Batch extraction completed", {
      total: pdfTexts.length,
      successful: results.length,
      failed: errors.length
    });

    if (errors.length > 0) {
      logger.error("Batch extraction had failures", { errors });
    }

    return results;
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Quick extraction function for simple use cases
 */
export async function extractTaxAlert(pdfText: string, apiKey?: string): Promise<TaxAlert> {
  const service = new TaxAlertExtractionService(apiKey);
  return service.extractTaxAlert(pdfText);
}

export default TaxAlertExtractionService;