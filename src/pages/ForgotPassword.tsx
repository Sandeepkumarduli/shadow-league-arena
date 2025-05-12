
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "An error occurred",
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
          <CardTitle className="text-white text-xl">Reset Password</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "Check your email for password reset instructions" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        
        {isSubmitted ? (
          <CardContent className="pt-4 pb-6">
            <div className="text-center py-6 space-y-4">
              <p className="text-gray-300">We've sent an email to {email} with instructions to reset your password.</p>
              <p className="text-gray-400 text-sm">
                Don't see the email? Check your spam folder or make sure you entered the correct email address.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3 mt-4">
              <Button 
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-[#1977d4] hover:bg-[#1977d4]/80 text-white"
              >
                Return to Login
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-4 pb-6 space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="youremail@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="bg-esports-darker border-[#1977d4]/30 h-11"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-5 pt-2 pb-6">
              <Button 
                type="submit" 
                className="w-full h-11 bg-[#1977d4] hover:bg-[#1977d4]/80 text-white" 
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              
              <div className="text-sm text-center">
                <Link 
                  to="/login" 
                  className="text-[#1977d4] hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
