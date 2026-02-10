import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CalendarRange,
  Target,
  CheckCircle,
  Settings,
  LogOut,
  Layout,
  SlidersHorizontal
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useZoom } from "@/components/zoom/zoom-store";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/day", icon: Layout, label: "Day View" },
  { href: "/week", icon: CalendarDays, label: "Week View" },
  { href: "/month", icon: CalendarRange, label: "Month View" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/habits", icon: CheckCircle, label: "Habits" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { signOut } = useAuth();
  const { toggleDrawer } = useZoom();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col hidden md:flex sticky top-0">
      <div className="p-6 border-b border-border/40 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary tracking-tight">Zoom</h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">Planner</p>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleDrawer} title="Zoom Levels">
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40 space-y-2">
        <Link href="/settings">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer hover:bg-secondary",
            location === "/settings" ? "text-foreground" : "text-muted-foreground"
          )}>
            <Settings className="w-5 h-5" />
            Settings
          </div>
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all text-left"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
