import GapAssessment, { type Gap } from '../GapAssessment';

export default function GapAssessmentExample() {
  const mockGaps: Gap[] = [
    {
      id: "1",
      type: "compliance",
      title: "Missing CbCR Filing - India",
      description: "Country-by-Country Report for FY2024 not filed. Deadline approaching in 30 days.",
      jurisdiction: "India",
      severity: "high",
      dueDate: "2025-12-15"
    },
    {
      id: "2",
      type: "position",
      title: "Transfer Pricing Documentation Gap - China",
      description: "Intercompany service agreements lack contemporaneous documentation required under new rules.",
      jurisdiction: "China",
      severity: "high",
      dueDate: "2025-12-31"
    },
    {
      id: "3",
      type: "opportunity",
      title: "Unclaimed R&D Tax Credits - USA",
      description: "Renewable energy R&D activities eligible for enhanced tax credits not claimed in prior year.",
      jurisdiction: "USA",
      severity: "medium"
    },
    {
      id: "4",
      type: "risk",
      title: "PE Exposure - Germany",
      description: "Increased local activities may create permanent establishment risk under updated treaty interpretation.",
      jurisdiction: "Germany",
      severity: "high"
    },
    {
      id: "5",
      type: "compliance",
      title: "E-Invoicing Mandate - France",
      description: "New B2B e-invoicing requirements effective Q1 2026. System integration required.",
      jurisdiction: "France",
      severity: "medium",
      dueDate: "2026-01-01"
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Cross-Reference Engine - Gap Assessment</h2>
      <GapAssessment 
        gaps={mockGaps}
        onGapClick={(gap) => console.log("Gap clicked:", gap.title)}
      />
    </div>
  );
}
