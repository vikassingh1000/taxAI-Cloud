/**
 * Example usage of Tax Alert Extraction Service
 *
 * Run this file with:
 *   npx tsx server/ai/example.ts
 *
 * Make sure ANTHROPIC_API_KEY is set in .env file
 */

import 'dotenv/config';
import TaxAlertExtractionService, { extractTaxAlert, TaxAlert } from './taxAlertExtraction';
import { JurisdictionDetector } from './jurisdictionHandlers';
import { logger, LogLevel } from './logger';
import { getDbService } from '../db/taxAlertService';

// Enable debug logging for demo
logger.setLevel(LogLevel.DEBUG);

// ============================================================================
// SAMPLE TAX NOTIFICATIONS
// ============================================================================

/**
 * Sample US IRS Notice about GILTI
 */
const SAMPLE_IRS_NOTICE = `
DEPARTMENT OF THE TREASURY
INTERNAL REVENUE SERVICE
Washington, DC 20224

Notice 2024-45
November 15, 2024

GUIDANCE ON GLOBAL INTANGIBLE LOW-TAXED INCOME (GILTI) REGULATIONS

PURPOSE

This notice provides updated guidance regarding the application of section 951A
(Global Intangible Low-Taxed Income, or GILTI) to controlled foreign corporations
(CFCs) in the oil and gas sector. This notice clarifies the treatment of income
from qualified oil and gas extraction activities for tax years beginning after
December 31, 2024.

BACKGROUND

Section 951A, enacted as part of the Tax Cuts and Jobs Act of 2017, requires
United States shareholders of CFCs to include GILTI in their gross income. The
GILTI provisions are designed to ensure that income earned by foreign subsidiaries
of U.S. companies is subject to a minimum level of U.S. taxation.

NEW GUIDANCE

Effective for tax years beginning after December 31, 2024, the Treasury and IRS
are providing the following clarifications:

1. QUALIFIED OIL AND GAS EXTRACTION INCOME: Income derived from qualified oil and
gas extraction activities, as defined in section 907(c)(2), will be treated as
tested income for GILTI purposes. This includes income from the extraction of
crude oil, natural gas, and related hydrocarbons.

2. DEPRECIATION TREATMENT: Depreciation deductions for qualified property used in
oil and gas extraction activities will be allowed as a full deduction in computing
tested income, provided the property meets the requirements of section 951A(d).

3. FOREIGN TAX CREDIT COORDINATION: Foreign oil and gas extraction taxes paid or
accrued by CFCs will be eligible for the section 250(a)(1)(B) deduction, subject
to the 80% limitation under section 250(a)(3).

4. REPORTING REQUIREMENTS: United States shareholders must file Form 8992
(U.S. Shareholder Calculation of Global Intangible Low-Taxed Income) with their
annual tax return, including a separate schedule for oil and gas extraction income.

EFFECTIVE DATE

This guidance applies to tax years beginning after December 31, 2024. Taxpayers
may elect to apply this guidance retroactively to tax years beginning after
December 31, 2023.

DEADLINE FOR COMMENTS

Taxpayers and practitioners may submit comments on this notice by January 31, 2025.

For more information, contact the Office of Associate Chief Counsel (International)
at (202) 317-6934.
`;

/**
 * Sample UK HMRC Revenue & Customs Brief about Energy Profits Levy
 */
