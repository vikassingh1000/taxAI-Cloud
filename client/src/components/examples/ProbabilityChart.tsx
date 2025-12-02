import ProbabilityChart, { type ProbabilityData } from '../ProbabilityChart';

export default function ProbabilityChartExample() {
  const mockData: ProbabilityData[] = [
    { date: "2025-05", probability: 15, confidenceLow: 10, confidenceHigh: 22 },
    { date: "2025-06", probability: 22, confidenceLow: 15, confidenceHigh: 30 },
    { date: "2025-07", probability: 35, confidenceLow: 28, confidenceHigh: 45 },
    { date: "2025-08", probability: 48, confidenceLow: 40, confidenceHigh: 58 },
    { date: "2025-09", probability: 62, confidenceLow: 54, confidenceHigh: 72 },
    { date: "2025-10", probability: 73, confidenceLow: 65, confidenceHigh: 82 },
    { date: "2025-11", probability: 78, confidenceLow: 70, confidenceHigh: 87 },
  ];

  return (
    <div className="p-4">
      <ProbabilityChart
        title="Carbon Border Adjustment Mechanism (CBAM) Extension"
        country="France"
        data={mockData}
        currentProbability={78}
      />
    </div>
  );
}
