
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
import ForgotPassword from "./pages/ForgotPassword";
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
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAccount from "./pages/admin/AdminAccount";

// Optimize the QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes - replaced cacheTime with gcTime
      retry: 1,
      retryDelay: 1000
    },
  }
});

// RouteChangeListener component to handle route transitions with improved performance
const RouteChangeListener = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Faster loading transition for better perceived performance
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  return null;
};

// Protected route component with optimized loading
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin route component that only allows admin users with optimized loading
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Check localStorage for admin status (this is a backup)
  const storedAdminStatus = localStorage.getItem('isAdmin') === 'true';
  const storedAdminUser = localStorage.getItem('adminUser');

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Check both context and localStorage for authentication
  if (!isAuthenticated && !storedAdminUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check both context and localStorage for admin status
  if (!isAdmin && !storedAdminStatus) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Fix: Modified HomeRedirect to only redirect when manually accessing / route
// This prevents redirection to admin dashboard from other pages
const HomeRedirect = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  
  // Only redirect if the user is directly accessing the root path "/"
  // This prevents unwanted redirections when users navigate back to homepage
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  // Only redirect authenticated users if they're explicitly on the home page
  if (isAuthenticated && location.pathname === "/") {
    // Don't automatically redirect admins to admin dashboard
    // Let them choose where to go from the homepage
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
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
      
      {/* Admin routes - protected by AdminRoute component */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/create-tournament" element={<AdminRoute><CreateTournament /></AdminRoute>} />
      <Route path="/admin/tournaments" element={<AdminRoute><AdminTournaments /></AdminRoute>} />
      <Route path="/admin/teams" element={<AdminRoute><AdminTeams /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/broadcast" element={<AdminRoute><AdminBroadcast /></AdminRoute>} />
      <Route path="/admin/news" element={<AdminRoute><AdminNews /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
      <Route path="/admin/coins" element={<AdminRoute><AdminCoins /></AdminRoute>} />
      <Route path="/admin/requests" element={<AdminRoute><AdminRequests /></AdminRoute>} />
      <Route path="/admin/update-winners" element={<AdminRoute><UpdateWinners /></AdminRoute>} />
      <Route path="/admin/activity" element={<AdminRoute><ActivityLog /></AdminRoute>} />
      <Route path="/admin/big-tournaments" element={<AdminRoute><BigTournaments /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
      <Route path="/admin/account" element={<AdminRoute><AdminAccount /></AdminRoute>} />
      
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
