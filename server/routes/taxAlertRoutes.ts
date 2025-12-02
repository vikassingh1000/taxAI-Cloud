/**
 * Tax Alert API Routes
 * RESTful API endpoints for tax alert ingestion and retrieval
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getIngestionService } from '../services/taxAlertIngestionService';
import { z } from 'zod';

const router = Router();
const ingestionService = getIngestionService();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for single text ingestion
 */
const ingestTextSchema = z.object({
  text: z.string().min(50, 'Text must be at least 50 characters'),
  sourceDocument: z.string().optional(),
  saveSourceText: z.boolean().optional().default(false),
  minConfidence: z.number().min(0).max(1).optional().default(0)
});

/**
 * Schema for batch ingestion
 */
const ingestBatchSchema = z.object({
  texts: z.array(z.string().min(50)).min(1).max(20, 'Maximum 20 documents per batch'),
  saveSourceText: z.boolean().optional().default(false),
  minConfidence: z.number().min(0).max(1).optional().default(0),
});

/**
 * Schema for query filters
 */
const queryFilterSchema = z.object({
  country: z.enum(['US', 'UK', 'EU', 'OTHER']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  taxType: z.string().optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  limit: z.number().min(1).max(1000).optional().default(100),
  offset: z.number().min(0).optional().default(0),
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Validation middleware
 */
function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Async handler wrapper
 */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/tax-alerts/ingest
 * Ingest a single tax notification text
 *
 * Request body:
 * {
 *   "text": "Tax notification text...",
 *   "sourceDocument": "optional-filename.pdf",
 *   "saveSourceText": false,
 *   "minConfidence": 0.7
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "alert": { id, country, priority, ... },
 *   "confidence": 0.92,
 *   "warnings": []
 * }
 */
router.post('/ingest', validate(ingestTextSchema), asyncHandler(async (req, res) => {
  const { text, sourceDocument, saveSourceText, minConfidence } = req.body;

  const result = await ingestionService.ingest(text, {
    sourceDocument,
    saveSourceText,
    minConfidence
  });

  if (result.success) {
    res.status(201).json({
      success: true,
      message: 'Tax alert ingested successfully',
      alert: result.alert,
      confidence: result.confidence,
      warnings: result.warnings
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error,
      message: 'Failed to ingest tax alert'
    });
  }
}));

/**
 * POST /api/tax-alerts/ingest/batch
 * Ingest multiple tax notification texts
 *
 * Request body:
 * {
 *   "texts": ["text1...", "text2..."],
 *   "saveSourceText": false,
 *   "minConfidence": 0.7
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "results": [
 *     { success: true, alert: {...}, confidence: 0.92 },
 *     { success: false, error: "..." }
 *   ],
 *   "summary": {
 *     "total": 2,
 *     "successful": 1,
 *     "failed": 1
 *   }
 * }
 */
router.post('/ingest/batch', validate(ingestBatchSchema), asyncHandler(async (req, res) => {
  const { texts, saveSourceText, minConfidence } = req.body;

  const results = await ingestionService.ingestBatch(texts, {
    saveSourceText,
    minConfidence
  });

  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;

  res.status(201).json({
    success: true,
    message: `Batch ingestion complete: ${successful} successful, ${failed} failed`,
    results: results.map(r => ({
      success: r.success,
      alert: r.alert ? {
        id: r.alert.id,
        country: r.alert.country,
        priority: r.alert.priority,
        title: r.alert.title
      } : undefined,
      confidence: r.confidence,
      error: r.error,
      warnings: r.warnings
    })),
    summary: {
      total: results.length,
      successful,
      failed
    }
  });
}));

/**
 * GET /api/tax-alerts
 * Get all tax alerts with optional filtering
 *
 * Query params:
 * - country: US | UK | EU | OTHER
 * - priority: CRITICAL | HIGH | MEDIUM | LOW
 * - taxType: GILTI | Corporate Tax | etc.
 * - minConfidence: 0.0-1.0
 * - limit: 1-1000 (default 100)
 * - offset: 0+ (default 0)
 *
 * Response:
 * {
 *   "success": true,
 *   "alerts": [...],
 *   "count": 42,
 *   "limit": 100,
 *   "offset": 0
 * }
 */
router.get('/', asyncHandler(async (req, res) => {
  const query = queryFilterSchema.parse(req.query);

  const alerts = await ingestionService.getAlertsByFilter({
    country: query.country,
    priority: query.priority,
    taxType: query.taxType,
    minConfidence: query.minConfidence
  }, query.limit);

  res.json({
    success: true,
    alerts,
    count: alerts.length,
    limit: query.limit,
    offset: query.offset
  });
}));

/**
 * GET /api/tax-alerts/:id
 * Get a single tax alert by ID
 *
 * Response:
 * {
 *   "success": true,
 *   "alert": { id, country, priority, ... }
 * }
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid alert ID'
    });
  }

  const alert = await ingestionService.getAlertById(id);

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    });
  }

  res.json({
    success: true,
    alert
  });
}));

/**
 * GET /api/tax-alerts/search/:keyword
 * Search tax alerts by keyword
 *
 * Query params:
 * - limit: 1-1000 (default 100)
 *
 * Response:
 * {
 *   "success": true,
 *   "keyword": "GILTI",
 *   "alerts": [...],
 *   "count": 5
 * }
 */
router.get('/search/:keyword', asyncHandler(async (req, res) => {
  const keyword = req.params.keyword;
  const limit = parseInt(req.query.limit as string) || 100;

  const alerts = await ingestionService.searchAlerts(keyword, limit);

  res.json({
    success: true,
    keyword,
    alerts,
    count: alerts.length
  });
}));

/**
 * GET /api/tax-alerts/stats
 * Get database statistics
 *
 * Response:
 * {
 *   "success": true,
 *   "stats": {
 *     "total": 42,
 *     "byCountry": { "US": 20, "UK": 15, ... },
 *     "byPriority": { "CRITICAL": 5, "HIGH": 10, ... },
 *     "avgConfidence": 0.87
 *   }
 * }
 */
router.get('/meta/stats', asyncHandler(async (req, res) => {
  const stats = await ingestionService.getStats();

  res.json({
    success: true,
    stats
  });
}));

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 handler for undefined routes
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

/**
 * Global error handler
 */
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default router;