const SAMPLE_HMRC_BRIEF = `
HM REVENUE & CUSTOMS

Revenue & Customs Brief 18/2024
Date: 12 November 2024

ENERGY PROFITS LEVY: EXTENSION TO 31 MARCH 2030

1. SUMMARY

This brief announces the extension of the Energy Profits Levy (EPL) until
31 March 2030 and increases the EPL rate from 35% to 38% for accounting periods
beginning on or after 1 January 2025.

2. BACKGROUND

The Energy Profits Levy was introduced in Finance Act 2022 to ensure that oil and
gas companies operating in the UK Continental Shelf make a fair and proportionate
contribution during a period of extraordinary profits driven by elevated commodity
prices.

The EPL is charged on the profits of oil and gas companies from their UK upstream
activities (extraction of oil and gas from the UK and UK Continental Shelf) at a
rate of 35%, in addition to the 30% Ring Fence Corporation Tax rate and the 10%
supplementary charge. This brings the total tax rate on UK oil and gas profits to
75% prior to this change.

3. CHANGES ANNOUNCED

The Government has announced the following changes to the EPL regime:

a) RATE INCREASE: The EPL rate will increase from 35% to 38% for accounting
periods beginning on or after 1 January 2025. This increases the overall tax rate
on UK oil and gas profits from 75% to 78%.

b) EXTENSION: The EPL sunset date is extended from 31 March 2028 to 31 March 2030.

c) INVESTMENT ALLOWANCE: The investment allowance will continue at 80% for
qualifying capital expenditure on new oil and gas extraction projects. However,
expenditure on new oil fields approved after 1 January 2025 will be subject to
enhanced scrutiny regarding carbon intensity.

4. AFFECTED COMPANIES

This change affects all companies with:
- UK upstream oil and gas activities
- Ring fence trades as defined in sections 276-279 of CTA 2010
- Profits arising from UK Continental Shelf extraction activities

Companies engaged solely in downstream activities (refining, retail) or renewable
energy generation are NOT affected by this measure.

5. COMPLIANCE REQUIREMENTS

Companies affected by these changes must:

a) Update their corporation tax computations to reflect the new 38% EPL rate for
periods beginning on or after 1 January 2025

b) File Form CT600 (Corporation Tax Return) and supplementary pages RFCT1 (Ring
Fence Corporation Tax) and EPL1 (Energy Profits Levy) with their annual return

c) Make quarterly instalment payments if profits exceed £1.5 million per annum

d) Maintain contemporaneous documentation of capital expenditure qualifying for
the investment allowance

6. TRANSITIONAL RULES

For accounting periods straddling 1 January 2025, profits should be time-apportioned
on a just and reasonable basis between the period before 1 January 2025 (35% rate)
and the period on or after 1 January 2025 (38% rate).

7. DEADLINE FOR COMPLIANCE

First instalment payments at the new 38% rate are due by 31 March 2025 for
companies with quarterly payment obligations.

Annual returns for the tax year ending 31 December 2025 are due by 31 December 2026.

8. FURTHER INFORMATION

Full technical details will be published in Finance Bill 2025, expected in
December 2024. Draft legislation and an accompanying Tax Information and Impact
Note (TIIN) will be made available on www.gov.uk.

9. CONTACT

For queries regarding this brief, please contact:
HMRC Oil and Gas Taxation Team
Email: oilandgas.team@hmrc.gov.uk
Tel: 03000 585 412
`;

// ============================================================================
// EXAMPLE FUNCTIONS
// ============================================================================

/**
 * Example 1: Simple extraction with convenience function
 */
async function example1_SimpleExtraction() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 1: Simple Extraction (IRS Notice)");
  console.log("=".repeat(80) + "\n");

  try {
    const alert = await extractTaxAlert(SAMPLE_IRS_NOTICE);

    console.log("✅ Extraction successful!\n");
    console.log("📋 Classification:");
    console.log(`   Country: ${alert.classification.country}`);
    console.log(`   Tax Type: ${alert.classification.tax_type}`);
    console.log(`   Priority: ${alert.classification.priority}\n`);

    console.log("📄 Content:");
    console.log(`   Title: ${alert.content.title}`);
    console.log(`   Summary: ${alert.content.summary}\n`);

    console.log("🎯 BP-Specific Impact:");
    console.log(`   ${alert.interpretation.bp_specific_impact}\n`);

    console.log("📊 Confidence Scores:");
    console.log(`   Overall: ${(alert.confidence.overall_score * 100).toFixed(1)}%`);
    console.log(`   Classification: ${(alert.confidence.classification_confidence * 100).toFixed(1)}%`);
    console.log(`   Interpretation: ${(alert.confidence.interpretation_confidence * 100).toFixed(1)}%\n`);

    return alert;

  } catch (error) {
    console.error("❌ Extraction failed:", error);
    throw error;
  }
}

/**
 * Example 2: Advanced extraction with service class (HMRC Brief)
 */
