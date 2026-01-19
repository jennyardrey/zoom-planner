import { Switch, Route, Redirect } from "wouter";
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
import { Loader2 } from "lucide-react";

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

  if (!user) return <Redirect to="/" />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-7xl mx-auto h-full">
          <Component />
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/day">
        <ProtectedRoute component={DayView} />
      </Route>
      <Route path="/week">
        <ProtectedRoute component={WeekView} />
      </Route>
      <Route path="/month">
        <ProtectedRoute component={MonthView} />
      </Route>
      <Route path="/goals">
        <ProtectedRoute component={GoalsPage} />
      </Route>
      <Route path="/habits">
        <ProtectedRoute component={HabitsPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
