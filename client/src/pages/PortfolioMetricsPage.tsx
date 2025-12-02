import PortfolioMetrics from "@/components/PortfolioMetrics";

export default function PortfolioMetricsPage() {
  const metrics = {
    weightedRisk: { label: "Weighted Average Risk", value: 52, trend: "up" as const, trendValue: "+3.2%" },
    riskConcentration: { label: "Risk Concentration Index", value: 38, trend: "stable" as const, trendValue: "0%" },
    riskVelocity: { label: "Risk Velocity", value: 2.4, trend: "up" as const, trendValue: "+0.5" },
    valueAtRisk: { label: "Value at Risk (95%)", value: 847, trend: "down" as const, trendValue: "-5.1%" },
  };

  const distribution = [
    { jurisdiction: "USA", riskScore: 45 },
    { jurisdiction: "UK", riskScore: 62 },
    { jurisdiction: "Germany", riskScore: 28 },
    { jurisdiction: "France", riskScore: 78 },
    { jurisdiction: "India", riskScore: 52 },
    { jurisdiction: "China", riskScore: 68 },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Global Risk Portfolio Metrics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive risk analytics and distribution analysis</p>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <PortfolioMetrics metrics={metrics} riskDistribution={distribution} />
      </div>
    </div>
  );
}
