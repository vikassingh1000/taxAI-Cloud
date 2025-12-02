// import GapAssessment, { type Gap } from "@/components/GapAssessment";
// import { Card } from "@/components/ui/card";
// import { Brain, TrendingUp, AlertTriangle, Target, DollarSign, Shield } from "lucide-react";
// import { Separator } from "@/components/ui/separator";

// export default function GapsPage() {
//   const gaps: Gap[] = [
//     {
//       id: "1",
//       type: "compliance",
//       title: "Missing CbCR Filing - India",
//       description: "Country-by-Country Report for FY2024 not filed. Deadline approaching in 30 days.",
//       jurisdiction: "India",
//       severity: "high",
//       dueDate: "2025-12-15",
//     },
//     {
//       id: "2",
//       type: "position",
//       title: "Transfer Pricing Documentation Gap - China",
//       description: "Intercompany service agreements lack contemporaneous documentation required under new SAT Announcement 6 rules.",
//       jurisdiction: "China",
//       severity: "high",
//       dueDate: "2025-12-31",
//     },
//     {
//       id: "3",
//       type: "opportunity",
//       title: "Unclaimed R&D Tax Credits - USA",
//       description: "Renewable energy R&D activities in Q1-Q3 2024 eligible for Section 41 credits + IRA enhanced incentives not claimed in prior year filing.",
//       jurisdiction: "USA",
//       severity: "medium",
//     },
//     {
//       id: "4",
//       type: "risk",
//       title: "PE Exposure - Germany",
//       description: "Increased local activities may create permanent establishment under updated treaty interpretation (BMF guidance 10/2024).",
//       jurisdiction: "Germany",
//       severity: "high",
//     },
//     {
//       id: "5",
//       type: "compliance",
//       title: "E-Invoicing Mandate - France",
//       description: "New B2B e-invoicing requirements effective Q1 2026. System integration gap identified.",
//       jurisdiction: "France",
//       severity: "medium",
//       dueDate: "2026-01-01",
//     },
//     {
//       id: "6",
//       type: "position",
//       title: "Pillar Two GloBE Calculation - UK",
//       description: "Global minimum tax calculation methodology requires validation against OECD safe harbors for FY2025.",
//       jurisdiction: "UK",
//       severity: "high",
//       dueDate: "2025-12-20",
//     },
//     {
//       id: "7",
//       type: "opportunity",
//       title: "Renewable Energy Credits - India",
//       description: "Solar project investments in Rajasthan (commissioned Q2 2024) qualify for accelerated depreciation benefits at 40% not yet claimed.",
//       jurisdiction: "India",
//       severity: "low",
//     },
//     {
//       id: "8",
//       type: "risk",
//       title: "Withholding Tax Exposure - China",
//       description: "Service payments to Singapore parent ($18.6M in 2024) may trigger 10% withholding under revised tax treaty interpretation.",
//       jurisdiction: "China",
//       severity: "medium",
//     },
//     {
//       id: "9",
//       type: "compliance",
//       title: "Pillar Two IIR Filing - France",
//       description: "Income Inclusion Rule (IIR) filing required by 12/31/2025 for French parent company.",
//       jurisdiction: "France",
//       severity: "high",
//       dueDate: "2025-12-31",
//     },
//     {
//       id: "10",
//       type: "opportunity",
//       title: "Energy Efficiency Tax Deduction - USA",
//       description: "Section 179D commercial building energy efficiency deduction available for 3 facilities upgraded in 2024.",
//       jurisdiction: "USA",
//       severity: "medium",
//     },
//     {
//       id: "11",
//       type: "position",
//       title: "Controlled Foreign Corporation (CFC) Attribution - USA",
//       description: "Subpart F income calculations for 8 CFCs may overstate GILTI inclusion by $12.4M due to incorrect high-tax exclusion elections.",
//       jurisdiction: "USA",
//       severity: "high",
//     },
//     {
//       id: "12",
//       type: "risk",
//       title: "VAT Recovery Limitation - UK",
//       description: "Input VAT recovery on mixed-use assets (corporate aircraft, dual-purpose vehicles) may be overstated.",
//       jurisdiction: "UK",
//       severity: "high",
//     },
//     {
//       id: "13",
//       type: "compliance",
//       title: "Indirect Tax Compliance - India (GST)",
//       description: "Electronic credit ledger reconciliation shows INR 34M in input tax credit claims without corresponding supplier filings in GSTR-2A.",
//       jurisdiction: "India",
//       severity: "high",
//       dueDate: "2025-12-10",
//     },
//     {
//       id: "14",
//       type: "opportunity",
//       title: "Film & TV Production Tax Credit - UK",
//       description: "Corporate video production expenses ($4.8M in 2024) for training, marketing, and technical documentation may qualify for AVEC at 34%.",
//       jurisdiction: "UK",
//       severity: "low",
//     },
//     {
//       id: "15",
//       type: "position",
//       title: "Customs Valuation - China",
//       description: "Transfer pricing for intercompany imports may not align with customs valuation methods, creating potential adjustments.",
//       jurisdiction: "China",
//       severity: "high",
//     },
//   ];

