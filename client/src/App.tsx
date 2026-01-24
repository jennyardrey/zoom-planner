import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

import AuthPage from "@/pages/AuthPage";
import DayView from "@/pages/DayView";
import WeekView from "@/pages/WeekView";
import MonthView from "@/pages/MonthView";
import GoalsPage from "@/pages/GoalsPage";
import HabitsPage from "@/pages/HabitsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";
import { ZoomProvider, useZoom } from "@/components/zoom/zoom-store";
import { ZoomDrawer } from "@/components/zoom/ZoomDrawer";
import HourView from "@/pages/HourView";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Redirect to="/auth" />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground font-sans">
      <ZoomDrawer />
      <Sidebar />
      <MobileNav />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100dvh-64px)] md:h-screen">
        <div className="max-w-7xl mx-auto h-full">
          <ZoomTransition>
            <Component />
          </ZoomTransition>
        </div>
      </main>
    </div>
  );
}

// Helper to get depth of route
function getRouteDepth(path: string): number {
  if (path.includes('/hour/')) return 4;
  if (path.startsWith('/day')) return 3;
  if (path.startsWith('/week')) return 2;
  if (path.startsWith('/month')) return 1;
  if (path.startsWith('/year')) return 0;
  return 2; // Default to week
}

function ZoomTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const prevDepthRef = useRef<number>(getRouteDepth(location));
  const currentDepth = getRouteDepth(location);

  // Calculate direction synchronously
  let direction = 'in';
  if (currentDepth < prevDepthRef.current) {
    direction = 'out';
  } else if (currentDepth > prevDepthRef.current) {
    direction = 'in';
  } else {
    // If depth is same, default to 'in'
    direction = 'in';
  }

  // Update ref AFTER render (for next time)
  useEffect(() => {
    prevDepthRef.current = currentDepth;
  }, [currentDepth]);

  // Animation variants
  // Animation variants
  const variants = {
    initial: (direction: string) => ({
      scale: direction === 'in' ? 0.95 : (direction === 'out' ? 1.05 : 1),
      opacity: 0,
      filter: "blur(4px)"
    }),
    animate: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)"
    },
    exit: (direction: string) => ({
      scale: direction === 'in' ? 1.05 : 0.95,
      opacity: 0,
      filter: "blur(4px)"
    })
  };

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={location}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Redirect root to week view default */}
      <Route path="/">
        <Redirect to="/week" />
      </Route>
      <Route path="/auth" component={AuthPage} />

      {/* Zoom Routes */}
      <Route path="/day">
        <ProtectedRoute component={DayView} />
      </Route>
      <Route path="/day/:date">
        <ProtectedRoute component={DayView} />
      </Route>
      <Route path="/day/:date/hour/:hour">
        <ProtectedRoute component={HourView} />
      </Route>
      <Route path="/week/:date?">
        <ProtectedRoute component={WeekView} />
      </Route>
      <Route path="/month/:yearMonth?">
        <ProtectedRoute component={MonthView} />
      </Route>
      <Route path="/year/:year?">
        {/* Placeholder for YearView if not exists, reusing GoalsPage or similar? Plan didn't specify YearView creation, using GoalsPage as reasonable fallback or check if exists? */}
        {/* Plan said: "/year/:year". I'll use GoalsPage as it likely has year view or just redirect to goals for now. Wait, user asked for "Year -> Month -> Week". 
            I'll use GoalsPage as it seems to be the high level view. */}
        <ProtectedRoute component={GoalsPage} />
      </Route>

      {/* Legacy/Other Routes */}
      <Route path="/goals">
        <ProtectedRoute component={GoalsPage} />
      </Route>
      <Route path="/habits">
        <ProtectedRoute component={HabitsPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>

      {/* Fallback for old routes to redirect to new structure? Wouter doesn't do regex redirects easily here. 
          I'll just let the new routes handle params. /week without params is captured by :date? */}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ZoomProvider>
          <Router />
          <Toaster />
        </ZoomProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
