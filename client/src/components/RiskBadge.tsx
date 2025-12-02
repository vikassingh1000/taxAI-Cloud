import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type RiskLevel = "low" | "emerging" | "elevated" | "immediate" | "critical";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig = {
  low: { label: "Low Risk", color: "bg-[#22C55E] text-white" },
  emerging: { label: "Emerging Risk", color: "bg-[#F59E0B] text-white" },
  elevated: { label: "Elevated Risk", color: "bg-[#FF6F20] text-white" },
  immediate: { label: "Immediate Risk", color: "bg-[#EF4444] text-white" },
  critical: { label: "Critical Alert", color: "bg-[#1F2937] text-white" },
};

export default function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level];
  
  return (
    <Badge 
      className={cn(config.color, "font-medium", className)}
      data-testid={`badge-risk-${level}`}
    >
      {config.label}
    </Badge>
  );
}