//   const aiInsights = [
//     {
//       title: "Risk Concentration Alert",
//       description: "68% of high-severity gaps concentrated in China and UK jurisdictions. Historical pattern indicates regulatory focus shifting to these markets.",
//       icon: AlertTriangle,
//       color: "text-destructive",
//     },
//     {
//       title: "Opportunity Value",
//       description: "$12.1M in unclaimed tax benefits identified across R&D credits, renewable incentives, and efficiency deductions. 89% claim success probability.",
//       icon: TrendingUp,
//       color: "text-[#22C55E]",
//     },
//     {
//       title: "Predicted Audit Triggers",
//       description: "ML model identifies 4 gaps with >70% audit probability in next 18 months. Proactive remediation could reduce exposure by $8.3M.",
//       icon: Brain,
//       color: "text-primary",
//     },
//   ];

//   return (
//     <div className="h-full flex flex-col">
//       <div className="p-6 border-b border-border">
//         <h1 className="text-3xl font-bold" data-testid="text-page-title">Cross-Reference Engine - Gap Assessment</h1>
//         <p className="text-muted-foreground mt-1">AI-powered identification of compliance, position, opportunity, and risk gaps with predictive analytics</p>
//       </div>
//       <div className="flex-1 p-6 overflow-auto">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           {aiInsights.map((insight, idx) => {
//             const Icon = insight.icon;
//             return (
//               <Card key={idx} className="p-4">
//                 <div className="flex items-start gap-3">
//                   <Icon className={`h-5 w-5 mt-1 ${insight.color}`} />
//                   <div>
//                     <h3 className="font-semibold mb-1">{insight.title}</h3>
//                     <p className="text-sm text-muted-foreground">{insight.description}</p>
//                   </div>
//                 </div>
//               </Card>
//             );
//           })}
//         </div>

//         {/* AI Assessment Section with Sub-headings */}
//         <Card className="p-6 mb-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Brain className="h-6 w-6 text-primary" />
//             <h2 className="text-xl font-bold">AI-Powered Gap Analysis</h2>
//           </div>
          
//           <div className="space-y-6">
//             {/* Pattern Recognition */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <Target className="h-5 w-5 text-accent" />
//                 <h3 className="text-lg font-semibold">Pattern Recognition & Detection</h3>
//               </div>
//               <div className="bg-muted/30 rounded-md p-4 space-y-2">
//                 <p className="text-sm"><span className="font-semibold">Cross-Reference Analysis:</span> Master file update in Germany (filed 10/15) detected, but corresponding Indian CbCR missing. Pattern emerged after Q2 2024 organizational restructure.</p>
//                 <p className="text-sm"><span className="font-semibold">Documentation Quality Score:</span> China transfer pricing documentation scored 42/100 (threshold: 75). Missing elements: detailed service descriptions, benefit test analysis, and benchmarking study for R&D cost-sharing.</p>
//                 <p className="text-sm"><span className="font-semibold">Activity Pattern Recognition:</span> German PE risk identified through pattern analysis: (1) employees spending 180+ days on project sites, (2) local contract signature authority granted in August, (3) warehouse with 6-month+ inventory cycle.</p>
//               </div>
//             </div>

