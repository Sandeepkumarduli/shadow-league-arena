
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  joined: string;
}

interface TeamDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTeam: {
    name?: string;
    game?: string;
    created_at?: string;
  } | null;
  teamMembers: TeamMember[];
}

const TeamDetails = ({ open, onOpenChange, selectedTeam, teamMembers }: TeamDetailsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-esports-dark text-white border-esports-accent/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedTeam?.name || "Team Details"}</DialogTitle>
          <DialogDescription className="text-gray-400 flex items-center gap-2">
            <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
              {selectedTeam?.game || "Unknown Game"}
            </Badge>
            <span>Created on {selectedTeam?.created_at ? 
              new Date(selectedTeam.created_at).toLocaleDateString() : 
              "Unknown Date"}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Team Members</h4>
          {teamMembers.length > 0 ? (
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.id} className="flex justify-between items-center p-3 bg-esports-darker rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-esports-accent" />
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-400">Joined: {member.joined}</p>
                    </div>
                  </div>
                  <div>
                    <Badge variant={member.role === "Captain" ? "default" : "outline"} className={member.role === "Captain" ? "bg-esports-accent/20 text-esports-accent border-none" : "bg-esports-dark text-white border-esports-accent/30"}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">No team members found.</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamDetails;
