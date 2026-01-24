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
    Menu,
    SlidersHorizontal
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useZoom } from "@/components/zoom/zoom-store";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const items = [
    { href: "/day", icon: Layout, label: "Day View" },
    { href: "/week", icon: CalendarDays, label: "Week View" },
    { href: "/month", icon: CalendarRange, label: "Month View" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/habits", icon: CheckCircle, label: "Habits" },
];

export function MobileNav() {
    const [location] = useLocation();
    const { signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const { toggleDrawer } = useZoom();

    return (
        <div className="md:hidden border-b border-border bg-card p-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleDrawer} className="-ml-2">
                    <SlidersHorizontal className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-serif font-bold text-primary tracking-tight">Zoom Planner</h1>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80%] sm:w-[300px] p-0 flex flex-col bg-card">
                    <SheetHeader className="p-6 border-b border-border/40 text-left">
                        <SheetTitle className="text-xl font-serif font-bold text-primary tracking-tight">Zoom Planner</SheetTitle>
                        <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">Focus & Execute</p>
                    </SheetHeader>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {items.map((item) => {
                            const isActive = location === item.href;
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                        {item.label}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-border/40 space-y-2">
                        <Link href="/settings" onClick={() => setOpen(false)}>
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer hover:bg-secondary",
                                location === "/settings" ? "text-foreground" : "text-muted-foreground"
                            )}>
                                <Settings className="w-5 h-5" />
                                Settings
                            </div>
                        </Link>
                        <button
                            onClick={() => {
                                setOpen(false);
                                signOut();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all text-left"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
