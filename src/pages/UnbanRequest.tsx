
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ban, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

const UnbanRequest = () => {
  const navigate = useNavigate();
  const [requestType, setRequestType] = useState<"user" | "team">("user");
  const [reason, setReason] = useState("");
  const [teamName, setTeamName] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for your unban request.",
        variant: "destructive",
      });
      return;
    }
    
    if (requestType === "team" && !teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your team name.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Mock API call to submit unban request
    setTimeout(() => {
      toast({
        title: "Request Submitted",
        description: "Your unban request has been submitted successfully. We will review it and get back to you.",
      });
      
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center text-gray-400 hover:text-white mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Submit Unban Request</h1>
      </div>
      
      <Card className="bg-esports-dark border-esports-accent/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Ban className="mr-2 h-5 w-5 text-amber-400" />
            Request to Remove Ban
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-white mb-2 block">Request Type</Label>
              <RadioGroup
                value={requestType}
                onValueChange={(value: "user" | "team") => setRequestType(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="text-white">User Account</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="team" id="team" />
                  <Label htmlFor="team" className="text-white">Team Ban</Label>
                </div>
              </RadioGroup>
            </div>
            
            {requestType === "team" && (
              <div>
                <Label htmlFor="teamName" className="text-white mb-2 block">
                  Team Name
                </Label>
                <Input
                  id="teamName"
                  placeholder="Enter your team name"
                  className="bg-esports-darker border-esports-accent/20 text-white"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="reason" className="text-white mb-2 block">
                Reason for Unban Request <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you or your team should be unbanned..."
                className="bg-esports-darker border-esports-accent/20 text-white h-32 resize-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="proofLink" className="text-white mb-2 block">
                Link to Proof (Optional)
              </Label>
              <Input
                id="proofLink"
                placeholder="e.g. Screenshot link, video evidence, etc."
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Provide a link to any evidence that supports your unban request.
              </p>
            </div>
            
            <div className="bg-esports-darker p-4 rounded-md">
              <h3 className="text-white font-medium mb-2">Important Notes:</h3>
              <ul className="text-sm text-gray-300 space-y-1 list-disc pl-4">
                <li>Unban requests are reviewed by admin staff within 48 hours.</li>
                <li>Providing false information will result in permanent ban.</li>
                <li>Each account/team is limited to 3 unban requests per month.</li>
                <li>Include as much relevant information as possible to support your request.</li>
              </ul>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="border-esports-accent/20 text-white mr-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-esports-accent hover:bg-esports-accent/80"
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default UnbanRequest;