async function example2_AdvancedExtraction() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 2: Advanced Extraction with Service Class (HMRC Brief)");
  console.log("=".repeat(80) + "\n");

  try {
    // Initialize service
    const service = new TaxAlertExtractionService();

    // Detect jurisdiction first
    const context = JurisdictionDetector.detect(SAMPLE_HMRC_BRIEF);
    console.log(`🔍 Detected Jurisdiction: ${context.country} - ${context.authority}\n`);

    // Extract document reference
    const docRef = JurisdictionDetector.extractDocumentReference(SAMPLE_HMRC_BRIEF, context);
    console.log(`📄 Document Reference: ${docRef}\n`);

    // Extract alert
    const alert = await service.extractTaxAlert(SAMPLE_HMRC_BRIEF);

    console.log("✅ Extraction successful!\n");
    console.log("⚠️  Priority Assessment:");
    console.log(`   Priority: ${alert.classification.priority}`);
    console.log(`   Compliance Risk: ${alert.interpretation.compliance_risk}`);
    console.log(`   Deadline: ${alert.interpretation.estimated_deadline}\n`);

    console.log("🔧 Required Actions:");
    alert.interpretation.required_actions.forEach((action, idx) => {
      console.log(`   ${idx + 1}. ${action}`);
    });
    console.log();

    console.log("🏢 Affected Entities:");
    alert.content.affected_entities.forEach((entity, idx) => {
      console.log(`   • ${entity}`);
    });
    console.log();

    return alert;

  } catch (error) {
    console.error("❌ Extraction failed:", error);
    throw error;
  }
}

/**
 * Example 3: Batch processing
 */
async function example3_BatchProcessing() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 3: Batch Processing (Multiple Documents)");
  console.log("=".repeat(80) + "\n");

  try {
    const service = new TaxAlertExtractionService();

    // Process both sample documents
    const documents = [SAMPLE_IRS_NOTICE, SAMPLE_HMRC_BRIEF];
    console.log(`📦 Processing ${documents.length} documents...\n`);

    const alerts = await service.extractBatch(documents);

    console.log(`✅ Batch processing complete: ${alerts.length}/${documents.length} successful\n`);

    // Summary table
    console.log("📊 Results Summary:");
    console.log("─".repeat(80));
    console.log("Country | Tax Type          | Priority | Confidence | Title");
    console.log("─".repeat(80));

    alerts.forEach(alert => {
      const confidence = (alert.confidence.overall_score * 100).toFixed(0) + "%";
      const title = alert.content.title.substring(0, 35) + "...";
      console.log(
        `${alert.classification.country.padEnd(7)} | ` +
        `${alert.classification.tax_type.padEnd(17)} | ` +
        `${alert.classification.priority.padEnd(8)} | ` +
        `${confidence.padEnd(10)} | ` +
        `${title}`
      );
    });
    console.log("─".repeat(80) + "\n");

    return alerts;

  } catch (error) {
    console.error("❌ Batch processing failed:", error);
    throw error;
  }
}

/**
 * Example 4: Error handling
 */
