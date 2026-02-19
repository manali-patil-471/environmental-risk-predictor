import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import StationDetails from "./pages/StationDetails";
import HealthAdvisory from "./pages/HealthAdvisory";
import EcoCredits from "./pages/EcoCredits";
import AdminEcoCredits from "./pages/AdminEcoCredits";
import AlertCenter from "./pages/AlertCenter";
import UserProfile from "./pages/UserProfile";
import HistoricalTrends from "./pages/HistoricalTrends";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout><Dashboard /></Layout>} path="/" />
          <Route element={<Layout><MapView /></Layout>} path="/map" />
          <Route element={<Layout><StationDetails /></Layout>} path="/station" />
          <Route element={<Layout><HealthAdvisory /></Layout>} path="/health" />
          <Route element={<Layout><EcoCredits /></Layout>} path="/eco-credits" />
          <Route element={<Layout><AdminEcoCredits /></Layout>} path="/admin/eco-credits" />
          <Route element={<Layout><AlertCenter /></Layout>} path="/alerts" />
          <Route element={<Layout><UserProfile /></Layout>} path="/profile" />
          <Route element={<Layout><HistoricalTrends /></Layout>} path="/trends" />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