//             <Separator />

//             {/* Probability Scoring */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <TrendingUp className="h-5 w-5 text-accent" />
//                 <h3 className="text-lg font-semibold">ML-Powered Probability Scoring</h3>
//               </div>
//               <div className="bg-muted/30 rounded-md p-4 space-y-2">
//                 <p className="text-sm"><span className="font-semibold">Audit Probability:</span> Historical audit data shows 89% probability of adjustment when Chinese TP documentation gaps exceed 3 items. Current gaps: 4 items.</p>
//                 <p className="text-sm"><span className="font-semibold">PE Declaration Probability:</span> Germany permanent establishment score: 76% based on activity patterns, treaty interpretation updates, and similar cases.</p>
//                 <p className="text-sm"><span className="font-semibold">Claim Success Rates:</span> R&D tax credit opportunity confidence level: 94%. IRS acceptance probability: 87% based on similar fact patterns and supporting documentation quality.</p>
//                 <p className="text-sm"><span className="font-semibold">HMRC Challenge Likelihood:</span> UK VAT recovery position audit probability: 68% likelihood within 24 months based on deviation from safe harbor thresholds.</p>
//               </div>
//             </div>

//             <Separator />

//             {/* Exposure Calculation */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <DollarSign className="h-5 w-5 text-accent" />
//                 <h3 className="text-lg font-semibold">Financial Exposure Calculations</h3>
//               </div>
//               <div className="bg-muted/30 rounded-md p-4 space-y-2">
//                 <p className="text-sm"><span className="font-semibold">India CbCR Penalty Risk:</span> INR 500K penalty + potential transfer pricing audit trigger (estimated exposure: INR 8.5M based on transaction volume).</p>
//                 <p className="text-sm"><span className="font-semibold">China TP Adjustment Range:</span> $2.8M-4.1M estimated exposure based on benchmark analysis of 284 similar SAT adjustments in 2023-2025.</p>
//                 <p className="text-sm"><span className="font-semibold">Germany PE Tax Impact:</span> €4.5M annually if PE declared + 5.5% trade tax. Cumulative 3-year exposure: €13.5M.</p>
//                 <p className="text-sm"><span className="font-semibold">UK VAT Exposure:</span> £2.8M input VAT disallowance + prior 4-year assessments = £11.2M + interest. Voluntary disclosure could reduce penalties by £5.6M.</p>
//                 <p className="text-sm"><span className="font-semibold">Unclaimed Opportunities:</span> $12.1M total value across R&D credits ($3.2M), renewable energy incentives (INR 42M = $5.1M), and energy efficiency deductions ($3.8M).</p>
//               </div>
//             </div>

//             <Separator />

//             {/* Strategic Recommendations */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <Shield className="h-5 w-5 text-accent" />
//                 <h3 className="text-lg font-semibold">Strategic Recommendations</h3>
//               </div>
//               <div className="bg-muted/30 rounded-md p-4 space-y-3">
//                 <div>
//                   <p className="text-sm font-semibold mb-1">High Priority (30-day action required):</p>
//                   <ul className="text-sm space-y-1 ml-4">
//                     <li>• File India CbCR immediately to avoid INR 500K penalty (deadline: 12/15)</li>
//                     <li>• Initiate China TP documentation remediation project (engage Big 4 firm)</li>
//                     <li>• File amended US return for R&D credits (Form 6765) - $3.2M recovery opportunity</li>
//                   </ul>
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold mb-1">Medium Priority (60-90 day action window):</p>
//                   <ul className="text-sm space-y-1 ml-4">
//                     <li>• Germany: Restructure activities to mitigate PE risk or obtain advance ruling</li>
//                     <li>• UK: Consider voluntary disclosure for VAT position (save £5.6M in penalties)</li>
//                     <li>• France: Accelerate e-invoicing system integration (47-day buffer insufficient)</li>
//                   </ul>
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold mb-1">Optimization Opportunities:</p>
//                   <ul className="text-sm space-y-1 ml-4">
//                     <li>• Claim India renewable energy credits (INR 42M NPV, 98% success probability)</li>
//                     <li>• Review US CFC calculations for $12.4M GILTI overstatement correction</li>
//                     <li>• Initiate bilateral APA with IRS/SAT for China transfer pricing certainty</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Card>

