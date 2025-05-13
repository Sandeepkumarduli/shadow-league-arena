
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTeamName: string;
  onNewTeamNameChange: (value: string) => void;
  newTeamGame: string;
  onNewTeamGameChange: (value: string) => void;
  newTeamCaptain: string;
  onNewTeamCaptainChange: (value: string) => void;
  newTeamMaxMembers: string;
  onNewTeamMaxMembersChange: (value: string) => void;
  onCreateTeam: () => void;
}

const CreateTeamDialog = ({
  open,
  onOpenChange,
  newTeamName,
  onNewTeamNameChange,
  newTeamGame,
  onNewTeamGameChange,
  newTeamCaptain,
  onNewTeamCaptainChange,
  newTeamMaxMembers,
  onNewTeamMaxMembersChange,
  onCreateTeam
}: CreateTeamDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription className="text-gray-400">
            Fill in the details to create a new team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div>
            <Label htmlFor="teamName" className="text-white">Team Name</Label>
            <Input
              id="teamName"
              value={newTeamName}
              onChange={(e) => onNewTeamNameChange(e.target.value)}
              placeholder="Enter team name"
              className="bg-esports-darker border-esports-accent/20 text-white mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="game" className="text-white">Game</Label>
            <Select value={newTeamGame} onValueChange={onNewTeamGameChange}>
              <SelectTrigger id="game" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                <SelectItem value="BGMI">BGMI</SelectItem>
                <SelectItem value="Valorant">Valorant</SelectItem>
                <SelectItem value="COD">COD Mobile</SelectItem>
                <SelectItem value="FreeFire">Free Fire</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="captain" className="text-white">Captain Username</Label>
            <Input
              id="captain"
              value={newTeamCaptain}
              onChange={(e) => onNewTeamCaptainChange(e.target.value)}
              placeholder="Enter captain's username"
              className="bg-esports-darker border-esports-accent/20 text-white mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="maxMembers" className="text-white">Maximum Team Size</Label>
            <Select value={newTeamMaxMembers} onValueChange={onNewTeamMaxMembersChange}>
              <SelectTrigger id="maxMembers" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                <SelectValue placeholder="Select max team size" />
              </SelectTrigger>
              <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                <SelectItem value="1">1 (Solo)</SelectItem>
                <SelectItem value="2">2 (Duo)</SelectItem>
                <SelectItem value="4">4 (Squad)</SelectItem>
                <SelectItem value="5">5 (Squad+1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            variant="default"
            onClick={onCreateTeam}
            className="bg-esports-accent hover:bg-esports-accent/80"
          >
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog;
