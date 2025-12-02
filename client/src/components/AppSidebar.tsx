import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Globe, BarChart3, TrendingUp, AlertCircle, Zap, FileText, Radio, Settings } from "lucide-react";

const menuItems = [
  {
    title: "Risk Radar",
    url: "/",
    icon: Globe,
  },
  {
    title: "Portfolio Metrics",
    url: "/metrics",
    icon: BarChart3,
  },
  {
    title: "Gap Assessment",
    url: "/gaps",
    icon: AlertCircle,
  },
  {
    title: "Real-time Feeds",
    url: "/feeds",
    icon: Radio,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div>
          <h2 className="text-xl font-bold">bpETIP</h2>
          <p className="text-xs text-muted-foreground">Tax Intelligence Platform</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
