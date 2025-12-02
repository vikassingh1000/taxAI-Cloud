import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplet, Zap, Wind, Factory } from "lucide-react";

export interface EnergyEvent {
  id: string;
  title: string;
  date: string;
  sector: "upstream" | "midstream" | "downstream" | "power" | "renewables";
  impact: "high" | "medium" | "low";
  description: string;
  commodityContext?: string;
  taxImplications: string[];
}

interface EnergyLensFeedProps {
  events: EnergyEvent[];
}

const sectorConfig = {
  upstream: { icon: Droplet, label: "Upstream", color: "bg-chart-1 text-primary-foreground" },
  midstream: { icon: Factory, label: "Midstream", color: "bg-chart-2 text-primary-foreground" },
  downstream: { icon: Droplet, label: "Downstream", color: "bg-chart-3 text-primary-foreground" },
  power: { icon: Zap, label: "Power Generation", color: "bg-chart-4 text-primary-foreground" },
  renewables: { icon: Wind, label: "Renewables", color: "bg-[#22C55E] text-white" },
};

const impactConfig = {
  high: "border-l-4 border-l-destructive",
  medium: "border-l-4 border-l-primary",
  low: "border-l-4 border-l-accent",
};

export default function EnergyLensFeed({ events }: EnergyLensFeedProps) {
  const filteredBySector = (sector: string) =>
    sector === "all" ? events : events.filter((e) => e.sector === sector);

  const EventCard = ({ event }: { event: EnergyEvent }) => {
    const config = sectorConfig[event.sector];
    const Icon = config.icon;

    return (
      <Card
        className={`p-4 hover-elevate ${impactConfig[event.impact]}`}
        data-testid={`card-event-${event.id}`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
              <Badge className={event.impact === "high" ? "bg-destructive text-destructive-foreground" : ""}>
                {event.impact.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
            {event.commodityContext && (
              <div className="bg-muted/50 rounded-md p-2 mb-3">
                <p className="text-xs font-semibold mb-1">Commodity Context</p>
                <p className="text-xs text-muted-foreground">{event.commodityContext}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-semibold">Tax Implications:</p>
              <ul className="space-y-1">
                {event.taxImplications.map((implication, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{implication}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="upstream" data-testid="tab-upstream">Upstream</TabsTrigger>
          <TabsTrigger value="midstream" data-testid="tab-midstream">Midstream</TabsTrigger>
          <TabsTrigger value="downstream" data-testid="tab-downstream">Downstream</TabsTrigger>
          <TabsTrigger value="power" data-testid="tab-power">Power</TabsTrigger>
          <TabsTrigger value="renewables" data-testid="tab-renewables">Renewables</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </TabsContent>

        {Object.keys(sectorConfig).map((sector) => (
          <TabsContent key={sector} value={sector} className="space-y-4 mt-4">
            {filteredBySector(sector).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
