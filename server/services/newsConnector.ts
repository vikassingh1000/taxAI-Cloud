/**
 * News Connector Service
 * Background service that periodically fetches tax news from NewsAPI and ingests via the ingest endpoint
 */

/**
 * Article from NewsAPI response
 */
interface NewsArticle {
  title: string;
  description: string;
  content?: string;
  url?: string;
  source?: { name: string };
  publishedAt?: string;
}

/**
 * Ingestion payload to send to /api/tax-alerts/ingest
 */
interface IngestionPayload {
  text: string;
  sourceDocument?: string;
  saveSourceText?: boolean;
  minConfidence?: number;
}

/**
 * News Connector Service
 * Manages background news fetching and ingestion
 */
export class NewsConnectorService {
  private intervalId: NodeJS.Timer | null = null;
  private isRunning = false;
  private pollingIntervalMs: number; // milliseconds between polls
  private newsApiKey: string;
  private ingestEndpointUrl: string;
  private newsQuery: string;
  private topN: number;

  constructor(
    newsApiKey: string,
    ingestEndpointUrl: string = 'http://localhost:3000/api/tax-alerts/ingest',
    pollingIntervalMinutes: number = 5,
    newsQuery: string = 'tax',
    topN: number = 20
  ) {
    this.newsApiKey = newsApiKey;
    this.ingestEndpointUrl = ingestEndpointUrl;
    this.pollingIntervalMs = pollingIntervalMinutes * 60 * 1000;
    this.newsQuery = newsQuery;
    this.topN = topN;
  }

  /**
   * Fetch top news articles from NewsAPI.org
   */
  async fetchNewsFromApi(): Promise<NewsArticle[]> {
    const params = new URLSearchParams({
      q: this.newsQuery,
      language: 'en',
      from: '2025-11-01',
      sources: 'the-guardian,bbc-news',
      pageSize: String(this.topN),
      apiKey: this.newsApiKey
    });

    const url = `https://newsapi.org/v2/everything?${params.toString()}`;
    console.log(`🔎 Fetching news from: ${url}`);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`NewsAPI request failed: ${res.status} ${body}`);
      }

      const json = await res.json();
      const articles = (json.articles || []).map((a: any) => ({
        title: a.title || '',
        description: a.description || '',
        content: a.content || '',
        url: a.url,
        source: a.source,
        publishedAt: a.publishedAt
      }));

      console.log(`✅ Fetched ${articles.length} articles from NewsAPI`);
      return articles;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to fetch news from API: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Ingest a single article by calling the ingest endpoint
   */
  async ingestArticle(article: NewsArticle, index: number, total: number): Promise<boolean> {
    try {
      // Format article as text: Title: {title}\nDescription: {description}\nContent: {content}
      const text = `Title: ${article.title}\nDescription: ${article.description}\nContent: ${article.content || ''}`;

      const payload: IngestionPayload = {
        text,
        sourceDocument: `news:${article.source?.name || 'unknown'}:${index}`,
        saveSourceText: true,
        minConfidence: 0.0
      };

      console.log(`📰 Ingesting article ${index}/${total}: ${article.title}`);

      const res = await fetch(this.ingestEndpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`❌ Ingest request failed for article ${index}: ${res.status} ${body}`);
        return false;
      }

      const result = await res.json();
      if (result.success) {
        console.log(`✅ Article ${index} ingested successfully (alert ID: ${result.alert?.id})`);
        return true;
      } else {
        console.error(`❌ Article ${index} ingestion failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error ingesting article ${index}: ${errorMsg}`);
      return false;
    }
  }

  /**
   * Main polling loop: fetch news and ingest each article
   */
  async poll(): Promise<void> {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔔 News Connector Poll started at ${new Date().toISOString()}`);
    console.log(`${'='.repeat(80)}`);

    try {
      const articles = await this.fetchNewsFromApi();

      if (articles.length === 0) {
        console.log(`⚠️  No articles found for query: "${this.newsQuery}"`);
        return;
      }

      let successCount = 0;
      for (let i = 0; i < articles.length; i++) {
        const success = await this.ingestArticle(articles[i], i + 1, articles.length);
        if (success) successCount++;
        // Small delay between ingestions to avoid overwhelming the API
        await this.sleep(500);
      }

      const duration = Date.now() - startTime;
      console.log(`\n📊 Poll complete: ${successCount}/${articles.length} articles ingested in ${duration}ms`);
      console.log(`${'='.repeat(80)}\n`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const duration = Date.now() - startTime;
      console.error(`\n❌ Poll failed after ${duration}ms: ${errorMsg}`);
      console.log(`${'='.repeat(80)}\n`);
    }
  }

  /**
   * Start the background polling service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn(`⚠️  News Connector is already running`);
      return;
    }

    if (!this.newsApiKey) {
      throw new Error('NEWSAPI_KEY is required to start News Connector');
    }

    console.log(`🚀 Starting News Connector Service`);
    console.log(`   Polling interval: ${this.pollingIntervalMs / 1000 / 60} minutes`);
    console.log(`   News query: "${this.newsQuery}"`);
    console.log(`   Top N articles: ${this.topN}`);
    console.log(`   Ingest endpoint: ${this.ingestEndpointUrl}`);

    this.isRunning = true;

    // Run one poll immediately on start
    await this.poll();

    // Then schedule periodic polls
    this.intervalId = setInterval(() => {
      this.poll().catch(err => {
        console.error(`❌ Poll error: ${err instanceof Error ? err.message : String(err)}`);
      });
    }, this.pollingIntervalMs);

    console.log(`✅ News Connector Service started`);
  }

  /**
   * Stop the background polling service
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn(`⚠️  News Connector is not running`);
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log(`⏹️  News Connector Service stopped`);
  }

  /**
   * Get connector status
   */
  getStatus(): {
    isRunning: boolean;
    newsQuery: string;
    topN: number;
    pollingIntervalMinutes: number;
    ingestEndpointUrl: string;
  } {
    return {
      isRunning: this.isRunning,
      newsQuery: this.newsQuery,
      topN: this.topN,
      pollingIntervalMinutes: this.pollingIntervalMs / 60 / 1000,
      ingestEndpointUrl: this.ingestEndpointUrl
    };
  }

  /**
   * Update configuration
   */
  updateConfig(options: {
    newsQuery?: string;
    topN?: number;
    pollingIntervalMinutes?: number;
  }): void {
    if (options.newsQuery) this.newsQuery = options.newsQuery;
    if (options.topN) this.topN = options.topN;
    if (options.pollingIntervalMinutes) {
      this.pollingIntervalMs = options.pollingIntervalMinutes * 60 * 1000;
      // Restart interval if running
      if (this.isRunning) {
        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
          this.poll().catch(err => {
            console.error(`❌ Poll error: ${err instanceof Error ? err.message : String(err)}`);
          });
        }, this.pollingIntervalMs);
      }
    }
  }

  /**
   * Helper: sleep for N milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global singleton instance
 */
let connectorInstance: NewsConnectorService | null = null;

/**
 * Get or create connector instance
 */
export function getNewsConnector(
  newsApiKey: string = process.env.NEWSAPI_KEY || '',
  ingestEndpointUrl: string = 'http://localhost:3000/api/tax-alerts/ingest',
  pollingIntervalMinutes: number = 5,
  newsQuery: string = 'tax',
  topN: number = 20
): NewsConnectorService {
  if (!connectorInstance) {
    connectorInstance = new NewsConnectorService(
      newsApiKey,
      ingestEndpointUrl,
      pollingIntervalMinutes,
      newsQuery,
      topN
    );
  }
  return connectorInstance;
}

export default NewsConnectorService;
