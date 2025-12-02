// # New Changes
//Static SOX gap data for now we need to plug in LLM logic later.
import { Router, Request, Response } from "express";

const router = Router();

// -- base assessment data --
const BASE_ASSESSMENT = {
  status: "success",
  query: "",
  assessment: {
    gaps: [
      {
        gap_id: "GAP-001",
        description:
          "SOX Compliance Program Maturity: Lack of documented SOX compliance program and roadmap compared to industry leaders who have mature, well-documented programs.",
        current_state:
          "BP has no documented SOX compliance program or roadmap identified in the provided data.",
        target_state:
          "Establish a documented SOX compliance program with a clear roadmap outlining key milestones, responsibilities, and timelines, mirroring industry best practices as evidenced by KPMG, EY, Deloitte, and PwC.",
        risk_score: 8,
        priority: "Critical",
        recommendations: [
          "Develop a comprehensive SOX compliance program document.",
          "Define roles and responsibilities for SOX compliance activities.",
          "Create a detailed roadmap outlining key milestones, timelines, and resources required for SOX compliance.",
          "Establish a regular review process to ensure the program remains effective and aligned with industry standards.",
          "Conduct a formal risk assessment to identify key SOX-related risks.",
        ],
        benchmark_source: "KPMG, EY, DELOITTE, PWC",
      },
      {
        gap_id: "GAP-002",
        description:
          "SOX Controls Framework: Absence of a documented SOX controls framework, including key controls, testing procedures, and remediation processes, unlike industry leaders who have robust frameworks.",
        current_state:
          "BP lacks a documented SOX controls framework, including details on key controls, testing, and remediation.",
        target_state:
          "Implement a documented SOX controls framework that outlines key controls, testing procedures, and remediation processes, aligning with industry best practices.",
        risk_score: 9,
        priority: "Critical",
        recommendations: [
          "Develop a comprehensive SOX controls framework document.",
          "Identify and document key controls for financial reporting.",
          "Establish standardized testing procedures for key controls.",
          "Define a clear remediation process for control deficiencies.",
          "Implement a system for tracking and monitoring control deficiencies and remediation efforts.",
        ],
        benchmark_source: "KPMG, EY, DELOITTE, PWC",
      },
      {
        gap_id: "GAP-003",
        description:
          "SOX Compliance Automation: Limited or no automation of SOX compliance activities, such as control testing, documentation, and reporting, compared to industry leaders who leverage automation for efficiency and accuracy.",
        current_state:
          "BP appears to have limited or no automation of SOX compliance activities based on the data provided.",
        target_state:
          "Implement automation tools and technologies to streamline SOX compliance activities, including control testing, documentation, and reporting, aligning with industry trends towards increased automation.",
        risk_score: 7,
        priority: "High",
        recommendations: [
          "Evaluate and select appropriate SOX compliance automation tools.",
          "Implement automated control testing procedures.",
          "Automate SOX documentation and reporting processes.",
          "Integrate automation tools with existing financial systems.",
          "Provide training to staff on how to use the new automation tools.",
        ],
        benchmark_source: "KPMG, EY, DELOITTE, PWC",
      },
      {
        gap_id: "GAP-004",
        description:
          "SOX Compliance Monitoring and Reporting: Lack of a formal monitoring and reporting process for SOX compliance, hindering the ability to track progress, identify issues, and report to stakeholders, contrasting with industry leaders who have established monitoring systems.",
        current_state:
          "BP does not have a formal monitoring and reporting process for SOX compliance.",
        target_state:
          "Establish a formal monitoring and reporting process for SOX compliance, enabling tracking of progress, identification of issues, and reporting to stakeholders, in line with industry best practices.",
        risk_score: 6,
        priority: "High",
        recommendations: [
          "Develop a SOX compliance monitoring plan.",
          "Establish key performance indicators (KPIs) for SOX compliance.",
          "Implement a reporting system to track progress and identify issues.",
          "Define reporting frequency and distribution lists.",
          "Establish a process for escalating issues to management.",
        ],
        benchmark_source: "KPMG, EY, DELOITTE, PWC",
      },
      {
        gap_id: "GAP-005",
        description:
          "SOX Training and Awareness: Insufficient SOX training and awareness programs for employees, potentially leading to a lack of understanding of SOX requirements and responsibilities, unlike industry leaders with comprehensive training programs.",
        current_state:
          "BP has insufficient SOX training and awareness programs for employees.",
        target_state:
          "Implement comprehensive SOX training and awareness programs for employees to ensure a thorough understanding of SOX requirements and responsibilities, mirroring industry leaders' best practices.",
        risk_score: 5,
        priority: "Medium",
        recommendations: [
          "Develop a SOX training program for all relevant employees.",
          "Provide regular training updates to keep employees informed of changes to SOX requirements.",
          "Tailor training programs to specific roles and responsibilities.",
          "Track employee participation in SOX training programs.",
          "Assess the effectiveness of the training programs through feedback and testing.",
        ],
        benchmark_source: "KPMG, EY, DELOITTE, PWC",
      },
    ],
    summary: {
      total_gaps: 5,
      critical_gaps: 2,
      high_priority_gaps: 2,
      overall_risk_score: 7,
    },
  },
  message: "Gap assessment completed successfully",
};

