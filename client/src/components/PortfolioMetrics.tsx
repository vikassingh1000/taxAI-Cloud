import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface MetricData {
  label: string;
  value: number;
  trend: "up" | "down" | "stable";
  trendValue: string;
}

interface PortfolioMetricsProps {
  metrics: {
    weightedRisk: MetricData;
    riskConcentration: MetricData;
    riskVelocity: MetricData;
    valueAtRisk: MetricData;
  };
  riskDistribution: Array<{
    jurisdiction: string;
    riskScore: number;
  }>;
}

export default function PortfolioMetrics({ metrics, riskDistribution }: PortfolioMetricsProps) {
  const MetricCard = ({ icon: Icon, label, value, trend, trendValue, suffix = "" }: MetricData & { icon: any; suffix?: string }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-md ${trend === "down" ? "bg-[#22C55E]/10" : "bg-primary/10"}`}>
          <Icon className={`h-6 w-6 ${trend === "down" ? "text-[#22C55E]" : "text-primary"}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trend === "down" ? "text-[#22C55E]" : trend === "up" ? "text-destructive" : "text-muted-foreground"}`}>
          {trend === "up" && <TrendingUp className="h-4 w-4" />}
          {trend === "down" && <TrendingDown className="h-4 w-4" />}
          <span>{trendValue}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold font-mono" data-testid={`text-metric-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {value}{suffix}
      </p>
    </Card>
  );

  const getRiskColor = (score: number) => {
    if (score >= 75) return "#EF4444";
    if (score >= 60) return "#FF6F20";
    if (score >= 40) return "#F59E0B";
    return "#22C55E";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={Activity} {...metrics.weightedRisk} suffix="/100" />
        <MetricCard icon={TrendingUp} {...metrics.riskConcentration} suffix="%" />
        <MetricCard icon={Activity} {...metrics.riskVelocity} suffix="/mo" />
        <MetricCard icon={DollarSign} {...metrics.valueAtRisk} suffix="M" />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Distribution by Jurisdiction</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="jurisdiction" 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px"
              }}
            />
            <Bar dataKey="riskScore" radius={[4, 4, 0, 0]}>
              {riskDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskScore)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
