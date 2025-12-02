
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Radio, Search, TrendingUp, FileText, Zap, Globe, Filter } from "lucide-react";

interface FeedItem {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  jurisdiction?: string;
  priority?: "critical" | "high" | "medium" | "low";
  summary: string;
  category?: string;
}

export default function RealTimeFeedsPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [filteredFeeds, setFilteredFeeds] = useState<FeedItem[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetch("/api/feeds")
      .then((res) => res.json())
      .then((data) => {
        setFeedItems(data);
        setFilteredFeeds(data);
      })
      .catch((err) => console.error("Error fetching feeds:", err));
  }, []);

  useEffect(() => {
    let filtered = [...feedItems];
    if (selectedJurisdiction)
      filtered = filtered.filter((item) => item.jurisdiction === selectedJurisdiction);
    if (selectedCategory)
      filtered = filtered.filter((item) => item.category === selectedCategory);
    if (searchText)
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchText.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchText.toLowerCase())
      );
    setFilteredFeeds(filtered);
  }, [selectedJurisdiction, selectedCategory, searchText, feedItems]);

  const getTypeIcon = (type: string) => {
    const icons = {
      regulatory: FileText,
      market: TrendingUp,
      alert: Radio,
      energy: Zap,
      competitor: Globe,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-blue-500 text-white",
      low: "bg-gray-300 text-gray-700",
    };
    return colors[priority as keyof typeof colors] || colors["low"];
  };

  const jurisdictions = Array.from(new Set(feedItems.map((f) => f.jurisdiction).filter(Boolean)));
  const categories = Array.from(new Set(feedItems.map((f) => f.category).filter(Boolean)));

  function renderMetaLine(item: FeedItem) {
    const meta = [
      item.timestamp,
      item.type,
      item.category
    ].filter(Boolean);

    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {meta.map((v, idx) => (
          <span key={idx} className={idx === 1 ? "capitalize" : ""}>
            {idx > 0 && <span className="mx-1">•</span>}
            {v}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Real-time Intelligence Feeds</h1>
            <p className="text-muted-foreground mt-1">
              Live updates on tax developments, market changes, and AI-detected events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#22C55E] text-white gap-1">
              <Radio className="h-3 w-3 animate-pulse" />
              LIVE
            </Badge>
            <select
              className="border border-gray-300 rounded p-2 min-w-[130px] text-sm"
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
            >
              <option value="">All Jurisdictions</option>
              {jurisdictions.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded p-2 min-w-[130px] text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Button variant="outline" size="icon" data-testid="button-filter-feeds">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feeds by keyword, jurisdiction, or topic..."
            className="pl-10"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            data-testid="input-search-feeds"
          />
        </div>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" data-testid="tab-all">All Feeds</TabsTrigger>
            <TabsTrigger value="GST" data-testid="tab-regulatory">GST</TabsTrigger>
            <TabsTrigger value="Transfer Price" data-testid="tab-regulatory">Transfer Price</TabsTrigger>
            <TabsTrigger value="Corporate Tax" data-testid="tab-market">Corporate Tax</TabsTrigger>
            <TabsTrigger value="Regulatory" data-testid="tab-alert">Regulatory</TabsTrigger>
            <TabsTrigger value="others" data-testid="tab-energy">Others</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {filteredFeeds.map((item) => {
                const Icon = getTypeIcon(item.type);
                const priority = item.priority || "low";
                return (
                  <Card key={item.id} className="p-4 hover-elevate cursor-pointer" data-testid={`card-feed-${item.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-accent/10 mt-1 flex-shrink-0">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              {item.jurisdiction && <Badge variant="outline">{item.jurisdiction}</Badge>}
                            </div>
                            {renderMetaLine(item)}
                          </div>
                          <Badge className={getPriorityColor(priority) + " px-4 py-1 rounded-full font-semibold text-xs shadow"}>
                            {priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.summary}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {["GST","Transfer Price","Corporate Tax","regulatory","others"].map((type) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="space-y-4">
                {filteredFeeds
                  .filter((item) => item.type === type)
                  .map((item) => {
                    const Icon = getTypeIcon(item.type);
                    const priority = item.priority || "low";
                    return (
                      <Card key={item.id} className="p-4 hover-elevate cursor-pointer" data-testid={`card-feed-${item.id}`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-accent/10 mt-1 flex-shrink-0">
                            <Icon className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{item.title}</h3>
                                  {item.jurisdiction && <Badge variant="outline">{item.jurisdiction}</Badge>}
                                </div>
                                {renderMetaLine(item)}
                              </div>
                              <Badge className={getPriorityColor(priority) + " px-4 py-1 rounded-full font-semibold text-xs shadow"}>
                                {priority.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.summary}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
