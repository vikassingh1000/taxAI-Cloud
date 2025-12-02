/**
 * Tax Alert Ingestion Service
 * Combines AI extraction with database storage
 *
 * This service orchestrates the complete pipeline:
 * 1. Extract structured data from tax notification text using AI
 * 2. Save the extracted alert to the database
 * 3. Return the saved alert with ID
 */

import { getDbService } from '../db/taxAlertService';
import type { TaxAlert as AiTaxAlert } from '../ai/taxAlertExtraction';
import type { TaxAlert as DbTaxAlert } from '../db/schema';
import * as fs from 'fs';
import * as path from 'path';

// Dynamic import to work around tsx/ESM module loading issues
async function extractTaxAlert(text: string, apiKey?: string): Promise<AiTaxAlert> {
  const { default: TaxAlertExtractionService } = await import('../ai/taxAlertExtraction');
  const service = new (TaxAlertExtractionService as any)(apiKey);
  return service.extractTaxAlert(text);
}

/**
 * Extract text from PDF file using pdfjs-dist
 * Similar to PyMuPDF approach in Python
 */
async function extractTextFromPdf(pdfFilePath: string): Promise<string> {
  try {
    // Validate file exists
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error(`PDF file not found: ${pdfFilePath}`);
    }

    // Import pdfjs for PDF parsing
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const dataBuffer = fs.readFileSync(pdfFilePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    
    let fullText = '';
    const numPages = pdf.numPages;

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += pageText + '\n';
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No text could be extracted from PDF');
    }

    console.log(`✅ Extracted ${fullText.length} characters from ${path.basename(pdfFilePath)}`);
    console.log(`   Pages: ${numPages}`);

    return fullText;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract PDF text: ${errorMsg}`);
  }
}

/**
 * Fetch top news articles from NewsAPI.org
 * Returns an array of simplified article objects
 */
async function fetchTopNews(query: string, apiKey?: string, topN: number = 20) {
  const key = apiKey || process.env.NEWSAPI_KEY;
  if (!key) {
    throw new Error('NEWSAPI_KEY required to fetch news from NewsAPI.org');
  }

  const params = new URLSearchParams({
    q: query,
    language: 'en',
    pageSize: String(topN),
    from: "2025-11-01",
    sources: 'bbc-news,the-guardian,reuters,the-verge',
    apiKey: key
  });

  const url = `https://newsapi.org/v2/everything?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NewsAPI request failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const articles = (json.articles || []).map((a: any) => ({
    title: a.title || '',
    description: a.description || '',
    url: a.url,
    source: a.source?.name,
    publishedAt: a.publishedAt
  }));

  return articles;
}

/**
 * Ingestion options
 */
export interface IngestionOptions {
  sourceDocument?: string;      // Optional: PDF filename or reference
  saveSourceText?: boolean;      // Whether to store original text in DB
  minConfidence?: number;        // Minimum confidence threshold (default: 0.0)
  apiKey?: string;              // Optional: Override API key
}

/**
 * Ingestion result
 */
export interface IngestionResult {
  success: boolean;
  alert?: DbTaxAlert;           // Saved alert with database ID
  aiOutput?: AiTaxAlert;        // Raw AI extraction output
  error?: string;
  confidence?: number;
  savedToDb?: boolean;
  warnings?: string[];
}

/**
 * Tax Alert Ingestion Service
 * Combines AI extraction and database persistence
 */
export class TaxAlertIngestionService {
  private db = getDbService();

  /**
   * Ingest a tax notification text
   * Extracts with AI and saves to database
   *
   * @param text - Tax notification text (from PDF or other source)
   * @param options - Ingestion options
   * @returns Ingestion result with saved alert
   */
  async ingest(text: string, options: IngestionOptions = {}): Promise<IngestionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      console.log(`🚀 Starting tax alert ingestion...`);
      
      // Step 0: If sourceDocument is provided and is a filename, extract from PDF
      if (options.sourceDocument && !options.sourceDocument.includes('\\') && !options.sourceDocument.includes('/')) {
        try {
          const pdfPath = path.join(process.cwd(), 'data', 'pdfs', options.sourceDocument);
          if (fs.existsSync(pdfPath)) {
            console.log(`📄 Extracting text from PDF file: ${options.sourceDocument}`);
            text = await extractTextFromPdf(pdfPath);
          }
        } catch (pdfError) {
          const errorMsg = pdfError instanceof Error ? pdfError.message : String(pdfError);
          console.warn(`⚠️  Could not extract PDF: ${errorMsg}`);
          // Continue with original text if extraction fails
        }
      }

      console.log(`📝 Text length: ${text.length} characters`);

      // Step 1: Validate input
      if (!text || text.trim().length < 50) {
        return {
          success: false,
          error: 'Text is too short. Minimum 50 characters required.',
          savedToDb: false
        };
      }

      // Step 2: Extract with AI
      console.log(`🤖 Extracting with AI...`);
      const aiOutput = await extractTaxAlert(text, options.apiKey);

      const confidence = aiOutput.confidence.overall_score;
      console.log(`✅ AI extraction complete (confidence: ${(confidence * 100).toFixed(1)}%)`);