//         <GapAssessment gaps={gaps} onGapClick={(gap) => console.log("Gap clicked:", gap.title)} />
//       </div>
//     </div>
//   );
// }

// NOTE: previous GapAssessment dashboard code has been commented out
// to make space for the SOX gap assessment UI that calls /api/assess.

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Radio, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

type Gap = {
  gap_id: string;
  description: string;
  current_state: string;
  target_state: string;
  risk_score: number;
  priority: string;
  recommendations: string[];
  benchmark_source: string;
};

type AssessmentSummary = {
  total_gaps: number;
  critical_gaps: number;
  high_priority_gaps: number;
  overall_risk_score: number;
};

type AssessmentResponse = {
  status: string;
  query: string;
  assessment: {
    gaps: Gap[];
    summary: AssessmentSummary;
  };
  message: string;
};

// Helper function to convert user input to full query
function buildQuery(userInput: string): string {
  const trimmed = userInput.trim();
  if (!trimmed) return "";
  
  // If it already looks like a full question, return as is
  if (trimmed.toLowerCase().startsWith("what") || 
      trimmed.toLowerCase().startsWith("how") ||
      trimmed.toLowerCase().includes("gap")) {
    return trimmed;
  }
  
  // Otherwise, convert to full query format
  // Capitalize first letter of the input
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return `What are the gaps in ${capitalized} in BP compared to industry benchmarks?`;
}

async function assessGaps(payload: { query: string; force_extraction: boolean }) {
  const res = await fetch("/api/assess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return (await res.json()) as AssessmentResponse;
}

function getRiskLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: "Critical", color: "bg-red-100 text-red-700" };
  if (score >= 6) return { label: "High", color: "bg-orange-100 text-orange-700" };
  if (score >= 4) return { label: "Medium", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Low", color: "bg-emerald-100 text-emerald-700" };
}

