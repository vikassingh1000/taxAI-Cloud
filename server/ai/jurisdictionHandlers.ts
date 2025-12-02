/**
 * Specialized handlers for different tax jurisdiction notifications
 * Provides context-specific parsing and validation for US IRS, UK HMRC, and EU notifications
 */

import { logger } from "./logger";

export interface JurisdictionContext {
  country: string;
  authority: string;
  commonTaxTypes: string[];
  dateFormats: string[];
  keyTerms: string[];
  documentPatterns: RegExp[];
}

/**
 * US IRS (Internal Revenue Service) context
 */
export const US_IRS_CONTEXT: JurisdictionContext = {
  country: "US",
  authority: "Internal Revenue Service (IRS)",
  commonTaxTypes: [
    "Corporate Tax",
    "GILTI",
    "Transfer Pricing",
    "Withholding Tax",
    "Sales Tax",
    "Energy Tax"
  ],
  dateFormats: ["MM/DD/YYYY", "YYYY-MM-DD"],
  keyTerms: [
    "IRS",
    "Internal Revenue Code",
    "IRC",
    "Treasury Regulation",
    "Treas. Reg.",
    "Revenue Ruling",
    "Rev. Rul.",
    "Notice",
    "Publication",
    "Form",
    "Schedule",
    "Tax Year",
    "Fiscal Year",
    "GILTI",
    "FDII",
    "Subpart F",
    "Section 482",
    "Advance Pricing Agreement",
    "APA"
  ],
  documentPatterns: [
    /Notice\s+\d{4}-\d+/i,
    /Revenue\s+Ruling\s+\d{4}-\d+/i,
    /Rev\.\s*Rul\.\s+\d{4}-\d+/i,
    /Treasury\s+Regulation\s+§\s*\d+\.\d+/i,
    /IRC\s+§\s*\d+/i,
    /Form\s+\d{3,4}[A-Z]?/i
  ]
};

/**
 * UK HMRC (Her Majesty's Revenue and Customs) context
 */
export const UK_HMRC_CONTEXT: JurisdictionContext = {
  country: "UK",
  authority: "His Majesty's Revenue and Customs (HMRC)",
  commonTaxTypes: [
    "Corporate Tax",
    "VAT",
    "Transfer Pricing",
    "Withholding Tax",
    "Energy Tax",
    "Customs Duty"
  ],
  dateFormats: ["DD/MM/YYYY", "YYYY-MM-DD"],
  keyTerms: [
    "HMRC",
    "Corporation Tax",
    "Value Added Tax",
    "VAT",
    "CTA",
    "Corporation Tax Act",
    "TCGA",
    "Taxation of Chargeable Gains Act",
    "Finance Act",
    "Finance Bill",
    "Statutory Instrument",
    "SI",
    "Tax Year",
    "Accounting Period",
    "Diverted Profits Tax",
    "DPT",
    "EPL",
    "Energy Profits Levy",
    "Ring Fence Corporation Tax",
    "RFCT"
  ],
  documentPatterns: [
    /Revenue\s+&\s+Customs\s+Brief\s+\d+\/\d{4}/i,
    /Tax\s+Information\s+and\s+Impact\s+Note/i,
    /TIIN/i,
    /Finance\s+Act\s+\d{4}/i,
    /SI\s+\d{4}\/\d+/i,
    /Statutory\s+Instrument\s+\d{4}\/\d+/i
  ]
};

/**
 * EU (European Union) context
 */
export const EU_CONTEXT: JurisdictionContext = {
  country: "EU",
  authority: "European Commission / Member States",
  commonTaxTypes: [
    "VAT",
    "Corporate Tax",
    "Transfer Pricing",
    "Customs Duty",
    "Energy Tax",
    "Withholding Tax"
  ],
  dateFormats: ["DD.MM.YYYY", "YYYY-MM-DD"],
  keyTerms: [
    "EU Directive",
    "Council Directive",
    "VAT Directive",
    "ATAD",
    "Anti-Tax Avoidance Directive",
    "CBAM",
    "Carbon Border Adjustment Mechanism",
    "DAC",
    "Directive on Administrative Cooperation",
    "BEPS",
    "Pillar One",
    "Pillar Two",
    "OECD",
    "Transfer Pricing",
    "State Aid"
  ],
  documentPatterns: [
    /Directive\s+\d{4}\/\d+\/EU/i,
    /Council\s+Directive\s+\d{4}\/\d+/i,
    /Regulation\s+\(EU\)\s+\d{4}\/\d+/i,
    /COM\(\d{4}\)\s+\d+/i
  ]
};