      // Step 3: Check confidence threshold
      const minConfidence = options.minConfidence || 0.0;
      if (confidence < minConfidence) {
        warnings.push(
          `Confidence ${(confidence * 100).toFixed(1)}% below threshold ${(minConfidence * 100).toFixed(1)}%`
        );
        console.log(`⚠️  ${warnings[0]}`);
      }

      // Step 4: Save to database
      console.log(`💾 Saving to database...`);
      const savedAlert = await this.db.createFromAiOutput(
        aiOutput,
        options.sourceDocument,
        options.saveSourceText ? text : undefined
      );

      const duration = Date.now() - startTime;
      console.log(`✅ Ingestion complete in ${duration}ms`);
      console.log(`📊 Saved alert ID: ${savedAlert.id}`);

      return {
        success: true,
        alert: savedAlert,
        aiOutput,
        confidence,
        savedToDb: true,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      console.error(`❌ Ingestion failed after ${duration}ms:`, errorMsg);

      return {
        success: false,
        error: errorMsg,
        savedToDb: false
      };
    }
  }

  /**
   * Ingest multiple tax notification texts in batch
   *
   * @param texts - Array of tax notification texts
   * @param options - Ingestion options (applied to all)
   * @returns Array of ingestion results
   */
  async ingestBatch(
    texts: string[],
    options: IngestionOptions = {}
  ): Promise<IngestionResult[]> {
    console.log(`🚀 Starting batch ingestion of ${texts.length} documents...`);

    const results: IngestionResult[] = [];

    for (let i = 0; i < texts.length; i++) {
      console.log(`\n📄 Processing document ${i + 1}/${texts.length}...`);

      const result = await this.ingest(texts[i], {
        ...options,
        sourceDocument: options.sourceDocument || `batch_document_${i + 1}.txt`
      });

      results.push(result);

      if (result.success) {
        console.log(`✅ Document ${i + 1} ingested successfully (ID: ${result.alert?.id})`);
      } else {
        console.log(`❌ Document ${i + 1} failed: ${result.error}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`\n📊 Batch ingestion complete:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);

    return results;
  }

  /**
   * Ingest news articles fetched from NewsAPI for a given query.
   * Each article's title+description is passed through the same ingestion pipeline.
   */
  async ingestNews(query: string, options: IngestionOptions = {}, topN: number = 5): Promise<IngestionResult[]> {
    console.log(`🔎 Fetching top ${topN} news for query: "${query}"`);
    const results: IngestionResult[] = [];

    try {
      const articles = await fetchTopNews(query, options.apiKey, topN);

      for (let i = 0; i < articles.length; i++) {
        const a = articles[i];
        const content = `Title: ${a.title}\n\nDescription: ${a.description}\n\nSource: ${a.source || ''}\nURL: ${a.url || ''}`;

        console.log(`📰 Ingesting article ${i + 1}/${articles.length}: ${a.title}`);

        const result = await this.ingest(content, {
          ...options,
          sourceDocument: `news:${a.source || 'unknown'}:${i + 1}`,
          saveSourceText: options.saveSourceText ?? true
        });

        results.push(result);
      }

      return results;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`❌ News ingestion failed: ${errorMsg}`);
      return [{ success: false, error: errorMsg }];
    }
  }

  /**
   * Ingest news for multiple queries in batch
   */
  async ingestNewsBatch(queries: string[], options: IngestionOptions = {}, topN: number = 5) {
    const allResults: IngestionResult[] = [];
    for (let i = 0; i < queries.length; i++) {
      console.log(`
📄 Processing news query ${i + 1}/${queries.length}: ${queries[i]}`);
      const res = await this.ingestNews(queries[i], options, topN);
      allResults.push(...res);
    }
    return allResults;
  }

  /**
   * Get ingestion statistics
   * Returns database stats
   */
  async getStats() {
    return this.db.getStats();
  }

  /**
   * Get all ingested alerts
   */
  async getAllAlerts(limit: number = 100, offset: number = 0) {
    return this.db.getAll(limit, offset);
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: number) {
    return this.db.getById(id);
  }

  /**
   * Search alerts
   */
  async searchAlerts(keyword: string, limit: number = 100) {
    return this.db.search(keyword, limit);
  }

  /**
   * Get alerts by filters
   */
  async getAlertsByFilter(filter: {
    country?: string;
    priority?: string;
    taxType?: string;
    minConfidence?: number;
  }, limit: number = 100) {
    if (filter.country) {
      return this.db.getByCountry(filter.country, limit);
    }
    if (filter.priority) {
      return this.db.getByPriority(filter.priority, limit);
    }
    if (filter.taxType) {
      return this.db.getByTaxType(filter.taxType, limit);
    }
    if (filter.minConfidence !== undefined) {
      return this.db.getByConfidence(filter.minConfidence, limit);
    }

    return this.db.getAll(limit);
  }
}

/**
 * Singleton instance
 */
let ingestionServiceInstance: TaxAlertIngestionService | null = null;

/**
 * Get or create ingestion service instance
 */
export function getIngestionService(): TaxAlertIngestionService {
  if (!ingestionServiceInstance) {
    ingestionServiceInstance = new TaxAlertIngestionService();
  }
  return ingestionServiceInstance;
}

export default TaxAlertIngestionService;
