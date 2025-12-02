import { useState } from 'react';
import JurisdictionPanel, { type JurisdictionData } from '../JurisdictionPanel';
import { Button } from '@/components/ui/button';

export default function JurisdictionPanelExample() {
  const [isOpen, setIsOpen] = useState(true);

  const mockData: JurisdictionData = {
    code: "USA",
    name: "United States",
    riskLevel: "emerging",
    riskScore: 45,
    regulatoryChanges: [
      {
        id: "1",
        title: "Corporate Alternative Minimum Tax (CAMT) Implementation",
        date: "2025-11-05",
        status: "enacted",
        impact: "high",
        type: "income"
      },
      {
        id: "2",
        title: "Clean Energy Tax Credit Extension Proposal",
        date: "2025-10-28",
        status: "proposed",
        impact: "medium",
        type: "energy-specific"
      },
      {
        id: "3",
        title: "State-Level Digital Services Tax Expansion",
        date: "2025-10-15",
        status: "proposed",
        impact: "medium",
        type: "indirect"
      }
    ],
    riskDimensions: {
      regulatory: 55,
      audit: 42,
      compliance: 38,
      financial: 48,
      reputational: 35
    },
    taxPresence: {
      entities: 47,
      effectiveTaxRate: 21.5,
      annualTaxPaid: 3420,
      auditHistory: "Last audit completed Q3 2023 with no material adjustments. IRS examining FY2022-2023 transfer pricing positions."
    }
  };

  return (
    <div className="h-screen relative">
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="m-4">
          Open Panel
        </Button>
      )}
      <JurisdictionPanel 
        data={isOpen ? mockData : null}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
