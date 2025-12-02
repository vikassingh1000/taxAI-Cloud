/**
 * Tax Alert Database Service
 * Handles all database operations for tax alerts
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, desc, and, gte, lte, sql, count } from 'drizzle-orm';
import { taxAlerts, type InsertTaxAlert, type TaxAlert, aiOutputToDbFormat } from './schema';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Database configuration
 * Find project root by looking for package.json
 */
function findProjectRoot(): string {
  // Start from current module's directory
  const currentFile = fileURLToPath(import.meta.url);
  let dir = path.dirname(currentFile);

  // Walk up until we find package.json
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }

  // Fallback to process.cwd()
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const DB_DIR = path.join(PROJECT_ROOT, 'data');
const DB_PATH = path.join(DB_DIR, 'tax_alerts.db');

/**
 * Tax Alert Database Service
 */
export class TaxAlertDbService {
  private db: ReturnType<typeof drizzle>;
  private sqlite: Database.Database;

  constructor(dbPath: string = DB_PATH) {
    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Initialize SQLite database
    this.sqlite = new Database(dbPath);
    this.sqlite.pragma('journal_mode = WAL'); // Better performance
    this.db = drizzle(this.sqlite);

    console.log(`📊 Database initialized at: ${dbPath}`);
  }

  /**
   * Create a new tax alert from AI extraction output
   */
  async createFromAiOutput(aiOutput: any, sourceDocument?: string, sourceText?: string): Promise<TaxAlert> {
    const data = aiOutputToDbFormat(aiOutput);

    const alert = await this.create({
      ...data,
      sourceDocument: sourceDocument || null,
      sourceText: sourceText || null,
    });

    console.log(`✅ Tax alert saved to database (ID: ${alert.id})`);
    return alert;
  }

  /**
   * Create a new tax alert
   */
  async create(data: InsertTaxAlert): Promise<TaxAlert> {
    const result = await this.db.insert(taxAlerts).values(data).returning();
    return result[0];
  }

  /**
   * Get tax alert by ID
   */
  async getById(id: number): Promise<TaxAlert | undefined> {
    const result = await this.db.select().from(taxAlerts).where(eq(taxAlerts.id, id));
    return result[0];
  }

