
import { useState } from "react";
import { Shield, AlignCenter } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const RequestAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to submit a request.",
        variant: "destructive",
      });
      return;
    }
    
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for your admin request.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('admin_requests')
        .insert([
          { user_id: user.id, reason: reason.trim() }
        ]);
      
      if (error) throw error;
      
      setHasSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your admin request has been successfully submitted.",
      });
    } catch (error) {
      console.error("Error submitting admin request:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-esports-darker overflow-hidden">
      {/* Sidebar */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto my-8">
            {hasSubmitted ? (
              <Card className="w-full bg-esports-dark border-esports-accent/20">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-center">Request Submitted</CardTitle>
                  <CardDescription className="text-center">
                    Your request to become an admin has been submitted successfully.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-400 text-center mb-4">
                    Our team will review your request shortly. You'll be notified once a decision has been made.
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-center">
                  <Button onClick={() => navigate('/dashboard')} className="bg-esports-accent hover:bg-esports-accent/80 text-white">
                    Return to Dashboard
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="w-full bg-esports-dark border-esports-accent/20">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-esports-accent/20 rounded-full flex items-center justify-center">
                      <Shield className="h-8 w-8 text-esports-accent" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-center">Request Admin Access</CardTitle>
                  <CardDescription className="text-center">
                    Tell us why you'd like to become an admin on NexusArena
                  </CardDescription>
                </CardHeader>
                
                <form onSubmit={handleSubmit}>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-400 mb-1">
                          Why do you want to be an admin?
                        </label>
                        <div className="relative">
                          <AlignCenter className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Textarea
                            id="reason"
                            placeholder="Tell us about your experience, interests, and why you'd make a good admin..."
                            className="bg-esports-darker border-esports-accent/20 text-white pl-10 min-h-[150px]"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Be specific about your experience with esports tournaments and what value you can bring to the platform.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-esports-accent hover:bg-esports-accent/80 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestAdmin;
