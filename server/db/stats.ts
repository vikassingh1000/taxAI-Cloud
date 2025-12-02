/**
 * Database Statistics Script
 * Shows statistics and insights from the tax alerts database
 */

import 'dotenv/config';
import { getDbService } from './taxAlertService';

async function showStats() {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('  TAX ALERTS DATABASE STATISTICS');
  console.log('═'.repeat(80));
  console.log();

  const db = getDbService();

  try {
    // Get overall stats
    const stats = await db.getStats();

    console.log('📊 OVERALL STATISTICS');
    console.log('─'.repeat(80));
    console.log(`  Total Alerts: ${stats.total}`);
    console.log(`  Average Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
    console.log();

    // By Country
    if (Object.keys(stats.byCountry).length > 0) {
      console.log('🌍 BY COUNTRY');
      console.log('─'.repeat(80));
      Object.entries(stats.byCountry)
        .sort(([, a], [, b]) => b - a)
        .forEach(([country, count]) => {
          const bar = '█'.repeat(Math.min(count * 2, 40));
          console.log(`  ${country.padEnd(10)} ${String(count).padStart(4)} ${bar}`);
        });
      console.log();
    }

    // By Priority
    if (Object.keys(stats.byPriority).length > 0) {
      console.log('⚠️  BY PRIORITY');
      console.log('─'.repeat(80));
      const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      priorityOrder.forEach(priority => {
        const count = stats.byPriority[priority] || 0;
        if (count > 0) {
          const emoji = priority === 'CRITICAL' ? '🔴' : priority === 'HIGH' ? '🟠' : priority === 'MEDIUM' ? '🟡' : '🟢';
          const bar = '█'.repeat(Math.min(count * 2, 40));
          console.log(`  ${emoji} ${priority.padEnd(10)} ${String(count).padStart(4)} ${bar}`);
        }
      });
      console.log();
    }

    // By Tax Type
    if (Object.keys(stats.byTaxType).length > 0) {
      console.log('💼 BY TAX TYPE');
      console.log('─'.repeat(80));
      Object.entries(stats.byTaxType)
        .sort(([, a], [, b]) => b - a)
        .forEach(([taxType, count]) => {
          const bar = '█'.repeat(Math.min(count * 2, 40));
          console.log(`  ${taxType.padEnd(20)} ${String(count).padStart(4)} ${bar}`);
        });
      console.log();
    }

    // Recent alerts
    console.log('🕐 RECENT ALERTS (Last 5)');
    console.log('─'.repeat(80));
    const recentAlerts = await db.getAll(5);

    if (recentAlerts.length > 0) {
      recentAlerts.forEach((alert, idx) => {
        const date = new Date(alert.extractedAt).toLocaleDateString();
        const priorityEmoji = alert.priority === 'CRITICAL' ? '🔴' : alert.priority === 'HIGH' ? '🟠' : alert.priority === 'MEDIUM' ? '🟡' : '🟢';
        console.log(`  ${idx + 1}. ${priorityEmoji} [${alert.country}] ${alert.title.substring(0, 50)}...`);
        console.log(`     Tax Type: ${alert.taxType} | Confidence: ${(alert.overallConfidence * 100).toFixed(1)}% | Date: ${date}`);
        console.log();
      });
    } else {
      console.log('  No alerts in database yet.');
      console.log('  Run: npm run ai:example');
      console.log();
    }

    // Critical alerts
    const criticalAlerts = await db.getCriticalAlerts(10);
    if (criticalAlerts.length > 0) {
      console.log('🚨 CRITICAL/HIGH PRIORITY ALERTS');
      console.log('─'.repeat(80));
      criticalAlerts.forEach((alert, idx) => {
        const deadline = alert.estimatedDeadline || 'Not specified';
        console.log(`  ${idx + 1}. [${alert.priority}] ${alert.title.substring(0, 55)}`);
        console.log(`     Country: ${alert.country} | Deadline: ${deadline}`);
        console.log();
      });
    }

    // Database file info
    const dbPath = db.getDbPath();
    console.log('📁 DATABASE INFO');
    console.log('─'.repeat(80));
    console.log(`  Location: ${dbPath}`);
    console.log();

    console.log('═'.repeat(80));
    console.log();
    console.log('Commands:');
    console.log('  View in browser: npm run db:studio');
    console.log('  Run extraction:  npm run ai:example');
    console.log();

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
  }
}

// Run stats
showStats().then(() => process.exit(0)).catch(console.error);
