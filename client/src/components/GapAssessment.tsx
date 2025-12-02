import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, TrendingUp, Shield } from "lucide-react";

export interface Gap {
  id: string;
  type: "compliance" | "position" | "opportunity" | "risk";
  title: string;
  description: string;
  jurisdiction: string;
  severity: "high" | "medium" | "low";
  dueDate?: string;
}

interface GapAssessmentProps {
  gaps: Gap[];
  onGapClick?: (gap: Gap) => void;
}

const gapConfig = {
  compliance: {
    icon: AlertTriangle,
    label: "Compliance Gap",
    color: "bg-destructive text-destructive-foreground",
  },
  position: {
    icon: Shield,
    label: "Position Gap",
    color: "bg-primary text-primary-foreground",
  },
  opportunity: {
    icon: TrendingUp,
    label: "Opportunity Gap",
    color: "bg-[#22C55E] text-white",
  },
  risk: {
    icon: AlertTriangle,
    label: "Risk Gap",
    color: "bg-[#F59E0B] text-white",
  },
};

const severityConfig = {
  high: "border-l-4 border-l-destructive",
  medium: "border-l-4 border-l-primary",
  low: "border-l-4 border-l-accent",
};

export default function GapAssessment({ gaps, onGapClick }: GapAssessmentProps) {
  const groupedGaps = gaps.reduce((acc, gap) => {
    if (!acc[gap.type]) acc[gap.type] = [];
    acc[gap.type].push(gap);
    return acc;
  }, {} as Record<string, Gap[]>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(gapConfig).map(([type, config]) => {
          const count = groupedGaps[type]?.length || 0;
          const Icon = config.icon;
          return (
            <Card key={type} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                  <p className="text-2xl font-bold font-mono" data-testid={`text-gap-count-${type}`}>{count}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        {gaps.map((gap) => {
          const config = gapConfig[gap.type];
          const Icon = config.icon;
          return (
            <Card
              key={gap.id}
              className={`p-4 hover-elevate cursor-pointer ${severityConfig[gap.severity]}`}
              onClick={() => onGapClick?.(gap)}
              data-testid={`card-gap-${gap.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-md ${config.color} mt-1`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{gap.title}</h4>
                      <Badge variant="outline">{gap.jurisdiction}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                    {gap.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {gap.dueDate}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" data-testid={`button-action-${gap.id}`}>
                  Take Action
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
