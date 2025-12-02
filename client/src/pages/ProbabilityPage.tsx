import ProbabilityChart, { type ProbabilityData } from "@/components/ProbabilityChart";

export default function ProbabilityPage() {
  const forecasts = [
    {
      title: "Carbon Border Adjustment Mechanism (CBAM) Extension",
      country: "France",
      currentProbability: 78,
      data: [
        { date: "2025-05", probability: 15, confidenceLow: 10, confidenceHigh: 22 },
        { date: "2025-06", probability: 22, confidenceLow: 15, confidenceHigh: 30 },
        { date: "2025-07", probability: 35, confidenceLow: 28, confidenceHigh: 45 },
        { date: "2025-08", probability: 48, confidenceLow: 40, confidenceHigh: 58 },
        { date: "2025-09", probability: 62, confidenceLow: 54, confidenceHigh: 72 },
        { date: "2025-10", probability: 73, confidenceLow: 65, confidenceHigh: 82 },
        { date: "2025-11", probability: 78, confidenceLow: 70, confidenceHigh: 87 },
      ],
    },
    {
      title: "Digital Services Tax Rate Increase",
      country: "United Kingdom",
      currentProbability: 65,
      data: [
        { date: "2025-05", probability: 32, confidenceLow: 25, confidenceHigh: 40 },
        { date: "2025-06", probability: 38, confidenceLow: 30, confidenceHigh: 47 },
        { date: "2025-07", probability: 45, confidenceLow: 37, confidenceHigh: 55 },
        { date: "2025-08", probability: 52, confidenceLow: 44, confidenceHigh: 62 },
        { date: "2025-09", probability: 58, confidenceLow: 50, confidenceHigh: 68 },
        { date: "2025-10", probability: 62, confidenceLow: 54, confidenceHigh: 72 },
        { date: "2025-11", probability: 65, confidenceLow: 57, confidenceHigh: 75 },
      ],
    },
    {
      title: "Renewable Energy Tax Credit Extension",
      country: "United States",
      currentProbability: 42,
      data: [
        { date: "2025-05", probability: 55, confidenceLow: 45, confidenceHigh: 65 },
        { date: "2025-06", probability: 52, confidenceLow: 42, confidenceHigh: 62 },
        { date: "2025-07", probability: 48, confidenceLow: 38, confidenceHigh: 58 },
        { date: "2025-08", probability: 45, confidenceLow: 35, confidenceHigh: 55 },
        { date: "2025-09", probability: 43, confidenceLow: 33, confidenceHigh: 53 },
        { date: "2025-10", probability: 42, confidenceLow: 32, confidenceHigh: 52 },
        { date: "2025-11", probability: 42, confidenceLow: 32, confidenceHigh: 52 },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Tax Policy Change Probability Scores</h1>
        <p className="text-muted-foreground mt-1">ML-powered forecasting of tax law enactment likelihood</p>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {forecasts.map((forecast, idx) => (
            <ProbabilityChart key={idx} {...forecast} />
          ))}
        </div>
      </div>
    </div>
  );
}
