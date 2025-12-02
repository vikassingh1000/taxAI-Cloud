import { Router } from "express";
import { getIngestionService } from "../services/taxAlertIngestionService";

const router = Router();
const ingestionService = getIngestionService();

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
  // Map based on tax type and characteristics
  // if (alert.complianceRisk === "CRITICAL") return "alert";
  const taxType = alert.taxType?.toLowerCase();
  if (taxType === "gst") return "GST";
  if (taxType === "vat") return "GST";
  if (taxType === "transfer pricing") return "Transfer Price";
  if (taxType === "corporate tax") return "Corporate Tax";
  if (taxType === "regulatory") return "regulatory";
  return "others";
}


// GET /api/feeds
router.get("/", async (_req, res) => {
  try {
    // Fetch all tax alerts from database
    const alerts = await ingestionService.getAllAlerts(100, 0);

    // Map tax alerts to feed format
    const feeds = alerts.map((alert) => ({
      id: String(alert.id),
      timestamp: getRelativeTime(alert.createdAt),
      type: determineFeedType(alert),
      title: alert.title,
      jurisdiction: mapJurisdiction(alert.country),
      priority: mapPriority(alert.priority),
      summary: alert.summary,
      category: mapCategory(alert.taxType),
      // Additional metadata for potential frontend use
      taxType: alert.taxType,
      confidence: alert.overallConfidence,
      complianceRisk: alert.complianceRisk,
      estimatedDeadline: alert.estimatedDeadline,
    }));

    res.json(feeds);
  } catch (error) {
    console.error("Error fetching feeds:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch feeds",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
