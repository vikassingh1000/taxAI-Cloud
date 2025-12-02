import { useState } from "react";
import WorldMap, { type CountryData } from "@/components/WorldMap";
import JurisdictionPanel, { type JurisdictionData } from "@/components/JurisdictionPanel";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionData | null>(null);

  const countries: CountryData[] = [
    { code: "USA", name: "United States", riskLevel: "emerging", riskScore: 45, alerts: 3, trend: "up", taxFootprint: 15000 },
    { code: "GBR", name: "United Kingdom", riskLevel: "elevated", riskScore: 62, alerts: 5, trend: "up", taxFootprint: 8500 },
    { code: "DEU", name: "Germany", riskLevel: "low", riskScore: 28, alerts: 1, trend: "stable", taxFootprint: 9200 },
    { code: "FRA", name: "France", riskLevel: "immediate", riskScore: 78, alerts: 8, trend: "up", taxFootprint: 7800 },
    { code: "IND", name: "India", riskLevel: "emerging", riskScore: 52, alerts: 4, trend: "down", taxFootprint: 5600 },
    { code: "CHN", name: "China", riskLevel: "elevated", riskScore: 68, alerts: 6, trend: "stable", taxFootprint: 12000 },
  ];

  const jurisdictionData: Record<string, JurisdictionData> = {
    USA: {
      code: "USA",
      name: "United States",
      riskLevel: "emerging",
      riskScore: 45,
      regulatoryChanges: [
        { id: "1", title: "Corporate Alternative Minimum Tax (CAMT) Implementation", date: "2025-11-05", status: "enacted", impact: "high", type: "income" },
        { id: "2", title: "Clean Energy Tax Credit Extension Proposal", date: "2025-10-28", status: "proposed", impact: "medium", type: "energy-specific" },
        { id: "3", title: "State-Level Digital Services Tax Expansion", date: "2025-10-15", status: "proposed", impact: "medium", type: "indirect" },
      ],
      riskDimensions: { regulatory: 55, audit: 42, compliance: 38, financial: 48, reputational: 35 },
      taxPresence: { entities: 47, effectiveTaxRate: 21.5, annualTaxPaid: 3420, auditHistory: "Last audit completed Q3 2023 with no material adjustments." },
    },
    GBR: {
      code: "GBR",
      name: "United Kingdom",
      riskLevel: "elevated",
      riskScore: 62,
      regulatoryChanges: [
        { id: "1", title: "Energy Profits Levy Extension to 2030", date: "2025-11-05", status: "enacted", impact: "high", type: "energy-specific" },
        { id: "2", title: "Digital Services Tax Rate Increase", date: "2025-10-20", status: "proposed", impact: "high", type: "indirect" },
      ],
      riskDimensions: { regulatory: 70, audit: 55, compliance: 62, financial: 68, reputational: 58 },
      taxPresence: { entities: 23, effectiveTaxRate: 28.3, annualTaxPaid: 1890, auditHistory: "Active audit of FY2022-2023 ongoing." },
    },
    DEU: {
      code: "DEU",
      name: "Germany",
      riskLevel: "low",
      riskScore: 28,
      regulatoryChanges: [
        { id: "1", title: "E-Invoicing Mandate Postponed", date: "2025-10-18", status: "enacted", impact: "low", type: "indirect" },
      ],
      riskDimensions: { regulatory: 30, audit: 25, compliance: 28, financial: 32, reputational: 22 },
      taxPresence: { entities: 18, effectiveTaxRate: 30.2, annualTaxPaid: 2140, auditHistory: "No recent audits. Last examination 2021." },
    },
    FRA: {
      code: "FRA",
      name: "France",
      riskLevel: "immediate",
      riskScore: 78,
      regulatoryChanges: [
        { id: "1", title: "Carbon Border Adjustment Mechanism (CBAM) Expansion", date: "2025-11-02", status: "enacted", impact: "high", type: "energy-specific" },
        { id: "2", title: "Mandatory E-Invoicing B2B Implementation", date: "2025-10-25", status: "enacted", impact: "high", type: "indirect" },
        { id: "3", title: "Pillar Two Global Minimum Tax Rules", date: "2025-10-10", status: "enacted", impact: "high", type: "income" },
      ],
      riskDimensions: { regulatory: 82, audit: 75, compliance: 78, financial: 80, reputational: 72 },
      taxPresence: { entities: 31, effectiveTaxRate: 32.4, annualTaxPaid: 2760, auditHistory: "Multiple active audits including transfer pricing." },
    },
    IND: {
      code: "IND",
      name: "India",
      riskLevel: "emerging",
      riskScore: 52,
      regulatoryChanges: [
        { id: "1", title: "GST Rate Changes for Petroleum Products", date: "2025-10-22", status: "proposed", impact: "medium", type: "indirect" },
        { id: "2", title: "Transfer Pricing Documentation Requirements Update", date: "2025-10-12", status: "enacted", impact: "medium", type: "income" },
      ],
      riskDimensions: { regulatory: 58, audit: 48, compliance: 52, financial: 55, reputational: 45 },
      taxPresence: { entities: 14, effectiveTaxRate: 25.2, annualTaxPaid: 980, auditHistory: "Ongoing assessment for FY2021-2022." },
    },
    CHN: {
      code: "CHN",
      name: "China",
      riskLevel: "elevated",
      riskScore: 68,
      regulatoryChanges: [
        { id: "1", title: "Transfer Pricing Safe Harbor Rules Tightened", date: "2025-11-01", status: "enacted", impact: "high", type: "income" },
        { id: "2", title: "VAT Rate Adjustment for Energy Sector", date: "2025-10-18", status: "proposed", impact: "medium", type: "indirect" },
      ],
      riskDimensions: { regulatory: 72, audit: 65, compliance: 68, financial: 70, reputational: 62 },
      taxPresence: { entities: 26, effectiveTaxRate: 24.8, annualTaxPaid: 2350, auditHistory: "Regular audits. Last completed Q2 2024." },
    },
  };

  const handleCountryClick = (country: CountryData) => {
    setSelectedJurisdiction(jurisdictionData[country.code] || null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Intelligent Risk Radar</h1>
        <p className="text-muted-foreground mt-1">Global tax risk visualization and command center</p>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Jurisdictions</p>
            <p className="text-3xl font-bold font-mono">6</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active Alerts</p>
            <p className="text-3xl font-bold font-mono text-primary">27</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Avg Risk Score</p>
            <p className="text-3xl font-bold font-mono">55.5</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">High Risk Countries</p>
            <p className="text-3xl font-bold font-mono text-destructive">2</p>
          </Card>
        </div>

        <div className="h-[600px]">
          <WorldMap countries={countries} onCountryClick={handleCountryClick} />
        </div>
      </div>

      <JurisdictionPanel data={selectedJurisdiction} onClose={() => setSelectedJurisdiction(null)} />
    </div>
  );
}
