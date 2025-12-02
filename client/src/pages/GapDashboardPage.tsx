import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DashboardResponse = {
  summary: {
    totalAssessments: number;
    avgLatencySeconds: number;
    criticalGaps: number;
    highPriorityGaps: number;
  };
  riskScoreDistribution: { bucket: string; count: number }[];
  priorityDistribution: { priority: string; value: number }[];
  timeSeries: {
    totalGapsOverTime: { ts: string; value: number }[];
    latencyOverTime: { ts: string; value: number }[];
    searchResultsOverTime: { ts: string; value: number }[];
    llmCallsOverTime: { ts: string; value: number }[];
  };
};

export default function GapDashboardPage() {
  const { data } = useQuery<DashboardResponse>({
    queryKey: ["gap-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/assess/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard");
      return res.json();
    },
  });

  if (!data) {
    return (
      <div className="h-full w-full p-6">
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

  return (
    <div className="h-full w-full flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold mb-1">BP Gap Assessment Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Overview of assessment activity, risk distribution, and system performance.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Avg Latency</p>
          <p className="text-2xl font-bold">
            {data.summary.avgLatencySeconds.toFixed(2)}
            <span className="text-sm text-muted-foreground">s</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Assessments</p>
          <p className="text-2xl font-bold">{data.summary.totalAssessments}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Critical Gaps</p>
          <p className="text-2xl font-bold text-red-600">
            {data.summary.criticalGaps}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">High Priority Gaps</p>
          <p className="text-2xl font-bold text-orange-500">
            {data.summary.highPriorityGaps}
          </p>
        </Card>
      </div>

      {/* First row of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Risk Score Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.riskScoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="bucket" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Latency Over Time</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.timeSeries.latencyOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Second row of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Priority Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.priorityDistribution}
                dataKey="value"
                nameKey="priority"
                label
              >
                {data.priorityDistribution.map((_entry, index) => (
                  <Cell key={index} fill={`hsl(${COLORS[index % COLORS.length]})`} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-2">LLM Calls Over Time</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.timeSeries.llmCallsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Total Gaps Over Time</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.timeSeries.totalGapsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Search Results Over Time</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.timeSeries.searchResultsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}