/**
 * SQLite Database Schema for Tax Alerts
 * Using Drizzle ORM with SQLite
 */

import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Tax Alerts Table
 * Stores structured tax alert data extracted from PDF documents
 */
export const taxAlerts = sqliteTable("tax_alerts", {
  // Primary Key
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Classification
  country: text("country", { enum: ["US", "UK", "EU", "OTHER"] }).notNull(),
  taxType: text("tax_type", {
    enum: [
      "Corporate Tax",
      "VAT",
      "Transfer Pricing",
      "GILTI",
      "Sales Tax",
      "Energy Tax",
      "Withholding Tax",
      "Customs Duty",
      "Other"
    ]
  }).notNull(),
  priority: text("priority", { enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] }).notNull(),

  // Content
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  keyChanges: text("key_changes", { mode: "json" }).notNull().$type<string[]>(),
  affectedEntities: text("affected_entities", { mode: "json" }).notNull().$type<string[]>(),

  // Interpretation
  bpSpecificImpact: text("bp_specific_impact").notNull(),
  requiredActions: text("required_actions", { mode: "json" }).notNull().$type<string[]>(),
  complianceRisk: text("compliance_risk", { enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] }).notNull(),
  estimatedDeadline: text("estimated_deadline"),

  // Confidence
  overallConfidence: real("overall_confidence").notNull(),
  classificationConfidence: real("classification_confidence").notNull(),
  interpretationConfidence: real("interpretation_confidence").notNull(),
  confidenceNotes: text("confidence_notes"),

  // Metadata
  sourceLength: integer("source_length").notNull(),
  modelUsed: text("model_used").notNull(),
  extractedAt: text("extracted_at").notNull(), // ISO 8601 timestamp

  // Audit
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),

  // Optional: Source document reference
  sourceDocument: text("source_document"), // PDF filename or reference
  sourceText: text("source_text"), // Store original PDF text (optional)
});

/**
 * Zod Schemas for Validation
 */
export const insertTaxAlertSchema = createInsertSchema(taxAlerts, {
  // Add custom validations
  title: z.string().min(5).max(200),
  summary: z.string().min(50).max(500),
  bpSpecificImpact: z.string().min(50).max(800),
  overallConfidence: z.number().min(0).max(1),
  classificationConfidence: z.number().min(0).max(1),
  interpretationConfidence: z.number().min(0).max(1),
  keyChanges: z.array(z.string()).min(1).max(10),
  affectedEntities: z.array(z.string()).min(1).max(15),
  requiredActions: z.array(z.string()).min(1).max(10),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectTaxAlertSchema = createSelectSchema(taxAlerts);

/**
 * TypeScript Types
 */
export type TaxAlert = typeof taxAlerts.$inferSelect;
export type InsertTaxAlert = z.infer<typeof insertTaxAlertSchema>;

/**
 * Query Result Types
 */
export type TaxAlertWithStats = TaxAlert & {
  totalAlerts?: number;
  criticalCount?: number;
  highCount?: number;
};

/**
 * Helper function to convert AI extraction output to database format
 */
export function aiOutputToDbFormat(aiOutput: any): Omit<InsertTaxAlert, 'createdAt' | 'updatedAt'> {
  return {
    // Classification
    country: aiOutput.classification.country,
    taxType: aiOutput.classification.tax_type,
    priority: aiOutput.classification.priority,

    // Content
    title: aiOutput.content.title,
    summary: aiOutput.content.summary,
    keyChanges: aiOutput.content.key_changes,
    affectedEntities: aiOutput.content.affected_entities,

    // Interpretation
    bpSpecificImpact: aiOutput.interpretation.bp_specific_impact,
    requiredActions: aiOutput.interpretation.required_actions,
    complianceRisk: aiOutput.interpretation.compliance_risk,
    estimatedDeadline: aiOutput.interpretation.estimated_deadline,

    // Confidence
    overallConfidence: aiOutput.confidence.overall_score,
    classificationConfidence: aiOutput.confidence.classification_confidence,
    interpretationConfidence: aiOutput.confidence.interpretation_confidence,
    confidenceNotes: aiOutput.confidence.notes || null,

    // Metadata
    sourceLength: aiOutput.metadata.source_length,
    modelUsed: aiOutput.metadata.model_used,
    extractedAt: aiOutput.metadata.extracted_at,

    // Optional
    sourceDocument: null,
    sourceText: null,
  };
}
