import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { UserButtonPlaceholder } from "@/components/dashboard/UserButtonPlaceholder";
import adsMasteryLogoBranded from "@/assets/ads-mastery-logo-branded.png";
import { LayoutDashboard, Link2, Send, Bot, Settings, Search } from "lucide-react";

const navItems = [
  { to: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/affiliates", label: "Affiliates", icon: Link2 },
  { to: "/dashboard/outreach", label: "Outreach", icon: Send },
  { to: "/dashboard/ai-assistant", label: "AI Assistant", icon: Bot },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border">
        <SidebarHeader className="border-b border-border p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <NavLink to="/dashboard" className="flex items-center gap-2">
                  <img
                    src={adsMasteryLogoBranded}
                    alt="Ads Mastery"
                    className="h-8 w-auto object-contain"
                  />
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ to, label, icon: Icon }) => (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        location.pathname === to || location.pathname.startsWith(to + "/")
                      }
                    >
                      <NavLink to={to}>
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background px-6">
          <SidebarTrigger className="-ml-2" />
          <img
            src={adsMasteryLogoBranded}
            alt="Ads Mastery"
            className="h-8 w-auto object-contain hidden sm:block"
          />
          <div className="flex-1 flex justify-center max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 h-9 bg-muted/50 border-border"
              />
            </div>
          </div>
          <UserButtonPlaceholder />
        </header>
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