/**
 * Jurisdiction detector - analyzes PDF text to determine source
 */
export class JurisdictionDetector {

  /**
   * Detect jurisdiction from PDF text content
   */
  static detect(pdfText: string): JurisdictionContext {
    const text = pdfText.toLowerCase();

    // Score each jurisdiction
    const scores = {
      US: this.scoreJurisdiction(pdfText, US_IRS_CONTEXT),
      UK: this.scoreJurisdiction(pdfText, UK_HMRC_CONTEXT),
      EU: this.scoreJurisdiction(pdfText, EU_CONTEXT)
    };

    logger.debug("Jurisdiction detection scores", scores);

    // Return highest scoring jurisdiction
    const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);

    if (winner[1] === 0) {
      logger.warn("No jurisdiction match found, defaulting to US IRS");
      return US_IRS_CONTEXT;
    }

    logger.info(`Detected jurisdiction: ${winner[0]}`, { confidence: winner[1] });

    switch (winner[0]) {
      case "UK": return UK_HMRC_CONTEXT;
      case "EU": return EU_CONTEXT;
      default: return US_IRS_CONTEXT;
    }
  }

  /**
   * Score a jurisdiction based on keyword and pattern matches
   */
  private static scoreJurisdiction(text: string, context: JurisdictionContext): number {
    let score = 0;
    const lowerText = text.toLowerCase();

    // Check authority name (high weight)
    if (lowerText.includes(context.authority.toLowerCase())) {
      score += 10;
    }

    // Check key terms (medium weight)
    for (const term of context.keyTerms) {
      if (lowerText.includes(term.toLowerCase())) {
        score += 2;
      }
    }

    // Check document patterns (high weight)
    for (const pattern of context.documentPatterns) {
      if (pattern.test(text)) {
        score += 5;
      }
    }

    return score;
  }

  /**
   * Extract document reference numbers (e.g., "Notice 2024-45", "Revenue & Customs Brief 12/2024")
   */
  static extractDocumentReference(pdfText: string, context: JurisdictionContext): string | null {
    for (const pattern of context.documentPatterns) {
      const match = pdfText.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return null;
  }

  /**
   * Validate that extracted country matches detected jurisdiction
   */
  static validateCountry(extractedCountry: string, detectedContext: JurisdictionContext): boolean {
    return extractedCountry === detectedContext.country || extractedCountry === "OTHER";
  }
}

/**
 * Enhanced extraction hints for specific jurisdictions
 */
export class JurisdictionHints {

  /**
   * Get jurisdiction-specific extraction hints to append to prompt
   */
  static getHints(context: JurisdictionContext): string {
    switch (context.country) {
      case "US":
        return this.getUSHints();
      case "UK":
        return this.getUKHints();
      case "EU":
        return this.getEUHints();
      default:
        return "";
    }
  }

  private static getUSHints(): string {
    return `
US IRS SPECIFIC GUIDANCE:
- Look for IRS Notice numbers, Revenue Rulings, or Treasury Regulations
- Tax types commonly include: Corporate Tax, GILTI, Transfer Pricing, FDII
- Dates typically in MM/DD/YYYY format
- For BP: Consider implications for US upstream operations, refineries, and trading entities
- GILTI and Subpart F income are critical for international operations
- Energy-specific: Look for Section 45, 48 (renewable credits), Section 29 (unconventional fuel)
`;
  }

  private static getUKHints(): string {
    return `
UK HMRC SPECIFIC GUIDANCE:
- Look for Revenue & Customs Briefs, Finance Act references, Statutory Instruments
- Tax types commonly include: Corporation Tax, VAT, Energy Profits Levy (EPL), Ring Fence CT
- Dates typically in DD/MM/YYYY format
- For BP: Consider implications for North Sea operations, refineries, retail network
- EPL is CRITICAL for upstream oil & gas operations
- Ring Fence Corporation Tax applies specifically to oil & gas extraction activities
`;
  }

  private static getEUHints(): string {
    return `
EU SPECIFIC GUIDANCE:
- Look for EU Directives, Council Directives, Regulations
- Tax types commonly include: VAT, CBAM (Carbon Border Adjustment), ATAD provisions
- Multiple member states may be affected
- For BP: Consider implications across European refineries, trading hubs, renewable projects
- CBAM is CRITICAL for carbon-intensive operations
- State Aid rules affect tax rulings and special regimes
`;
  }
}

export default {
  US_IRS_CONTEXT,
  UK_HMRC_CONTEXT,
  EU_CONTEXT,
  JurisdictionDetector,
  JurisdictionHints
};
