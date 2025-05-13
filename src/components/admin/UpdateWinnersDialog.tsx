
import React from 'react';
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Team } from "@/types/team";
import { Tournament } from "@/types/tournament";

interface UpdateWinnersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament | null;
  teams: Team[];
  winner: string | null;
  setWinner: (value: string | null) => void;
  secondPlace: string | null;
  setSecondPlace: (value: string | null) => void;
  thirdPlace: string | null;
  setThirdPlace: (value: string | null) => void;
  multipleWinners: boolean;
  setMultipleWinners: (value: boolean) => void;
  onUpdateWinners: () => void;
}

const UpdateWinnersDialog = ({
  isOpen,
  onOpenChange,
  tournament,
  teams,
  winner,
  setWinner,
  secondPlace,
  setSecondPlace,
  thirdPlace,
  setThirdPlace,
  multipleWinners,
  setMultipleWinners,
  onUpdateWinners,
}: UpdateWinnersDialogProps) => {
  if (!tournament) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
        <DialogHeader>
          <DialogTitle>Update Tournament Winners</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set winners for {tournament.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox"
              id="multipleWinners"
              checked={multipleWinners}
              onChange={(e) => setMultipleWinners(e.target.checked)}
              className="rounded bg-esports-darker border-esports-accent/20"
            />
            <Label htmlFor="multipleWinners">Distribute prize among top 3 teams</Label>
          </div>

          <div>
            <Label htmlFor="winner">Winner (1st Place)</Label>
            <Select value={winner || ""} onValueChange={setWinner}>
              <SelectTrigger id="winner" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                <SelectValue placeholder="Select winner team" />
              </SelectTrigger>
              <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                <SelectItem value="">Select a team</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {multipleWinners && (
            <>
              <div>
                <Label htmlFor="secondPlace">2nd Place</Label>
                <Select value={secondPlace || ""} onValueChange={setSecondPlace}>
                  <SelectTrigger id="secondPlace" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                    <SelectValue placeholder="Select 2nd place team" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    <SelectItem value="">Select a team</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="thirdPlace">3rd Place</Label>
                <Select value={thirdPlace || ""} onValueChange={setThirdPlace}>
                  <SelectTrigger id="thirdPlace" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                    <SelectValue placeholder="Select 3rd place team" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    <SelectItem value="">Select a team</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={onUpdateWinners}
            className="bg-esports-accent hover:bg-esports-accent/80 text-white"
          >
            <Check className="mr-2 h-4 w-4" />
            Update Winners
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateWinnersDialog;
