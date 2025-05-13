import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const { login, isAuthenticated, isLoading: authLoading, isAdmin, setIsAdmin } = useAuth();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if already authenticated
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" />;
  } else if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailOrUsername.trim() || !password.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", emailOrUsername.trim());
      
      // Check for hardcoded admin credentials
      if (emailOrUsername.trim() === "Sandeepkumar" && password.trim() === "12345678") {
        console.log("Admin login successful");
        setIsAdmin(true); // Use the setIsAdmin method
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin panel!",
        });
        // Add a slight delay to ensure state updates before navigation
        setTimeout(() => {
          navigate("/admin");
        }, 100);
        setIsLoading(false);
        return;
      }
      
      const success = await login(emailOrUsername.trim(), password.trim());
      
      if (success) {
        console.log("Login successful, navigating to dashboard");
        toast({
          title: "Login successful",
          description: "Welcome back to NexusArena!",
        });
        navigate("/dashboard");
      } else {
        console.log("Login unsuccessful");
        toast({
          title: "Login failed",
          description: "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-esports-darker flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2">
          <Trophy className="h-8 w-8 text-[#1977d4]" />
          <span className="text-2xl font-bold font-rajdhani text-white tracking-wider">
            NEXUS<span className="text-[#1977d4]">ARENA</span>
          </span>
        </Link>
      </div>

      <Card className="w-full max-w-md bg-esports-dark border-[#1977d4]/20">
        <CardHeader className="pb-6">
          <CardTitle className="text-white text-xl">Welcome back</CardTitle>
          <CardDescription>Login to your NexusArena account</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-esports-darker">
            <TabsTrigger value="email">Login</TabsTrigger>
            <TabsTrigger value="otp" disabled>OTP Login (Coming Soon)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-4 pb-6 space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="emailOrUsername">Email or Username</Label>
                  <Input 
                    id="emailOrUsername" 
                    type="text" 
                    placeholder="youremail@example.com or username" 
                    value={emailOrUsername} 
                    onChange={(e) => setEmailOrUsername(e.target.value)} 
                    className="bg-esports-darker border-[#1977d4]/30 h-11"
                    required
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-[#1977d4] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="bg-esports-darker border-[#1977d4]/30 h-11"
                    required
                    autoComplete="off"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-5 pt-2 pb-6">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#1977d4] hover:bg-[#1977d4]/80 text-white" 
                  disabled={isLoading || authLoading}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
                
                <div className="text-sm text-center text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-[#1977d4] hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="otp">
            <CardContent className="pt-4 text-center pb-6">
              <div className="py-8">
                <p className="text-gray-400">OTP Login functionality is coming soon!</p>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
