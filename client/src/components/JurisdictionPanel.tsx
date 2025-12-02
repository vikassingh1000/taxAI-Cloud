import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, AlertCircle, Building2, X } from "lucide-react";
import RiskBadge, { type RiskLevel } from "./RiskBadge";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

export interface RegulatoryChange {
  id: string;
  title: string;
  date: string;
  status: "proposed" | "enacted";
  impact: "high" | "medium" | "low" | "informational";
  type: "income" | "indirect" | "energy-specific";
}

export interface JurisdictionData {
  code: string;
  name: string;
  riskLevel: RiskLevel;
  riskScore: number;
  regulatoryChanges: RegulatoryChange[];
  riskDimensions: {
    regulatory: number;
    audit: number;
    compliance: number;
    financial: number;
    reputational: number;
  };
  taxPresence: {
    entities: number;
    effectiveTaxRate: number;
    annualTaxPaid: number;
    auditHistory: string;
  };
}

interface JurisdictionPanelProps {
  data: JurisdictionData | null;
  onClose: () => void;
}

export default function JurisdictionPanel({ data, onClose }: JurisdictionPanelProps) {
  if (!data) return null;

  const radarData = [
    { subject: "Regulatory", value: data.riskDimensions.regulatory },
    { subject: "Audit", value: data.riskDimensions.audit },
    { subject: "Compliance", value: data.riskDimensions.compliance },
    { subject: "Financial", value: data.riskDimensions.financial },
    { subject: "Reputational", value: data.riskDimensions.reputational },
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
    <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-background border-l border-border shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-jurisdiction-name">{data.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <RiskBadge level={data.riskLevel} />
            <span className="text-sm text-muted-foreground font-mono">
              Risk Score: {data.riskScore}/100
            </span>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-panel">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="feed" className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed" data-testid="tab-feed">
            <FileText className="h-4 w-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="scorecard" data-testid="tab-scorecard">
            <TrendingUp className="h-4 w-4 mr-2" />
            Scorecard
          </TabsTrigger>
          <TabsTrigger value="presence" data-testid="tab-presence">
            <Building2 className="h-4 w-4 mr-2" />
            Presence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4 mt-4">
          <h3 className="font-semibold text-lg">Tax Regulatory Changes (Last 90 Days)</h3>
          {data.regulatoryChanges.map((change) => (
            <Card key={change.id} className="p-4 hover-elevate" data-testid={`card-change-${change.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold">{change.title}</h4>
                  <p className="text-sm text-muted-foreground">{change.date}</p>
                </div>
                <Badge className={getImpactColor(change.impact)}>
                  {change.impact.toUpperCase()}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{change.status}</Badge>
                <Badge variant="outline">{change.type}</Badge>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="scorecard" className="space-y-4 mt-4">
          <h3 className="font-semibold text-lg">Risk Assessment Scorecard</h3>
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Radar name="Risk" dataKey="value" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Key Risk Drivers
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>OECD Pillar Two implementation pending (Q2 2026)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Increased transfer pricing documentation requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Digital services tax rate increase proposed</span>
              </li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="presence" className="space-y-4 mt-4">
          <h3 className="font-semibold text-lg">Tax Presence Dashboard</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Entities</p>
              <p className="text-3xl font-bold font-mono" data-testid="text-entities">{data.taxPresence.entities}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
              <p className="text-3xl font-bold font-mono" data-testid="text-tax-rate">
                {data.taxPresence.effectiveTaxRate}%
              </p>
            </Card>
            <Card className="p-4 col-span-2">
              <p className="text-sm text-muted-foreground">Annual Tax Paid</p>
              <p className="text-3xl font-bold font-mono" data-testid="text-tax-paid">
                ${data.taxPresence.annualTaxPaid}M
              </p>
            </Card>
          </div>

          <Card className="p-4">
            <h4 className="font-semibold mb-2">Audit History</h4>
            <p className="text-sm text-muted-foreground">{data.taxPresence.auditHistory}</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
