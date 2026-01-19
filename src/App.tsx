import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { initializeNotifications } from "@/lib/notifications";
import { initializeStorage, updateLastActive, isStorageAvailable } from "@/lib/storage";
import Index from "./pages/Index";
import { RemindersPage } from "./pages/RemindersPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { ProgressPage } from "./pages/ProgressPage";
import { SettingsPage } from "./pages/SettingsPage";
import { FocusTimerPage } from "./pages/FocusTimerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component to conditionally show bottom nav
function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  // Hide nav on settings page - onboarding handles its own full-screen layout
  const hideNav = location.pathname === "/settings";

  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}

// App initialization component
function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if localStorage is available
    if (!isStorageAvailable()) {
      console.warn('LocalStorage is not available. Data will not persist.');
    }
    
    // Initialize storage (version tracking, migrations, etc.)
    initializeStorage();
    
    // Initialize notifications when app starts
    initializeNotifications();
    
    // Track activity on visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateLastActive();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppInitializer>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/focus" element={<FocusTimerPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppInitializer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
