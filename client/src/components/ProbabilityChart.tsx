import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export interface ProbabilityData {
  date: string;
  probability: number;
  confidenceLow: number;
  confidenceHigh: number;
}

interface ProbabilityChartProps {
  title: string;
  country: string;
  data: ProbabilityData[];
  currentProbability: number;
}

export default function ProbabilityChart({ title, country, data, currentProbability }: ProbabilityChartProps) {
  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return "text-destructive";
    if (prob >= 50) return "text-primary";
    if (prob >= 25) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold" data-testid="text-chart-title">{title}</h3>
        <p className="text-sm text-muted-foreground">{country}</p>
        <div className="mt-2">
          <span className="text-sm text-muted-foreground">Current Probability: </span>
          <span className={`text-3xl font-bold font-mono ${getProbabilityColor(currentProbability)}`} data-testid="text-current-probability">
            {currentProbability}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            stroke="hsl(var(--border))"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            stroke="hsl(var(--border))"
            label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px"
            }}
          />
          <Area 
            type="monotone" 
            dataKey="confidenceHigh" 
            stroke="none"
            fill="url(#colorConf)"
          />
          <Area 
            type="monotone" 
            dataKey="confidenceLow" 
            stroke="none"
            fill="url(#colorConf)"
          />
          <Line 
            type="monotone" 
            dataKey="probability" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={3}
            dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
          <span>Probability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--chart-3))", opacity: 0.3 }} />
          <span>Confidence Interval</span>
        </div>
      </div>
    </Card>
  );
}
