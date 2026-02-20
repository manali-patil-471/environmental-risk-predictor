import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
<<<<<<< HEAD
import Layout from "./components/Layout";
=======
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AuthPage from "./pages/Auth";
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import StationDetails from "./pages/StationDetails";
import HealthAdvisory from "./pages/HealthAdvisory";
import EcoCredits from "./pages/EcoCredits";
import AlertCenter from "./pages/AlertCenter";
import UserProfile from "./pages/UserProfile";
import HistoricalTrends from "./pages/HistoricalTrends";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

<<<<<<< HEAD
=======
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route element={<Layout><Dashboard /></Layout>} path="/" />
      <Route element={<Layout><MapView /></Layout>} path="/map" />
      <Route element={<Layout><StationDetails /></Layout>} path="/station" />
      <Route element={<Layout><HealthAdvisory /></Layout>} path="/health" />
      <Route element={<Layout><EcoCredits /></Layout>} path="/eco-credits" />
      <Route element={<Layout><AlertCenter /></Layout>} path="/alerts" />
      <Route element={<Layout><UserProfile /></Layout>} path="/profile" />
      <Route element={<Layout><HistoricalTrends /></Layout>} path="/trends" />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
<<<<<<< HEAD
      <BrowserRouter>
        <Routes>
          <Route element={<Layout><Dashboard /></Layout>} path="/" />
          <Route element={<Layout><MapView /></Layout>} path="/map" />
          <Route element={<Layout><StationDetails /></Layout>} path="/station" />
          <Route element={<Layout><HealthAdvisory /></Layout>} path="/health" />
          <Route element={<Layout><EcoCredits /></Layout>} path="/eco-credits" />
          <Route element={<Layout><AlertCenter /></Layout>} path="/alerts" />
          <Route element={<Layout><UserProfile /></Layout>} path="/profile" />
          <Route element={<Layout><HistoricalTrends /></Layout>} path="/trends" />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
=======
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