export default function GapsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [userInput, setUserInput] = useState("");
  const [forceExtraction, setForceExtraction] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const persisted = queryClient.getQueryData<AssessmentResponse>(["gap-assessment"]);
    if (persisted) {
      setHasSubmitted(true);
      // Try to extract original user input from persisted query
      const query = persisted.query || "";
      if (query.includes("What are the gaps in") && query.includes("in BP compared to industry benchmarks?")) {
        const match = query.match(/What are the gaps in (.+?) in BP compared to industry benchmarks\?/);
        if (match && match[1]) {
          setUserInput(match[1]);
        } else {
          setUserInput(query);
        }
      } else {
        setUserInput(query);
      }
    }
  }, [queryClient]);

  const assessQuery = useQuery({
    queryKey: ["gap-assessment"], 
    queryFn: () => {
      const fullQuery = buildQuery(userInput);
      return assessGaps({
        query: fullQuery,
        force_extraction: forceExtraction,
      });
    },
    enabled: hasSubmitted,          
    staleTime: Infinity,
    gcTime: Infinity, // Keep data in cache indefinitely
  });

  const { data, isFetching, isError, error } = assessQuery;

  const summary = data?.assessment?.summary;
  const gaps = data?.assessment?.gaps ?? [];
  const riskMeta = summary ? getRiskLabel(summary.overall_risk_score) : null;

  // Store gaps in query cache for GapDetailsPage to access
  useEffect(() => {
    if (data?.assessment?.gaps) {
      data.assessment.gaps.forEach((gap) => {
        queryClient.setQueryData(["gap-details", gap.gap_id], gap);
      });
    }
  }, [data, queryClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setHasSubmitted(true);
    assessQuery.refetch();
  };

  return (
    <div className="h-full w-full flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold">BP Gap Assessment</h1>
          <p className="text-sm text-muted-foreground">
            Compare BP&apos;s tax technology and processes to industry benchmarks and identify key gaps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
            <Radio className="h-3 w-3 animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Query card */}
      <Card className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Assessment Query
              </label>
              <Input
                placeholder="e.g., tax technology, SOX compliance, transfer pricing..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={forceExtraction}
                  onChange={(e) => setForceExtraction(e.target.checked)}
                />
                Force Extraction
              </label>

              <Button
                type="submit"
                disabled={!userInput.trim() || isFetching}
                className="whitespace-nowrap"
              >
                {isFetching ? "Assessing..." : "Assess Gaps"}
              </Button>
            </div>
          </div>
        </form>

        {isError && (
          <p className="text-xs text-red-500">
            {(error as Error)?.message ?? "Something went wrong"}
          </p>
        )}

        {data && (
          <p className="text-xs text-muted-foreground">
            Showing results for: <span className="font-medium">{userInput}</span>
          </p>
        )}
      </Card>

      {/* Loader */}
      {isFetching && (
        <Card className="p-8 flex items-center justify-center mt-4 border-2 border-primary/20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">Analyzing gaps...</p>
              <p className="text-xs text-muted-foreground">Comparing BP to industry benchmarks</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main layout: only when we have data and not loading */}
      {data && !isFetching && (
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* LEFT: Scorecard + insight */}
          <div className="xl:col-span-1 space-y-4">
            {summary && (
              <Card className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">
                      Risk Score
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">
                        {summary.overall_risk_score}
                        <span className="text-base text-muted-foreground">/10</span>
                      </p>
                      {riskMeta && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${riskMeta.color}`}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {riskMeta.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Overall risk posture based on identified gaps and industry benchmarks.
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Gaps</span>
                    <span className="font-semibold">{summary.total_gaps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Critical Gaps</span>
                    <span className="font-semibold text-red-600">
                      {summary.critical_gaps}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">High Priority Gaps</span>
                    <span className="font-semibold text-orange-500">
                      {summary.high_priority_gaps}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <p className="text-xs font-semibold">Benchmark Insight</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Gaps are benchmarked against leading practices from KPMG, EY,
                Deloitte, and PwC across tax technology, compliance, and strategic planning.
              </p>
            </Card>
          </div>

          {/* RIGHT: Summary + table */}
          <div className="xl:col-span-3 space-y-4">
            {summary && (
              <Card className="p-4 flex flex-wrap gap-6 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Gaps</p>
                  <p className="text-base font-semibold">{summary.total_gaps}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Critical</p>
                  <p className="text-base font-semibold text-red-600">
                    {summary.critical_gaps}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">High Priority</p>
                  <p className="text-base font-semibold text-orange-500">
                    {summary.high_priority_gaps}
                  </p>
                </div>
              </Card>
            )}

            <Card className="overflow-hidden">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Identified Gaps</h2>
                  <span className="text-[11px] text-muted-foreground">
                    Benchmarked vs. industry standards
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {gaps.length} gap(s)
                </span>
              </div>

              <div className="overflow-auto max-h-[480px]">
                <table className="min-w-full text-xs">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <th className="text-left px-4 py-2">GAP ID</th>
                      <th className="text-left px-4 py-2">Description</th>
                      <th className="text-left px-4 py-2">Risk Score</th>
                      <th className="text-left px-4 py-2">Priority</th>
                      <th className="text-left px-4 py-2">Benchmark Source</th>
                      <th className="text-left px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gaps.map((gap) => (
                      <tr key={gap.gap_id} className="border-t">
                        <td className="px-4 py-2 whitespace-nowrap font-semibold">
                          {gap.gap_id}
                        </td>
                        <td className="px-4 py-2 align-top max-w-xl">
                          <p className="line-clamp-2">{gap.description}</p>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {gap.risk_score}/10
                        </td>

                        {/* Priority badge */}
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className={`
                              inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
                              ${
                                gap.priority === "Critical"
                                  ? "bg-red-100 text-red-700"
                                  : gap.priority === "High"
                                  ? "bg-orange-100 text-orange-700"
                                  : gap.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }
                            `}
                          >
                            {gap.priority}
                          </span>
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">
                          {gap.benchmark_source}
                        </td>

                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            type="button"
                            className="text-[11px] font-medium text-primary underline"
                            onClick={() => setLocation(`/gaps/${gap.gap_id}`)}
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}

                    {gaps.length === 0 && (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-muted-foreground"
                          colSpan={6}
                        >
                          No gaps identified yet. Run an assessment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}