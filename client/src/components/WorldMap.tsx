import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ZoomIn, ZoomOut, Filter } from "lucide-react";
import RiskBadge, { type RiskLevel } from "./RiskBadge";

export interface CountryData {
  code: string;
  name: string;
  riskLevel: RiskLevel;
  riskScore: number;
  alerts: number;
  trend: "up" | "stable" | "down";
  taxFootprint: number;
}

interface WorldMapProps {
  countries: CountryData[];
  onCountryClick?: (country: CountryData) => void;
}

export default function WorldMap({ countries, onCountryClick }: WorldMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [view3D, setView3D] = useState(false);

  const handleCountryClick = (country: CountryData) => {
    setSelectedCountry(country);
    onCountryClick?.(country);
  };

  const getRiskColor = (level: RiskLevel) => {
    const colors = {
      low: "#22C55E",
      emerging: "#F59E0B",
      elevated: "#FF6F20",
      immediate: "#EF4444",
      critical: "#1F2937",
    };
    return colors[level];
  };

  const getTrendIcon = (trend: "up" | "stable" | "down") => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setView3D(!view3D)}
          data-testid="button-toggle-3d"
        >
          <Globe className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" data-testid="button-zoom-in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" data-testid="button-zoom-out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" data-testid="button-filter">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-full h-full flex items-center justify-center bg-card/50 rounded-md border border-card-border p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
          {countries.map((country) => (
            <Card
              key={country.code}
              className={`p-4 cursor-pointer hover-elevate transition-all ${
                selectedCountry?.code === country.code ? "ring-2 ring-accent" : ""
              }`}
              onClick={() => handleCountryClick(country)}
              data-testid={`card-country-${country.code}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{country.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    Score: {country.riskScore}/100
                  </p>
                </div>
                <div
                  className="h-3 w-3 rounded-full animate-pulse"
                  style={{ backgroundColor: getRiskColor(country.riskLevel) }}
                />
              </div>
              <div className="flex items-center justify-between">
                <RiskBadge level={country.riskLevel} className="text-xs" />
                <div className="flex items-center gap-2">
                  {country.alerts > 0 && (
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold" data-testid={`text-alerts-${country.code}`}>
                      {country.alerts}
                    </span>
                  )}
                  <span className="text-lg" data-testid={`text-trend-${country.code}`}>
                    {getTrendIcon(country.trend)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {view3D && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-card border border-card-border px-4 py-2 rounded-md shadow-lg">
          <p className="text-sm text-muted-foreground">3D Globe View Active</p>
        </div>
      )}
    </div>
  );
}
