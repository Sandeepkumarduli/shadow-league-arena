
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Signup = () => {
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match",
        variant: "destructive",
      });
      return false;
    }
    
    // Check password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast({
        title: "Password is too weak",
        description: "Password must be at least 8 characters long, contain 1 number and 1 uppercase letter",
        variant: "destructive",
      });
      return false;
    }
    
    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const success = await signup(
        formData.username, 
        formData.email, 
        formData.phone, 
        formData.password
      );
      
      if (success) {
        toast({
          title: "Account created",
          description: "Welcome to NexusArena! You've been signed up successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
          <Trophy className="h-8 w-8 text-esports-accent" />
          <span className="text-2xl font-bold font-rajdhani text-white tracking-wider">
            NEXUS<span className="text-esports-accent">ARENA</span>
          </span>
        </Link>
      </div>
      
      <Card className="w-full max-w-md bg-esports-dark border-esports-accent/20">
        <CardHeader>
          <CardTitle className="text-white text-xl">Create an account</CardTitle>
          <CardDescription>Join the NexusArena community</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username"
                name="username"
                type="text" 
                placeholder="Your username" 
                value={formData.username}
                onChange={handleChange}
                className="bg-esports-darker border-esports-accent/30"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email" 
                placeholder="youremail@example.com" 
                value={formData.email}
                onChange={handleChange}
                className="bg-esports-darker border-esports-accent/30"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                name="phone"
                type="tel" 
                placeholder="1234567890" 
                value={formData.phone}
                onChange={handleChange}
                className="bg-esports-darker border-esports-accent/30"
                required
              />
              <p className="text-xs text-gray-400">Enter a 10-digit phone number</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                name="password"
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                className="bg-esports-darker border-esports-accent/30"
                required
              />
              <p className="text-xs text-gray-400">
                Password must be at least 8 characters long, contain 1 number and 1 uppercase letter
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                type="password" 
                placeholder="••••••••" 
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-esports-darker border-esports-accent/30"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-esports-accent hover:bg-esports-accent-hover text-white" 
              disabled={isLoading || authLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            
            <div className="text-sm text-center text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-esports-accent hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
