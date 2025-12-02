/**
 * News Connector API Routes
 * Endpoints to manage the background news fetching service
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getNewsConnector } from '../services/newsConnector';
import { z } from 'zod';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for starting the connector
 */
const startConnectorSchema = z.object({
  newsQuery: z.string().optional().default('tax'),
  topN: z.number().min(1).max(100).optional().default(20),
  pollingIntervalMinutes: z.number().min(1).max(1440).optional().default(5),
  ingestEndpointUrl: z.string().url().optional().default('http://localhost:3000/api/tax-alerts/ingest')
});

/**
 * Schema for updating connector config
 */
const updateConfigSchema = z.object({
  newsQuery: z.string().optional(),
  topN: z.number().min(1).max(100).optional(),
  pollingIntervalMinutes: z.number().min(1).max(1440).optional()
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
 * POST /api/news-connector/start
 * Start the background news connector service
 *
 * Request body:
 * {
 *   "newsQuery": "tax",
 *   "topN": 5,
 *   "pollingIntervalMinutes": 60,
 *   "ingestEndpointUrl": "http://localhost:3000/api/tax-alerts/ingest"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "News Connector started",
 *   "status": { ... }
 * }
 */
router.post('/start', validate(startConnectorSchema), asyncHandler(async (req, res) => {
  const { newsQuery, topN, pollingIntervalMinutes, ingestEndpointUrl } = req.body;

  const connector = getNewsConnector(
    process.env.NEWSAPI_KEY || '',
    ingestEndpointUrl,
    pollingIntervalMinutes,
    newsQuery,
    topN
  );

  try {
    await connector.start();
    const status = connector.getStatus();

    res.status(200).json({
      success: true,
      message: 'News Connector started',
      status
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(400).json({
      success: false,
      error: errorMsg,
      message: 'Failed to start News Connector'
    });
  }
}));

/**
 * POST /api/news-connector/stop
 * Stop the background news connector service
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "News Connector stopped"
 * }
 */
router.post('/stop', asyncHandler(async (req, res) => {
  const connector = getNewsConnector();

  connector.stop();

  res.status(200).json({
    success: true,
    message: 'News Connector stopped'
  });
}));

/**
 * GET /api/news-connector/status
 * Get current status of the news connector
 *
 * Response:
 * {
 *   "success": true,
 *   "status": {
 *     "isRunning": true,
 *     "newsQuery": "tax",
 *     "topN": 5,
 *     "pollingIntervalMinutes": 60,
 *     "ingestEndpointUrl": "http://localhost:3000/api/tax-alerts/ingest"
 *   }
 * }
 */
router.get('/status', asyncHandler(async (req, res) => {
  const connector = getNewsConnector();
  const status = connector.getStatus();

  res.json({
    success: true,
    status
  });
}));

/**
 * POST /api/news-connector/poll
 * Manually trigger a single poll cycle (fetch and ingest news)
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Poll triggered"
 * }
 */
router.post('/poll', asyncHandler(async (req, res) => {
  const connector = getNewsConnector();

  connector.poll().catch(err => {
    console.error(`Poll error: ${err instanceof Error ? err.message : String(err)}`);
  });

  res.status(202).json({
    success: true,
    message: 'Poll triggered (running in background)'
  });
}));

/**
 * POST /api/news-connector/config
 * Update connector configuration without restarting
 *
 * Request body:
 * {
 *   "newsQuery": "tax",
 *   "topN": 5,
 *   "pollingIntervalMinutes": 60
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Configuration updated",
 *   "status": { ... }
 * }
 */
router.post('/config', validate(updateConfigSchema), asyncHandler(async (req, res) => {
  const { newsQuery, topN, pollingIntervalMinutes } = req.body;

  const connector = getNewsConnector();
  connector.updateConfig({
    newsQuery,
    topN,
    pollingIntervalMinutes
  });

  const status = connector.getStatus();

  res.json({
    success: true,
    message: 'Configuration updated',
    status
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
