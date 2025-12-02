import EnergyLensFeed, { type EnergyEvent } from '../EnergyLensFeed';

export default function EnergyLensFeedExample() {
  const mockEvents: EnergyEvent[] = [
    {
      id: "1",
      title: "US Inflation Reduction Act - Clean Energy Credit Extension",
      date: "2025-11-08",
      sector: "renewables",
      impact: "high",
      description: "Treasury issues final regulations extending production tax credits for offshore wind projects through 2035.",
      commodityContext: "Offshore wind development accelerating; installed capacity projected to reach 30 GW by 2030.",
      taxImplications: [
        "Enhanced PTC rates of $27.5/MWh available for projects meeting prevailing wage requirements",
        "Direct pay election available for tax-exempt entities through 2032",
        "Energy storage add-on qualification extends ITC benefits"
      ]
    },
    {
      id: "2",
      title: "EU Carbon Border Adjustment Mechanism (CBAM) Reporting Begins",
      date: "2025-10-30",
      sector: "upstream",
      impact: "high",
      description: "First quarterly CBAM reports due for importers of crude oil and refined products into EU.",
      commodityContext: "Brent crude at $82/bbl; carbon pricing differential creating $8-12/bbl cost impact on non-EU imports.",
      taxImplications: [
        "Embedded emissions reporting required for all crude imports from non-EU sources",
        "CBAM certificates pricing at €85/tonne CO2, creating material cost increase",
        "Transfer pricing implications for intercompany crude purchases"
      ]
    },
    {
      id: "3",
      title: "India GST Rate Changes for Petroleum Products",
      date: "2025-10-22",
      sector: "downstream",
      impact: "medium",
      description: "GST Council proposes bringing natural gas under GST regime at 12% rate, effective April 2026.",
      taxImplications: [
        "Input tax credit availability will reduce cascading tax effect",
        "Petroleum products remain outside GST for now",
        "State VAT implications require separate analysis"
      ]
    },
    {
      id: "4",
      title: "UK Windfall Tax Extension Proposed",
      date: "2025-11-05",
      sector: "upstream",
      impact: "high",
      description: "Energy Profits Levy extended through 2030 with increased rate from 35% to 38%.",
      commodityContext: "North Sea production declining; oil at $80/bbl makes incremental projects economically marginal.",
      taxImplications: [
        "Effective combined tax rate on UK upstream profits now 78%",
        "Investment allowance reduced from 80% to 66%",
        "Decommissioning tax relief timing accelerated"
      ]
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Energy Lens Intelligence Feed</h2>
      <EnergyLensFeed events={mockEvents} />
    </div>
  );
}
