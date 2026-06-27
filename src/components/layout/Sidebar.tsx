import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Brain,
  Lightbulb,
  Package,
  CalendarCheck,
  ClipboardList,
  BarChart3,
  Settings,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/farmers", label: "Farmers", icon: Users },
  { to: "/intelligence", label: "Farmer Intelligence", icon: Brain },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/inputs", label: "Input Intelligence", icon: Package },
  { to: "/follow-ups", label: "Follow Ups", icon: CalendarCheck },
  { to: "/visits", label: "Visits", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <div className="px-5 h-16 flex items-center gap-2 border-b border-sidebar-border">
        <div
          className="size-9 rounded-xl grid place-items-center text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sprout className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sidebar-foreground">CowSense AI</div>
          <div className="text-[11px] text-muted-foreground">Farmer Intelligence</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="rounded-lg p-3 text-xs bg-primary/5 text-primary border border-primary/15">
          <div className="font-semibold mb-0.5">Field Mode</div>
          <div className="text-[11px] text-muted-foreground">Sync 3m ago · 2 pending</div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur overflow-x-auto">
      <div className="flex min-w-max">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 text-[10px] min-w-[60px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
