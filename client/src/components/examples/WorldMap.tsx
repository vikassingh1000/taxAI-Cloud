import WorldMap, { type CountryData } from '../WorldMap';

export default function WorldMapExample() {
  const mockCountries: CountryData[] = [
    { code: "USA", name: "United States", riskLevel: "emerging", riskScore: 45, alerts: 3, trend: "up", taxFootprint: 15000 },
    { code: "GBR", name: "United Kingdom", riskLevel: "elevated", riskScore: 62, alerts: 5, trend: "up", taxFootprint: 8500 },
    { code: "DEU", name: "Germany", riskLevel: "low", riskScore: 28, alerts: 1, trend: "stable", taxFootprint: 9200 },
    { code: "FRA", name: "France", riskLevel: "immediate", riskScore: 78, alerts: 8, trend: "up", taxFootprint: 7800 },
    { code: "IND", name: "India", riskLevel: "emerging", riskScore: 52, alerts: 4, trend: "down", taxFootprint: 5600 },
    { code: "CHN", name: "China", riskLevel: "elevated", riskScore: 68, alerts: 6, trend: "stable", taxFootprint: 12000 },
  ];

  return (
    <div className="h-[600px]">
      <WorldMap 
        countries={mockCountries}
        onCountryClick={(country) => console.log("Country clicked:", country.name)}
      />
    </div>
  );
}
