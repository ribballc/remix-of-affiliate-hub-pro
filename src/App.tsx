import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/dashboard/Overview";
import DashboardAffiliates from "./pages/dashboard/Affiliates";
import DiscoverAffiliates from "./pages/dashboard/DiscoverAffiliates";
import Segments from "./pages/dashboard/Segments";
import DashboardOutreach from "./pages/dashboard/Outreach";
import Sequences from "./pages/dashboard/outreach/Sequences";
import DashboardAiAssistant from "./pages/dashboard/AiAssistant";
import DashboardSettings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="affiliates" element={<DashboardAffiliates />} />
            <Route path="affiliates/discover" element={<DiscoverAffiliates />} />
            <Route path="affiliates/segments" element={<Segments />} />
            <Route path="outreach" element={<DashboardOutreach />} />
            <Route path="outreach/sequences" element={<Sequences />} />
            <Route path="ai-assistant" element={<DashboardAiAssistant />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
