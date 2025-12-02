import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Filter, Bell, Eye, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PortfolioConfigPage() {
  const jurisdictions = [
    { code: "USA", name: "United States", entities: 47, taxFootprint: 15000 },
    { code: "GBR", name: "United Kingdom", entities: 23, taxFootprint: 8500 },
    { code: "DEU", name: "Germany", entities: 18, taxFootprint: 9200 },
    { code: "FRA", name: "France", entities: 31, taxFootprint: 7800 },
    { code: "IND", name: "India", entities: 14, taxFootprint: 5600 },
    { code: "CHN", name: "China", entities: 26, taxFootprint: 12000 },
  ];

  const taxTypes = [
    { id: "income", label: "Corporate Income Tax", enabled: true },
    { id: "indirect", label: "Indirect Tax (VAT/GST)", enabled: true },
    { id: "withholding", label: "Withholding Tax", enabled: true },
    { id: "energy-specific", label: "Energy-Specific Taxes", enabled: true },
    { id: "customs", label: "Customs & Trade", enabled: false },
    { id: "property", label: "Property & Wealth Tax", enabled: false },
    { id: "payroll", label: "Payroll & Employment Tax", enabled: false },
    { id: "transfer-pricing", label: "Transfer Pricing", enabled: true },
  ];

  const sectors = [
    { id: "upstream", label: "Upstream (Exploration & Production)", enabled: true },
    { id: "midstream", label: "Midstream (Transportation & Storage)", enabled: true },
    { id: "downstream", label: "Downstream (Refining & Marketing)", enabled: true },
    { id: "power", label: "Power Generation", enabled: true },
    { id: "renewables", label: "Renewables & Clean Energy", enabled: true },
    { id: "petrochemicals", label: "Petrochemicals", enabled: false },
    { id: "trading", label: "Trading & Marketing", enabled: false },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Portfolio Configuration</h1>
            <p className="text-muted-foreground mt-1">Customize scope, filters, and data sources for your tax intelligence dashboard</p>
          </div>
          <Button className="gap-2" data-testid="button-save-config">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="scope" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scope" data-testid="tab-scope">
              <Globe className="h-4 w-4 mr-2" />
              Portfolio Scope
            </TabsTrigger>
            <TabsTrigger value="filters" data-testid="tab-filters">
              <Filter className="h-4 w-4 mr-2" />
              Data Filters
            </TabsTrigger>
            <TabsTrigger value="alerts" data-testid="tab-alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alert Preferences
            </TabsTrigger>
            <TabsTrigger value="display" data-testid="tab-display">
              <Eye className="h-4 w-4 mr-2" />
              Display Settings
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Scope Tab */}
          <TabsContent value="scope" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-bold">Geographic Scope</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Select jurisdictions to include in your portfolio analysis</p>
              
              <div className="space-y-3">
                {jurisdictions.map((jurisdiction) => (
                  <div key={jurisdiction.code} className="flex items-center justify-between p-3 border border-border rounded-md hover-elevate">
                    <div className="flex items-center gap-3">
                      <Checkbox defaultChecked data-testid={`checkbox-jurisdiction-${jurisdiction.code}`} />
                      <div>
                        <p className="font-semibold">{jurisdiction.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {jurisdiction.entities} entities • ${jurisdiction.taxFootprint}M annual tax footprint
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{jurisdiction.code}</Badge>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="business-units">Business Units</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="business-units" className="mt-2" data-testid="select-business-units">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Business Units</SelectItem>
                      <SelectItem value="global-upstream">Global Upstream Division</SelectItem>
                      <SelectItem value="refining">Refining & Chemicals</SelectItem>
                      <SelectItem value="marketing">Marketing & Distribution</SelectItem>
                      <SelectItem value="renewables">Renewables & New Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="legal-entities">Legal Entity Filter</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="legal-entities" className="mt-2" data-testid="select-legal-entities">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Legal Entities (159)</SelectItem>
                      <SelectItem value="material">Material Entities Only (42)</SelectItem>
                      <SelectItem value="high-risk">High Risk Jurisdictions (18)</SelectItem>
                      <SelectItem value="pillar-two">Pillar Two Scope (89)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sector Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectors.map((sector) => (
                  <div key={sector.id} className="flex items-center gap-3 p-3 border border-border rounded-md">
                    <Checkbox defaultChecked={sector.enabled} data-testid={`checkbox-sector-${sector.id}`} />
                    <Label className="cursor-pointer flex-1">{sector.label}</Label>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Data Filters Tab */}
          <TabsContent value="filters" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Tax Type Filters</h2>
              <p className="text-sm text-muted-foreground mb-4">Select tax categories to monitor in your portfolio</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {taxTypes.map((taxType) => (
                  <div key={taxType.id} className="flex items-center gap-3 p-3 border border-border rounded-md">
                    <Checkbox defaultChecked={taxType.enabled} data-testid={`checkbox-tax-${taxType.id}`} />
                    <Label className="cursor-pointer flex-1">{taxType.label}</Label>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Thresholds</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Minimum Risk Score for Alerts</Label>
                    <Badge variant="outline">45/100</Badge>
                  </div>
                  <Slider defaultValue={[45]} max={100} step={5} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Only show jurisdictions with risk scores above this threshold</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Materiality Threshold (Annual Tax)</Label>
                    <Badge variant="outline">$500K</Badge>
                  </div>
                  <Slider defaultValue={[5]} max={50} step={1} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Filter out jurisdictions with annual tax below threshold</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Probability Threshold for Forecasts</Label>
                    <Badge variant="outline">60%</Badge>
                  </div>
                  <Slider defaultValue={[60]} max={100} step={5} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Only show regulatory changes with enactment probability above threshold</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Time Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lookback">Lookback Period</Label>
                  <Select defaultValue="90">
                    <SelectTrigger id="lookback" className="mt-2" data-testid="select-lookback">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="180">Last 6 Months</SelectItem>
                      <SelectItem value="365">Last 12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="forecast">Forecast Horizon</Label>
                  <Select defaultValue="12">
                    <SelectTrigger id="forecast" className="mt-2" data-testid="select-forecast">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">Next 6 Months</SelectItem>
                      <SelectItem value="12">Next 12 Months</SelectItem>
                      <SelectItem value="24">Next 24 Months</SelectItem>
                      <SelectItem value="36">Next 36 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Alert Preferences Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Alert Triggers</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">New Regulatory Changes</p>
                    <p className="text-xs text-muted-foreground">Notify when new tax regulations are published</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-alert-regulatory" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Risk Score Changes</p>
                    <p className="text-xs text-muted-foreground">Alert when jurisdiction risk score increases by &gt;10 points</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-alert-risk" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Gap Identification</p>
                    <p className="text-xs text-muted-foreground">Notify when AI identifies new compliance or opportunity gaps</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-alert-gaps" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Deadline Reminders</p>
                    <p className="text-xs text-muted-foreground">Send reminders 30/15/7 days before filing deadlines</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-alert-deadlines" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Energy Market Updates</p>
                    <p className="text-xs text-muted-foreground">Alert on commodity price changes affecting tax positions</p>
                  </div>
                  <Switch data-testid="switch-alert-energy" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Peer Activity</p>
                    <p className="text-xs text-muted-foreground">Notify about competitor tax developments and industry trends</p>
                  </div>
                  <Switch data-testid="switch-alert-peer" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Alert Delivery</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="alert-frequency">Alert Frequency</Label>
                  <Select defaultValue="realtime">
                    <SelectTrigger id="alert-frequency" className="mt-2" data-testid="select-alert-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time (Immediate)</SelectItem>
                      <SelectItem value="daily">Daily Digest (8:00 AM)</SelectItem>
                      <SelectItem value="weekly">Weekly Summary (Monday)</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input id="notification-email" type="email" placeholder="tax.manager@company.com" className="mt-2" data-testid="input-notification-email" />
                </div>

                <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                  <Checkbox defaultChecked data-testid="checkbox-email-notifications" />
                  <Label className="cursor-pointer flex-1">Send email notifications</Label>
                </div>

                <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                  <Checkbox defaultChecked data-testid="checkbox-dashboard-notifications" />
                  <Label className="cursor-pointer flex-1">Show in-app notifications</Label>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Display Settings Tab */}
          <TabsContent value="display" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Dashboard Layout</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="default-view">Default Landing Page</Label>
                  <Select defaultValue="radar">
                    <SelectTrigger id="default-view" className="mt-2" data-testid="select-default-view">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radar">Risk Radar (Map View)</SelectItem>
                      <SelectItem value="metrics">Portfolio Metrics</SelectItem>
                      <SelectItem value="gaps">Gap Assessment</SelectItem>
                      <SelectItem value="feeds">Real-time Feeds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="chart-style">Chart Style</Label>
                  <Select defaultValue="modern">
                    <SelectTrigger id="chart-style" className="mt-2" data-testid="select-chart-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern (Gradient)</SelectItem>
                      <SelectItem value="classic">Classic (Solid)</SelectItem>
                      <SelectItem value="minimal">Minimal (Line Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="density">Information Density</Label>
                  <Select defaultValue="comfortable">
                    <SelectTrigger id="density" className="mt-2" data-testid="select-density">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Map Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">3D Globe View</p>
                    <p className="text-xs text-muted-foreground">Use interactive 3D globe instead of flat map</p>
                  </div>
                  <Switch data-testid="switch-3d-globe" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Heat Map Overlay</p>
                    <p className="text-xs text-muted-foreground">Show risk intensity as color gradient</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-heatmap" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Animation Effects</p>
                    <p className="text-xs text-muted-foreground">Animate risk pulsing and transitions</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-animation" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Data Visualization Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Show AI Confidence Intervals</p>
                    <p className="text-xs text-muted-foreground">Display uncertainty ranges on forecasts</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-confidence-intervals" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Currency Conversion</p>
                    <p className="text-xs text-muted-foreground">Convert all amounts to reporting currency (USD)</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-currency-conversion" />
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="font-semibold">Comparative Benchmarks</p>
                    <p className="text-xs text-muted-foreground">Show industry peer comparisons where available</p>
                  </div>
                  <Switch data-testid="switch-benchmarks" />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
