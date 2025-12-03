/**
 * WebSocket Service for Real-time Feeds
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { getIngestionService } from "./taxAlertIngestionService";

let wss: WebSocketServer | null = null;
let broadcastInterval: NodeJS.Timeout | null = null;

/**
 * Map tax alert priority to feed priority format
 */
function mapPriority(priority: string): string {
  return priority.toLowerCase();
}

/**
 * Map tax type to feed category
 */
function mapCategory(taxType: string): string {
  const categoryMap: Record<string, string> = {
    "Corporate Tax": "Corporate Tax",
    "VAT": "VAT/GST",
    "Transfer Pricing": "Transfer Price",
    "GILTI": "GILTI",
    "Sales Tax": "Sales Tax",
    "Energy Tax": "Energy Tax",
    "Withholding Tax": "Withholding Tax",
    "Customs Duty": "Customs Duty",
    "Other": "Regulatory"
  };
  return categoryMap[taxType] || "Regulatory";
}

/**
 * Map country code to jurisdiction name
 */
function mapJurisdiction(country: string): string {
  const jurisdictionMap: Record<string, string> = {
    "US": "USA",
    "UK": "UK",
    "EU": "EU",
    "OTHER": "International"
  };
  return jurisdictionMap[country] || country;
}

/**
 * Calculate relative timestamp from ISO date
 */
function getRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

/**
 * Determine feed type based on tax alert characteristics
 */
function determineFeedType(alert: any): string {
  const taxType = alert.taxType?.toLowerCase();
  if (taxType === "gst") return "GST";
  if (taxType === "vat") return "GST";
  if (taxType === "transfer pricing") return "Transfer Price";
  if (taxType === "corporate tax") return "Corporate Tax";
  if (taxType === "regulatory") return "regulatory";
  return "others";
}

/**
 * Transform alerts to feed format
 */
function transformAlertsToFeeds(alerts: any[]) {
  return alerts.map((alert) => ({
    id: String(alert.id),
    timestamp: getRelativeTime(alert.createdAt),
    type: determineFeedType(alert),
    title: alert.title,
    jurisdiction: mapJurisdiction(alert.country),
    priority: mapPriority(alert.priority),
    summary: alert.summary,
    category: mapCategory(alert.taxType),
    taxType: alert.taxType,
    confidence: alert.overallConfidence,
    complianceRisk: alert.complianceRisk,
    estimatedDeadline: alert.estimatedDeadline,
  }));
}

/**
 * Broadcast feeds to all connected clients
 */
async function broadcastFeeds() {
  if (!wss) return;

  try {
    const ingestionService = getIngestionService();
    const alerts = await ingestionService.getAllAlerts(100, 0);
    const feeds = transformAlertsToFeeds(alerts);

    const message = JSON.stringify({
      type: "feeds",
      data: feeds,
      timestamp: new Date().toISOString()
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    console.error("Error broadcasting feeds:", error);
  }
}

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: "/ws/feeds" });

  console.log("WebSocket server initialized on /ws/feeds");

  wss.on("connection", async (ws) => {
    console.log("New WebSocket client connected");

    // Send initial feeds immediately on connection
    try {
      const ingestionService = getIngestionService();
      const alerts = await ingestionService.getAllAlerts(100, 0);
      const feeds = transformAlertsToFeeds(alerts);

      ws.send(JSON.stringify({
        type: "feeds",
        data: feeds,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error sending initial feeds:", error);
    }

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received message:", data);

        // Handle different message types if needed
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // Start broadcasting feeds every 1 second
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
  }
  broadcastInterval = setInterval(broadcastFeeds, 1000);

  return wss;
}

/**
 * Broadcast a new feed item to all clients (call when new alert is added)
 */
export function broadcastNewFeed(feed: any) {
  if (!wss) return;

  const message = JSON.stringify({
    type: "new_feed",
    data: feed,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Get WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}

/**
 * Cleanup WebSocket server
 */
export function closeWebSocket() {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
  if (wss) {
    wss.close();
    wss = null;
  }
}