async function example4_ErrorHandling() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 4: Error Handling");
  console.log("=".repeat(80) + "\n");

  const testCases = [
    {
      name: "Empty text",
      text: "",
      expectedError: "too short"
    },
    {
      name: "Too short",
      text: "Tax notice",
      expectedError: "too short"
    },
    {
      name: "Invalid API key",
      text: SAMPLE_IRS_NOTICE,
      useInvalidKey: true,
      expectedError: "API"
    }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 Test: ${testCase.name}`);

    try {
      if (testCase.useInvalidKey) {
        const service = new TaxAlertExtractionService("invalid-key");
        await service.extractTaxAlert(testCase.text);
      } else {
        await extractTaxAlert(testCase.text);
      }

      console.log(`   ❌ Expected error but got success\n`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isExpected = errorMsg.toLowerCase().includes(testCase.expectedError.toLowerCase());

      if (isExpected) {
        console.log(`   ✅ Correctly caught error: ${errorMsg.substring(0, 60)}...\n`);
      } else {
        console.log(`   ⚠️  Unexpected error: ${errorMsg}\n`);
      }
    }
  }
}

/**
 * Example 5: Confidence threshold filtering
 */
async function example5_ConfidenceFiltering() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 5: Confidence Threshold Filtering");
  console.log("=".repeat(80) + "\n");

  const CONFIDENCE_THRESHOLD = 0.75;

  try {
    const alert = await extractTaxAlert(SAMPLE_IRS_NOTICE);

    console.log(`🎯 Confidence Threshold: ${CONFIDENCE_THRESHOLD * 100}%\n`);
    console.log(`📊 Overall Confidence: ${(alert.confidence.overall_score * 100).toFixed(1)}%`);
    console.log(`📊 Classification Confidence: ${(alert.confidence.classification_confidence * 100).toFixed(1)}%`);
    console.log(`📊 Interpretation Confidence: ${(alert.confidence.interpretation_confidence * 100).toFixed(1)}%\n`);

    if (alert.confidence.overall_score >= CONFIDENCE_THRESHOLD) {
      console.log("✅ PASS: Confidence meets threshold - auto-approve for processing\n");
    } else {
      console.log("⚠️  REVIEW REQUIRED: Confidence below threshold - flag for manual review\n");

      if (alert.confidence.notes) {
        console.log(`📝 Confidence Notes: ${alert.confidence.notes}\n`);
      }
    }

    // Check individual confidence scores
    if (alert.confidence.classification_confidence < CONFIDENCE_THRESHOLD) {
      console.log("⚠️  Classification confidence low - verify country/tax type\n");
    }

    if (alert.confidence.interpretation_confidence < CONFIDENCE_THRESHOLD) {
      console.log("⚠️  Interpretation confidence low - verify BP-specific impact analysis\n");
    }

    return alert;

  } catch (error) {
    console.error("❌ Confidence filtering failed:", error);
    throw error;
  }
}

/**
 * Example 6: Save to database
 */
async function example6_SaveToDatabase() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 6: Extract and Save to Database");
  console.log("=".repeat(80) + "\n");

  try {
    // Get database service
    const db = getDbService();

    // Extract both sample documents
    console.log("📄 Extracting IRS Notice...");
    const irsAlert = await extractTaxAlert(SAMPLE_IRS_NOTICE);
    console.log("✅ IRS Notice extracted\n");

    console.log("📄 Extracting HMRC Brief...");
    const hmrcAlert = await extractTaxAlert(SAMPLE_HMRC_BRIEF);
    console.log("✅ HMRC Brief extracted\n");

    // Save to database
    console.log("💾 Saving to database...\n");

    const savedIrs = await db.createFromAiOutput(
      irsAlert,
      "IRS-Notice-2024-45.pdf",
      SAMPLE_IRS_NOTICE
    );

    const savedHmrc = await db.createFromAiOutput(
      hmrcAlert,
      "HMRC-Brief-18-2024.pdf",
      SAMPLE_HMRC_BRIEF
    );

    console.log("\n✅ Saved to database successfully!\n");
    console.log("📊 Saved Alert IDs:");
    console.log(`   IRS Notice:  ID ${savedIrs.id}`);
    console.log(`   HMRC Brief:  ID ${savedHmrc.id}\n`);

    // Get statistics
    const stats = await db.getStats();
    console.log("📈 Database Statistics:");
    console.log(`   Total Alerts: ${stats.total}`);
    console.log(`   Average Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%\n`);

    console.log("🔍 View database:");
    console.log("   Statistics: npm run db:stats");
    console.log("   Browser:    npm run db:studio\n");

    return { savedIrs, savedHmrc, stats };

  } catch (error) {
    console.error("❌ Database save failed:", error);
    throw error;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║                  TAX ALERT EXTRACTION SERVICE - EXAMPLES                  ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("\n❌ ERROR: ANTHROPIC_API_KEY not found in environment variables");
    console.error("   Please set it in your .env file or environment\n");
    process.exit(1);
  }

  console.log("\n✅ API Key configured");
  console.log(`📍 Working Directory: ${process.cwd()}`);
  console.log(`🤖 Service initialized and ready\n`);

  try {
    // Run all examples
    await example1_SimpleExtraction();
    await example2_AdvancedExtraction();
    await example3_BatchProcessing();
    await example4_ErrorHandling();
    await example5_ConfidenceFiltering();
    await example6_SaveToDatabase();

    console.log("\n" + "=".repeat(80));
    console.log("✅ ALL EXAMPLES COMPLETED SUCCESSFULLY");
    console.log("=".repeat(80) + "\n");

  } catch (error) {
    console.error("\n❌ Example execution failed:");
    console.error(error);
    process.exit(1);
  }
}

// Run examples if executed directly
// In ES modules, we check if this file is the entry point
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for testing
export {
  SAMPLE_IRS_NOTICE,
  SAMPLE_HMRC_BRIEF,
  example1_SimpleExtraction,
  example2_AdvancedExtraction,
  example3_BatchProcessing,
  example4_ErrorHandling,
  example5_ConfidenceFiltering,
  example6_SaveToDatabase
};
