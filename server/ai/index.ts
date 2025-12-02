/**
 * Tax Alert Extraction Service
 * Main entry point for all exports
 *
 * Usage:
 *   import { extractTaxAlert, TaxAlertExtractionService } from './server/ai';
 */

// Main service and types
export { default as TaxAlertExtractionService } from './taxAlertExtraction';
export { extractTaxAlert, TaxAlertSchema } from './taxAlertExtraction';
export type { TaxAlert } from './taxAlertExtraction';

// Jurisdiction handling
export {
  JurisdictionDetector,
  JurisdictionHints,
  US_IRS_CONTEXT,
  UK_HMRC_CONTEXT,
  EU_CONTEXT
} from './jurisdictionHandlers';
export type { JurisdictionContext } from './jurisdictionHandlers';

// Logging
export { logger, LogLevel } from './logger';
export type { LogEntry } from './logger';
