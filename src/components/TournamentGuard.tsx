
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface TournamentGuardProps {
  tournamentType: "Solo" | "Duo" | "Squad";
  onContinue: () => void;
}

const TournamentGuard = ({ tournamentType, onContinue }: TournamentGuardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  
  // Check if user has appropriate team for tournament type
  useEffect(() => {
    // This would be replaced with actual team checking logic from your API
    // For now, we'll simulate it
    if (tournamentType === "Solo") {
      // For solo tournaments, no team needed
      setHasTeam(true);
    } else {
      // For team tournaments, check if user has teams - mocking this check
      const hasMatchingTeam = Math.random() > 0.5; // Randomly determine if user has appropriate team
      setHasTeam(hasMatchingTeam);
    }
  }, [tournamentType]);

  const handleClose = () => {
    setIsOpen(false);
    if (tournamentType !== "Solo") {
      navigate("/my-teams");
    }
  };

  const handleContinue = () => {
    setIsOpen(false);
    onContinue();
    toast({
      title: "Registration started",
      description: "You're now being taken to tournament registration.",
    });
  };

  // Don't show dialog if we haven't checked team status yet
  if (hasTeam === null) return null;

  // Don't show dialog if user has appropriate team or it's a solo tournament
  if (!isOpen || hasTeam) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-esports-dark border-esports-accent/30 text-white">
        <DialogHeader>
          <DialogTitle>Team Required</DialogTitle>
          <DialogDescription>
            {tournamentType === "Duo" 
              ? "You need to create or join a Duo team to register for this tournament." 
              : "You need to create or join a Squad team to register for this tournament."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-300">
            Please visit the "My Teams" page to create a new team or join an existing one before registering.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-esports-accent/30 text-white hover:bg-esports-accent/10"
            onClick={handleClose}
          >
            Go to My Teams
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentGuard;
