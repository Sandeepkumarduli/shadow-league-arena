
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import RegisteredTournaments from "./pages/RegisteredTournaments";
import MyTeams from "./pages/MyTeams";
import Profile from "./pages/Profile";
import MyAccount from "./pages/MyAccount";
import Earnings from "./pages/Earnings";
import AddCoins from "./pages/AddCoins";
import LoadingSpinner from "./components/LoadingSpinner";

const queryClient = new QueryClient();

// RouteChangeListener component to handle route transitions
const RouteChangeListener = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteChangeListener />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/registered-tournaments" element={<RegisteredTournaments />} />
          <Route path="/my-teams" element={<MyTeams />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/add-coins" element={<AddCoins />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
