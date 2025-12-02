import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Brain, Sparkles } from "lucide-react";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  jurisdiction: string;
  status: "proposed" | "enacted";
  impact: "high" | "medium" | "low" | "informational";
  type: "income" | "indirect" | "energy-specific";
  description: string;
  aiInsight?: string;
  beforeText?: string;
  afterText?: string;
  strategicImplications?: string[];
}

export default function RegulatoryPage() {
  const events: TimelineEvent[] = [
    {
      id: "1",
      date: "2025-11-08",
      title: "US Clean Energy Credit Extension",
      jurisdiction: "USA",
      status: "enacted",
      impact: "high",
      type: "energy-specific",
      description: "Treasury finalizes regulations extending production tax credits for offshore wind through 2035.",
      aiInsight: "AI Analysis: Legislative passage probability was correctly predicted at 82% in our May 2025 forecast. Text analysis of Treasury comments identified 3 key clarifications benefiting taxpayers: (1) Expanded definition of 'begin construction', (2) Wage requirement safe harbors, (3) Energy storage stacking rules. Financial impact modeling suggests $18.2M NPV benefit for planned Atlantic offshore projects, assuming 25-year PPA at $65/MWh.",
      beforeText: "PTC available through 2025 at $26/MWh",
      afterText: "PTC extended through 2035 at $27.5/MWh with prevailing wage requirements; direct pay option available",
      strategicImplications: [
        "Project financing: Lower WACC by 120 bps due to tax equity certainty through 2035",
        "Accelerate FID on 3 offshore wind projects previously on hold (combined 2.4 GW capacity)",
        "Transfer pricing: Establish cost-sharing for R&D on floating wind platforms to maximize credit utilization",
      ],
    },
    {
      id: "2",
      date: "2025-11-05",
      title: "UK Energy Profits Levy Extension",
      jurisdiction: "UK",
      status: "enacted",
      impact: "high",
      type: "energy-specific",
      description: "Windfall tax on oil and gas profits extended to 2030 with rate increase from 35% to 38%.",
      aiInsight: "AI Analysis: Sentiment analysis of parliamentary debate transcripts showed 94% likelihood of passage with amendments. Economic modeling indicates combined tax rate of 78% creates breakeven at $92/bbl (Brent), up from $78/bbl previously. Portfolio impact: 7 of 14 UK North Sea projects now sub-economic. Competitor analysis reveals Shell and BP announcing $4.2B in UK CapEx deferrals. Our recommended action: Accelerate decommissioning tax relief claims (estimated £340M NPV) and pivot investment to US Gulf of Mexico where fiscal terms more favorable.",
      beforeText: "Energy Profits Levy at 35% expiring 2028; investment allowance 80%",
      afterText: "EPL increased to 38% through 2030; investment allowance reduced to 66%; combined tax rate now 78%",
      strategicImplications: [
        "Capital allocation: Redirect $850M from UK development to US and Norway projects with superior fiscal terms",
        "Decommissioning: Accelerate abandonment of 3 mature fields to capture tax relief at current rates",
        "Political risk: Engage industry coalition lobbying for investment allowance restoration",
      ],
    },
    {
      id: "3",
      date: "2025-11-02",
      title: "France CBAM Expansion",
      jurisdiction: "France",
      status: "enacted",
      impact: "high",
      type: "energy-specific",
      description: "Carbon Border Adjustment Mechanism expands to include refined petroleum products.",
      aiInsight: "AI Analysis: Regulatory text analysis identified 47 product codes now covered (vs 12 previously). Emissions calculation methodology requires Scope 1 + Scope 2 + allocated Scope 3 upstream emissions. Our crude procurement from Russia, Kazakhstan, and Libya will incur €8-14/bbl CBAM cost (assumes EU ETS at €85/tonne). Annual impact: €420M increased costs for European refining segment. Competitor benchmarking: TotalEnergies already implementing carbon tracking systems; we are 6-8 months behind. Transfer pricing implication: Intercompany crude pricing must factor CBAM to avoid double-counting in arm's length analysis.",
      beforeText: "CBAM applies to crude oil imports only; voluntary reporting phase",
      afterText: "CBAM extended to gasoline, diesel, jet fuel; quarterly CBAM certificate purchases mandatory; €85/tonne CO2",
      strategicImplications: [
        "Supply chain: Shift 15% of crude sourcing from high-carbon suppliers to lower-emission producers (Algeria, Norway)",
        "Technology: Invest €180M in refinery energy efficiency to reduce Scope 1 emissions by 22%",
        "Pricing: Pass through 60-75% of CBAM costs to customers; competitive analysis shows market can absorb €0.06/liter",
      ],
    },
    {
      id: "4",
      date: "2025-11-01",
      title: "China Transfer Pricing Safe Harbors Tightened",
      jurisdiction: "China",
      status: "enacted",
      impact: "high",
      type: "income",
      description: "SAT narrows safe harbor ranges for intercompany services and financing transactions.",
      aiInsight: "AI Analysis: Comparative analysis of 284 SAT rulings from 2023-2025 shows median service markup declining from 7.2% to 5.4%. New Announcement 6 eliminates 'low value-added services' safe harbor entirely for energy sector. Our exposure: RMB 2.8B in intercompany technical services currently priced at cost + 8%. Audit probability model: 76% chance of challenge within 18 months based on (1) sector focus, (2) transaction size, and (3) markup delta. Recommended defense: Develop economic substance analysis demonstrating value creation in China, or restructure as principal arrangement with China entity owning intangibles.",
      beforeText: "Service markup safe harbor: 5-10%; documentation requirements light",
      afterText: "Service markup safe harbor reduced to 5-7%; contemporaneous documentation mandatory; economic substance test required",
      strategicImplications: [
        "Pricing: Reduce intercompany service markups from 8% to 6% prospectively; file supplementary TP documentation",
        "Restructuring: Evaluate principal model with China R&D entity owning Asia-Pac technology rights",
        "APA: Initiate bilateral advance pricing arrangement with IRS and SAT to create 5-year certainty",
      ],
    },
    {
      id: "5",
      date: "2025-10-30",
      title: "Germany E-Invoicing Postponed",
      jurisdiction: "Germany",
      status: "enacted",
      impact: "low",
      type: "indirect",
      description: "B2B e-invoicing mandate delayed by 6 months to July 2026.",
      aiInsight: "AI Analysis: Regulatory change triggered by coalition negotiations; text analysis of Bundestag proceedings shows 67% probability of further delays. System readiness assessment: Our SAP implementation 73% complete, now ahead of revised deadline. Cost-benefit: 6-month delay saves €2.4M in premium contractor costs, allows orderly internal deployment. Competitive intelligence: 34% of DAX companies not yet started implementation; we now have first-mover advantage for process optimization.",
      strategicImplications: [
        "IT systems: De-escalate implementation urgency; redeploy 12 IT resources to Pillar Two project",
        "Vendor management: Renegotiate milestone payments with Chorus Pro integrator; save €380K",
        "Process optimization: Use extra time to pilot e-invoicing in French subsidiary first; apply learnings to German rollout",
      ],
    },
    {
      id: "6",
      date: "2025-10-28",
      title: "India Transfer Pricing Documentation Update",
      jurisdiction: "India",
      status: "enacted",
      impact: "medium",
      type: "income",
      description: "Enhanced country-by-country reporting requirements and master file specifications.",
      aiInsight: "AI Analysis: Rule 10DA amendments require 14 additional data points including beneficial ownership chain, IP ownership structure, and financing arrangements detail. Natural language processing of Income Tax Rules suggests this aligns with BEPS Action 13 recommendations India previously declined. Compliance burden: +180 hours annually for documentation preparation. Our gap analysis identifies missing elements: (1) detailed financial forecasts for APA entities, (2) intra-group services agreements in local language, (3) functional analysis for 2 captive service centers. Penalty risk: INR 500K for incomplete filing + potential audit trigger.",
      beforeText: "Master file: 15 standard components; CbCR basic template",
      afterText: "Master file: 29 components including beneficial ownership, value chain analysis, and treasury policies; CbCR expanded with reconciliation schedules",
      strategicImplications: [
        "Compliance: Engage local Big 4 firm for enhanced documentation; budget INR 28M annually",
        "Technology: Implement transfer pricing software with automated CbCR reconciliation",
        "Tax planning: Review intra-group financing to ensure documentation supports arm's length nature",
      ],
    },
    {
      id: "7",
      date: "2025-10-25",
      title: "France Mandatory E-Invoicing B2B",
      jurisdiction: "France",
      status: "enacted",
      impact: "high",
      type: "indirect",
      description: "All B2B transactions must use certified e-invoicing platforms effective Q1 2026.",
      aiInsight: "AI Analysis: Legislative text mandates Chorus Pro or certified PDP (Plateforme de Dématérialisation Partenaire) for all B2B invoices. Our transaction volume analysis: 847K invoices/year requiring platform routing. Technology gap: Current EDI system non-compliant; requires full replacement or middleware layer. Cost estimate: €4.2M implementation + €820K annual operating. Non-compliance penalty: €15/invoice = €12.7M annual exposure. Timeline critical: 68-day implementation window insufficient for full SAP integration; recommend phased approach with manual fallback for Q1 2026.",
      beforeText: "Voluntary e-invoicing; paper and PDF invoices acceptable",
      afterText: "Mandatory e-invoicing via Chorus Pro or certified platform; real-time transmission to tax authority; structured data format required",
      strategicImplications: [
        "Vendor selection: RFP for certified PDP partner; evaluate Generix, Docaposte, Edicom",
        "Cash flow: Real-time invoice visibility to tax authority may accelerate VAT audits; stress-test VAT positions",
        "Process reengineering: Eliminate PDF invoice workflows; train 340 AP/AR staff on new system",
      ],
    },
    {
      id: "8",
      date: "2025-10-22",
      title: "India GST Rate Changes Proposed",
      jurisdiction: "India",
      status: "proposed",
      impact: "medium",
      type: "indirect",
      description: "GST Council proposes bringing natural gas under GST regime at 12% rate.",
      aiInsight: "AI Analysis: Proposal text suggests April 2026 implementation if approved in December 2025 Council meeting. Probability of enactment: 72% based on (1) revenue neutrality analysis, (2) industry support (74% positive), and (3) PM's pro-GST expansion stance. Financial impact for our operations: (1) Input tax credit availability reduces net cost by 8.4%, (2) State VAT elimination saves INR 180M/year, (3) Compliance simplification (14 state returns → 1 GST return). Price-to-customer: Expect 3-4% reduction enabling volume growth of 6-8%. Strategic positioning: Early-mover advantage if we pre-announce price reductions.",
      beforeText: "Natural gas outside GST; subject to multiple state VAT rates (12-25%); no input credit",
      afterText: "Natural gas under GST at 12%; full input tax credit available; uniform national rate",
      strategicImplications: [
        "Pricing strategy: Pre-emptively reduce natural gas prices by 3.5% to capture market share before competitors",
        "Supply agreements: Renegotiate long-term contracts to reflect GST inclusive pricing; avoid double taxation",
        "Systems: Modify SAP pricing master to handle transition from VAT to GST for gas products",
      ],
    },
    {
      id: "9",
      date: "2025-10-20",
      title: "UK Digital Services Tax Rate Increase",
      jurisdiction: "UK",
      status: "proposed",
      impact: "high",
      type: "indirect",
      description: "Proposed increase in Digital Services Tax from 2% to 5% on digital advertising and marketplace revenues.",
      aiInsight: "AI Analysis: Treasury consultation document released with 8-week comment period. Political economy analysis suggests 58% passage probability (Labour majority supports; Conservative opposition divided). Our exposure: £24M annually on digital fuel card marketplace platform. Tax is non-deductible for income tax, creating effective rate increase from 2% to 5% of gross revenue. Competitor impact: Shell and TotalEnergies with larger digital platforms face proportionally higher burden. Strategic option: Restructure digital services through Luxembourg subsidiary outside UK DST scope, but creates permanent establishment risk. Alternatively, increase merchant fees by 3.2% to pass through tax cost.",
      beforeText: "Digital Services Tax at 2% on revenues >£25M from UK users",
      afterText: "DST proposed at 5%; threshold unchanged; applies to digital marketplaces, search, and social media",
      strategicImplications: [
        "Tax planning: Model Luxembourg or Ireland restructuring for digital services; assess PE and withholding tax implications",
        "Commercial: Increase merchant fees 3.2% with 90-day notice; customer impact analysis shows <2% churn",
        "Advocacy: Join industry coalition submitting comments to HM Treasury; emphasize compliance cost and competitive harm",
      ],
    },
    {
      id: "10",
      date: "2025-10-18",
      title: "China VAT Rate Adjustment for Energy Sector",
      jurisdiction: "China",
      status: "proposed",
      impact: "medium",
      type: "indirect",
      description: "Proposal to reduce VAT rate on renewable energy from 13% to 9%.",
      aiInsight: "AI Analysis: State Council policy signals suggest approval likely in Q1 2026 as part of green energy stimulus package. Passage probability: 81%. Our renewable portfolio (solar, wind, battery storage) generates RMB 4.2B annual revenue; VAT reduction would decrease tax burden by RMB 168M annually. However, proposal includes phase-out of input credit on fossil fuel inputs, creating RMB 95M cost increase for thermal generation. Net benefit: RMB 73M. Competitive dynamics: State-owned enterprises (CNOOC, Sinopec) have higher renewable mix and benefit more; our relative competitive position weakens by 2.3%. Recommendation: Accelerate renewable capacity additions to capture full benefit.",
      beforeText: "VAT at 13% for all power generation; full input credit for fossil fuels",
      afterText: "VAT proposed at 9% for renewable energy; fossil fuel input credits limited to 70%",
      strategicImplications: [
        "Capital allocation: Accelerate $2.1B renewable energy CapEx planned for 2027-2028; pull forward to 2026",
        "Hedging: Lock in EPC contracts for 850 MW solar pipeline before VAT change drives equipment price increases",
        "Tax planning: Ensure renewable projects properly classified under new VAT codes; work with State Grid on invoicing",
      ],
    },
  ];

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "bg-destructive text-destructive-foreground",
      medium: "bg-primary text-primary-foreground",
      low: "bg-accent text-accent-foreground",
      informational: "bg-muted text-muted-foreground",
    };
    return colors[impact as keyof typeof colors] || colors.informational;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Regulatory Change Timeline</h1>
        <p className="text-muted-foreground mt-1">Chronological feed with AI-powered strategic analysis and predictive insights</p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline" data-testid="tab-timeline">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="comparison" data-testid="tab-comparison">
              <FileText className="h-4 w-4 mr-2" />
              What Changed
            </TabsTrigger>
            <TabsTrigger value="ai-insights" data-testid="tab-ai-insights">
              <Brain className="h-4 w-4 mr-2" />
              AI Strategic Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <div className="relative space-y-6">
              <div className="absolute left-[30px] top-0 bottom-0 w-0.5 bg-border" />
              {events.map((event) => (
                <div key={event.id} className="relative pl-16">
                  <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  <Card className="p-4 hover-elevate" data-testid={`card-event-${event.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-mono">{event.date}</span>
                          <Badge variant="outline">{event.jurisdiction}</Badge>
                          <Badge variant="outline">{event.status}</Badge>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                      </div>
                      <Badge className={getImpactColor(event.impact)}>{event.impact.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6 space-y-6">
            {events
              .filter((e) => e.beforeText && e.afterText)
              .map((event) => (
                <Card key={event.id} className="p-6" data-testid={`card-comparison-${event.id}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <Badge variant="outline">{event.jurisdiction}</Badge>
                    <Badge className={getImpactColor(event.impact)}>{event.impact.toUpperCase()}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-destructive/10 rounded-md border border-destructive/20">
                      <p className="text-xs font-semibold text-destructive mb-2">BEFORE</p>
                      <p className="text-sm">{event.beforeText}</p>
                    </div>
                    <div className="p-4 bg-[#22C55E]/10 rounded-md border border-[#22C55E]/20">
                      <p className="text-xs font-semibold text-[#22C55E] mb-2">AFTER</p>
                      <p className="text-sm">{event.afterText}</p>
                    </div>
                  </div>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-6 space-y-6">
            {events.map((event) => (
              <Card key={event.id} className="p-6" data-testid={`card-ai-${event.id}`}>
                <div className="flex items-start gap-3 mb-4">
                  <Sparkles className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge variant="outline">{event.jurisdiction}</Badge>
                      <Badge className={getImpactColor(event.impact)}>{event.impact.toUpperCase()}</Badge>
                    </div>
                    {event.aiInsight && (
                      <div className="bg-muted/50 rounded-md p-4 mb-4">
                        <p className="text-sm leading-relaxed">{event.aiInsight}</p>
                      </div>
                    )}
                    {event.strategicImplications && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Strategic Action Items:</p>
                        <ul className="space-y-2">
                          {event.strategicImplications.map((implication, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">→</span>
                              <span>{implication}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
