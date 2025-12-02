import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/AppSidebar";

import Dashboard from "@/pages/Dashboard";
import PortfolioMetricsPage from "@/pages/PortfolioMetricsPage";
import ProbabilityPage from "@/pages/ProbabilityPage";
import GapsPage from "@/pages/GapsPage";
import GapDetailsPage from "@/pages/GapDetailsPage";
import GapDashboardPage from "@/pages/GapDashboardPage";
import EnergyPage from "@/pages/EnergyPage";
import RegulatoryPage from "@/pages/RegulatoryPage";
import RealTimeFeedsPage from "@/pages/RealTimeFeedsPage";
import PortfolioConfigPage from "@/pages/PortfolioConfigPage";
import NotFound from "@/pages/not-found";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/metrics" component={PortfolioMetricsPage} />
      <Route path="/probability" component={ProbabilityPage} />

      {/* Gap Assessments */}
      <Route path="/gaps" component={GapsPage} />
      <Route path="/gaps/:gapId" component={GapDetailsPage} />
      <Route path="/gaps-dashboard" component={GapDashboardPage} />

      <Route path="/energy" component={EnergyPage} />
      <Route path="/regulatory" component={RegulatoryPage} />
      <Route path="/feeds" component={RealTimeFeedsPage} />
      <Route path="/config" component={PortfolioConfigPage} />

      <Route component={NotFound} />
    </Switch>
  );
}


function AppShell() {
  const [location] = useLocation();
  const qc = useQueryClient();

  React.useEffect(() => {
    const isGapRoute =
      location === "/gaps" || location.startsWith("/gaps/");

    if (!isGapRoute) {
      // Clear ONLY the gap assessment query
      qc.removeQueries({ queryKey: ["gap-assessment"] });
    }
  }, [location, qc]);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <TooltipProvider>
      <SidebarProvider style={style}>
        <div className="flex h-screen w-full">
          <AppSidebar />

          <div className="flex flex-col flex-1 overflow-hidden">

            {/* TOP HEADER BAR */}
            <header className="flex items-center justify-between p-4 border-b border-border bg-card">
              <div className="flex items-center gap-4">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="relative w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jurisdictions, regulations, or alerts..."
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
                </Button>
              </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-auto">
              <Router />
            </main>

          </div>
        </div>
      </SidebarProvider>

      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}

export default App;