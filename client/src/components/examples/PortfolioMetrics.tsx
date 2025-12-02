import PortfolioMetrics from '../PortfolioMetrics';

export default function PortfolioMetricsExample() {
  const mockMetrics = {
    weightedRisk: {
      label: "Weighted Average Risk",
      value: 52,
      trend: "up" as const,
      trendValue: "+3.2%"
    },
    riskConcentration: {
      label: "Risk Concentration Index",
      value: 38,
      trend: "stable" as const,
      trendValue: "0%"
    },
    riskVelocity: {
      label: "Risk Velocity",
      value: 2.4,
      trend: "up" as const,
      trendValue: "+0.5"
    },
    valueAtRisk: {
      label: "Value at Risk (95%)",
      value: 847,
      trend: "down" as const,
      trendValue: "-5.1%"
    }
  };

  const mockDistribution = [
    { jurisdiction: "USA", riskScore: 45 },
    { jurisdiction: "UK", riskScore: 62 },
    { jurisdiction: "Germany", riskScore: 28 },
    { jurisdiction: "France", riskScore: 78 },
    { jurisdiction: "India", riskScore: 52 },
    { jurisdiction: "China", riskScore: 68 }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Global Risk Portfolio Metrics</h2>
      <PortfolioMetrics metrics={mockMetrics} riskDistribution={mockDistribution} />
    </div>
  );
}