// simple in-memory comments store for demo
const commentsStore: Record<string, { id: string; author: string; text: string; created_at: string }[]> =
  {};

// Store assessment results by query to allow fetching gaps by ID
const assessmentStore: Record<string, any> = {};

// -- POST /api/assess --
router.post("/", async (req: Request, res: Response) => {
  const { query = "", force_extraction = false } = req.body ?? {};
  
  let response;
  
  // Try to call the actual gap assessment service if available
  // The service should be running on port 8000 or configured via environment variable
  const assessmentServiceUrl = process.env.ASSESSMENT_SERVICE_URL || "http://localhost:8000/assess";
  
  try {
    const serviceResponse = await fetch(assessmentServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, force_extraction }),
    });
    
    if (serviceResponse.ok) {
      response = await serviceResponse.json();
    } else {
      throw new Error(`Assessment service returned ${serviceResponse.status}`);
    }
  } catch (error) {
    // Fallback to BASE_ASSESSMENT if service is not available
    console.warn("Assessment service not available, using fallback data:", error);
    response = {
      ...BASE_ASSESSMENT,
      query,
    };
  }
  
  // Store assessment results so gaps can be fetched by ID
  if (response.assessment?.gaps) {
    response.assessment.gaps.forEach((gap: any) => {
      assessmentStore[gap.gap_id] = gap;
    });
  }
  
  // Also store by query for potential future use
  assessmentStore[`query:${query}`] = response;
  
  return res.json(response);
});

// --GET /api/assess/gaps/:gapId --
router.get("/gaps/:gapId", (req: Request, res: Response) => {
  const { gapId } = req.params;
  
  // First try to get from assessment store
  const gap = assessmentStore[gapId];
  if (gap) {
    return res.json(gap);
  }
  
  // Fallback to BASE_ASSESSMENT
  const baseGap = BASE_ASSESSMENT.assessment.gaps.find((g) => g.gap_id === gapId);
  if (!baseGap) {
    return res.status(404).json({ message: "Gap not found" });
  }
  return res.json(baseGap);
});

// -- comments endpoints --
router.get("/gaps/:gapId/comments", (req: Request, res: Response) => {
  const { gapId } = req.params;
  return res.json(commentsStore[gapId] ?? []);
});

router.post("/gaps/:gapId/comments", (req: Request, res: Response) => {
  const { gapId } = req.params;
  const { text } = req.body ?? {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Text is required" });
  }
  const comment = {
    id: `${Date.now()}`,
    author: "BP Tax Team", // static for now
    text,
    created_at: new Date().toISOString(),
  };
  if (!commentsStore[gapId]) commentsStore[gapId] = [];
  commentsStore[gapId].unshift(comment);
  return res.status(201).json(comment);
});

// -- dashboard data --
router.get("/dashboard", (_req: Request, res: Response) => {
  // static demo data; can be wired to real storage later
  const now = new Date();
  const mkTs = (minsAgo: number) =>
    new Date(now.getTime() - minsAgo * 60_000).toLocaleTimeString();

  const timeSeries = {
    totalGapsOverTime: [
      { ts: mkTs(40), value: 3 },
      { ts: mkTs(30), value: 4 },
      { ts: mkTs(20), value: 5 },
      { ts: mkTs(10), value: 5 },
      { ts: mkTs(0), value: 5 },
    ],
    latencyOverTime: [
      { ts: mkTs(40), value: 28.0 },
      { ts: mkTs(30), value: 24.5 },
      { ts: mkTs(20), value: 21.0 },
      { ts: mkTs(10), value: 19.0 },
      { ts: mkTs(0), value: 18.06 },
    ],
    searchResultsOverTime: [
      { ts: mkTs(40), value: 8 },
      { ts: mkTs(30), value: 10 },
      { ts: mkTs(20), value: 12 },
      { ts: mkTs(10), value: 14 },
      { ts: mkTs(0), value: 16 },
    ],
    llmCallsOverTime: [
      { ts: mkTs(40), value: 4 },
      { ts: mkTs(30), value: 5 },
      { ts: mkTs(20), value: 6 },
      { ts: mkTs(10), value: 7 },
      { ts: mkTs(0), value: 8 },
    ],
  };

  const riskScoreDistribution = [
    { bucket: "4–6", count: 8 },
    { bucket: "7–8", count: 12 },
    { bucket: "9–10", count: 7 },
  ];

  const priorityDistribution = [
    { priority: "Critical", value: 7 },
    { priority: "High", value: 11 },
    { priority: "Medium", value: 8 },
    { priority: "Low", value: 4 },
  ];

  const summary = {
    totalAssessments: 6,
    avgLatencySeconds: 18.06,
    criticalGaps: BASE_ASSESSMENT.assessment.summary.critical_gaps,
    highPriorityGaps: BASE_ASSESSMENT.assessment.summary.high_priority_gaps,
  };

  return res.json({
    summary,
    riskScoreDistribution,
    priorityDistribution,
    timeSeries,
  });
});

export default router;