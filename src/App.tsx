
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import RegisteredTournaments from "./pages/RegisteredTournaments";
import MyTeams from "./pages/MyTeams";
import Profile from "./pages/Profile";
import MyAccount from "./pages/MyAccount";
import Earnings from "./pages/Earnings";
import AddCoins from "./pages/AddCoins";
import RequestAdmin from "./pages/RequestAdmin";
import News from "./pages/News";
import LoadingSpinner from "./components/LoadingSpinner";
// Admin Imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateTournament from "./pages/admin/CreateTournament";
import AdminTournaments from "./pages/admin/AdminTournaments";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBroadcast from "./pages/admin/AdminBroadcast";
import AdminNews from "./pages/admin/AdminNews";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCoins from "./pages/admin/AdminCoins";
import AdminRequests from "./pages/admin/AdminRequests";
import UpdateWinners from "./pages/admin/UpdateWinners";
import ActivityLog from "./pages/admin/ActivityLog";
import BigTournaments from "./pages/admin/BigTournaments";

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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Auth redirect for the homepage
const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Index />;
};

const AppRoutes = () => (
  <>
    <RouteChangeListener />
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
      <Route path="/registered-tournaments" element={<ProtectedRoute><RegisteredTournaments /></ProtectedRoute>} />
      <Route path="/my-teams" element={<ProtectedRoute><MyTeams /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
      <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
      <Route path="/add-coins" element={<ProtectedRoute><AddCoins /></ProtectedRoute>} />
      <Route path="/request-admin" element={<ProtectedRoute><RequestAdmin /></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
      
      {/* Admin routes - these will be protected with proper role check in a real app */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/create-tournament" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
      <Route path="/admin/tournaments" element={<ProtectedRoute><AdminTournaments /></ProtectedRoute>} />
      <Route path="/admin/teams" element={<ProtectedRoute><AdminTeams /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/broadcast" element={<ProtectedRoute><AdminBroadcast /></ProtectedRoute>} />
      <Route path="/admin/news" element={<ProtectedRoute><AdminNews /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/coins" element={<ProtectedRoute><AdminCoins /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute><AdminRequests /></ProtectedRoute>} />
      <Route path="/admin/update-winners" element={<ProtectedRoute><UpdateWinners /></ProtectedRoute>} />
      <Route path="/admin/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
      <Route path="/admin/big-tournaments" element={<ProtectedRoute><BigTournaments /></ProtectedRoute>} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
