/**
 * Database Initialization Script
 * Creates the SQLite database and tables
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import { taxAlerts } from './schema';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Find project root by looking for package.json
 */
function findProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  let dir = path.dirname(currentFile);

  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }

  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const DB_DIR = path.join(PROJECT_ROOT, 'data');
const DB_PATH = path.join(DB_DIR, 'tax_alerts.db');

console.log('🚀 Initializing SQLite database...\n');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log('✅ Created data directory:', DB_DIR);
}

// Initialize database
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

const db = drizzle(sqlite);

// Create tables
console.log('📊 Creating tables...\n');

// Drop existing table if needed (comment out in production!)
// sqlite.exec('DROP TABLE IF EXISTS tax_alerts');

// Create tax_alerts table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS tax_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Classification
    country TEXT NOT NULL CHECK(country IN ('US', 'UK', 'EU', 'OTHER')),
    tax_type TEXT NOT NULL CHECK(tax_type IN (
      'Corporate Tax', 'VAT', 'Transfer Pricing', 'GILTI',
      'Sales Tax', 'Energy Tax', 'Withholding Tax', 'Customs Duty', 'Other'
    )),
    priority TEXT NOT NULL CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),

    -- Content
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    key_changes TEXT NOT NULL,
    affected_entities TEXT NOT NULL,

    -- Interpretation
    bp_specific_impact TEXT NOT NULL,
    required_actions TEXT NOT NULL,
    compliance_risk TEXT NOT NULL CHECK(compliance_risk IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    estimated_deadline TEXT,

    -- Confidence
    overall_confidence REAL NOT NULL CHECK(overall_confidence >= 0 AND overall_confidence <= 1),
    classification_confidence REAL NOT NULL CHECK(classification_confidence >= 0 AND classification_confidence <= 1),
    interpretation_confidence REAL NOT NULL CHECK(interpretation_confidence >= 0 AND interpretation_confidence <= 1),
    confidence_notes TEXT,

    -- Metadata
    source_length INTEGER NOT NULL,
    model_used TEXT NOT NULL,
    extracted_at TEXT NOT NULL,

    -- Audit
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    -- Optional
    source_document TEXT,
    source_text TEXT
  )
`);

console.log('✅ Table "tax_alerts" created successfully\n');

// Create indexes for better query performance
console.log('📑 Creating indexes...\n');

sqlite.exec(`
  CREATE INDEX IF NOT EXISTS idx_tax_alerts_country ON tax_alerts(country);
  CREATE INDEX IF NOT EXISTS idx_tax_alerts_priority ON tax_alerts(priority);
  CREATE INDEX IF NOT EXISTS idx_tax_alerts_tax_type ON tax_alerts(tax_type);
  CREATE INDEX IF NOT EXISTS idx_tax_alerts_extracted_at ON tax_alerts(extracted_at DESC);
  CREATE INDEX IF NOT EXISTS idx_tax_alerts_confidence ON tax_alerts(overall_confidence DESC);
`);

console.log('✅ Indexes created successfully\n');

// Verify table creation
const tables = sqlite.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='tax_alerts'
`).all();

if (tables.length > 0) {
  console.log('✅ Database initialized successfully!\n');
  console.log('📊 Database location:', DB_PATH);
  console.log('📏 Database size:', (fs.statSync(DB_PATH).size / 1024).toFixed(2), 'KB\n');

  // Show table schema
  const schema = sqlite.prepare(`PRAGMA table_info(tax_alerts)`).all();
  console.log('📋 Table Schema:');
  console.log('─'.repeat(80));
  schema.forEach((col: any) => {
    console.log(`  ${col.name.padEnd(30)} ${col.type.padEnd(10)} ${col.notnull ? 'NOT NULL' : ''}`);
  });
  console.log('─'.repeat(80));
  console.log();

  // Get row count
  const countResult = sqlite.prepare(`SELECT COUNT(*) as count FROM tax_alerts`).get() as { count: number };
  console.log('📊 Current records:', countResult.count);
  console.log();
} else {
  console.error('❌ Failed to create database table');
  process.exit(1);
}

// Close database
sqlite.close();

console.log('🎉 Database initialization complete!');
console.log();
console.log('Next steps:');
console.log('  1. Run AI extraction: npm run ai:example');
console.log('  2. View database: npm run db:studio');
console.log('  3. Check stats: npm run db:stats');
console.log();
