import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Zap,
  Milk,
  BarChart3,
  Users,
  Bell,
  FileText,
  Settings,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";

const items = [
  { title: "Overview", url: "/overview", icon: LayoutDashboard },
  { title: "Energy", url: "/energy", icon: Zap },
  { title: "Milk Collection", url: "/milk-collection", icon: Milk },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Farmers", url: "/farmers", icon: Users },
  { title: "Alerts", url: "/alerts", icon: Bell, badge: true },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ unreadAlerts }: { unreadAlerts?: number }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar collapsible="none" className="w-60 border-r-0">
      <SidebarContent className="bg-sidebar text-sidebar-foreground px-3 py-4">
        <div className="px-2 pb-6 pt-2">
          <Logo textClassName="text-sidebar-foreground" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} className="h-10 rounded-lg px-3">
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 text-sm font-medium ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <item.icon className="h-4.5 w-4.5 shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (unreadAlerts ?? 0) > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                            {unreadAlerts}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/90 text-sidebar-primary-foreground">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">Kibwezi Dairy Cooperative</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">Kibwezi, Makueni</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