  /**
   * Get all tax alerts
   */
  async getAll(limit: number = 100, offset: number = 0): Promise<TaxAlert[]> {
    return this.db
      .select()
      .from(taxAlerts)
      .orderBy(desc(taxAlerts.extractedAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get alerts by country
   */
  async getByCountry(country: string, limit: number = 100): Promise<TaxAlert[]> {
    return this.db
      .select()
      .from(taxAlerts)
      .where(eq(taxAlerts.country, country))
      .orderBy(desc(taxAlerts.extractedAt))
      .limit(limit);
  }

  /**
   * Get alerts by priority
   */
  async getByPriority(priority: string, limit: number = 100): Promise<TaxAlert[]> {
    return this.db
      .select()
      .from(taxAlerts)
      .where(eq(taxAlerts.priority, priority))
      .orderBy(desc(taxAlerts.extractedAt))
      .limit(limit);
  }

  /**
   * Get alerts by tax type
   */
  async getByTaxType(taxType: string, limit: number = 100): Promise<TaxAlert[]> {
    return this.db
      .select()
      .from(taxAlerts)
      .where(eq(taxAlerts.taxType, taxType))
      .orderBy(desc(taxAlerts.extractedAt))
      .limit(limit);
  }

  /**
   * Get critical alerts (CRITICAL or HIGH priority)
   */
  async getCriticalAlerts(limit: number = 50): Promise<TaxAlert[]> {
    return this.db
      .select()
      .from(taxAlerts)
      .where(
        sql`${taxAlerts.priority} IN ('CRITICAL', 'HIGH')`
      )
      .orderBy(desc(taxAlerts.extractedAt))
      .limit(limit);
  }

  /**
   * Get alerts by confidence threshold
   */
  async getByConfidence(minConfidence: number, limit: number = 100): Promise<TaxAlert[]> {
    return this.db
      .select()
      .from(taxAlerts)
      .where(gte(taxAlerts.overallConfidence, minConfidence))
      .orderBy(desc(taxAlerts.overallConfidence))
      .limit(limit);
  }

  /**
   * Get alerts by date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<TaxAlert[]> {
    return this.db
      .select()
      .from(taxAlerts)
      .where(
        and(
          gte(taxAlerts.extractedAt, startDate),
          lte(taxAlerts.extractedAt, endDate)
        )
      )
      .orderBy(desc(taxAlerts.extractedAt));
  }

  /**
   * Search alerts by keyword in title or summary
   */
  async search(keyword: string, limit: number = 100): Promise<TaxAlert[]> {
    const searchPattern = `%${keyword}%`;
    return this.db
      .select()
      .from(taxAlerts)
      .where(
        sql`${taxAlerts.title} LIKE ${searchPattern} OR ${taxAlerts.summary} LIKE ${searchPattern}`
      )
      .orderBy(desc(taxAlerts.extractedAt))
      .limit(limit);
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number;
    byCountry: Record<string, number>;
    byPriority: Record<string, number>;
    byTaxType: Record<string, number>;
    avgConfidence: number;
  }> {
    // Total count
    const totalResult = await this.db.select({ count: count() }).from(taxAlerts);
    const total = totalResult[0].count;

    // By country
    const byCountryResult = await this.db
      .select({
        country: taxAlerts.country,
        count: count()
      })
      .from(taxAlerts)
      .groupBy(taxAlerts.country);

    const byCountry = byCountryResult.reduce((acc, row) => {
      acc[row.country] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // By priority
    const byPriorityResult = await this.db
      .select({
        priority: taxAlerts.priority,
        count: count()
      })
      .from(taxAlerts)
      .groupBy(taxAlerts.priority);

    const byPriority = byPriorityResult.reduce((acc, row) => {
      acc[row.priority] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // By tax type
    const byTaxTypeResult = await this.db
      .select({
        taxType: taxAlerts.taxType,
        count: count()
      })
      .from(taxAlerts)
      .groupBy(taxAlerts.taxType);

    const byTaxType = byTaxTypeResult.reduce((acc, row) => {
      acc[row.taxType] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // Average confidence
    const avgConfidenceResult = await this.db
      .select({
        avg: sql<number>`AVG(${taxAlerts.overallConfidence})`
      })
      .from(taxAlerts);

    const avgConfidence = avgConfidenceResult[0].avg || 0;

    return {
      total,
      byCountry,
      byPriority,
      byTaxType,
      avgConfidence: Number(avgConfidence.toFixed(2))
    };
  }

  /**
   * Update a tax alert
   */
  async update(id: number, data: Partial<InsertTaxAlert>): Promise<TaxAlert> {
    const result = await this.db
      .update(taxAlerts)
      .set({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .where(eq(taxAlerts.id, id))
      .returning();

    return result[0];
  }

  /**
   * Delete a tax alert
   */
  async delete(id: number): Promise<void> {
    await this.db.delete(taxAlerts).where(eq(taxAlerts.id, id));
  }

  /**
   * Delete all tax alerts (use with caution!)
   */
  async deleteAll(): Promise<void> {
    await this.db.delete(taxAlerts);
  }

  /**
   * Close database connection
   */
  close(): void {
    this.sqlite.close();
    console.log('📊 Database connection closed');
  }

  /**
   * Export alerts to JSON
   */
  async exportToJson(outputPath: string): Promise<void> {
    const alerts = await this.getAll(10000); // Get all
    fs.writeFileSync(outputPath, JSON.stringify(alerts, null, 2));
    console.log(`📤 Exported ${alerts.length} alerts to ${outputPath}`);
  }

  /**
   * Get database file path
   */
  getDbPath(): string {
    return DB_PATH;
  }
}

// Singleton instance
let dbServiceInstance: TaxAlertDbService | null = null;

/**
 * Get or create database service instance
 */
export function getDbService(): TaxAlertDbService {
  if (!dbServiceInstance) {
    dbServiceInstance = new TaxAlertDbService();
  }
  return dbServiceInstance;
}

/**
 * Close database connection (call on app shutdown)
 */
export function closeDb(): void {
  if (dbServiceInstance) {
    dbServiceInstance.close();
    dbServiceInstance = null;
  }
}

export default TaxAlertDbService;
