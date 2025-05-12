
import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  game: string;
  members: number;
}

interface TeamSelectionModalProps {
  tournament: {
    id: string;
    title: string;
    game: string;
    gameType: "Solo" | "Duo" | "Squad";
  };
  teams: Team[];
  onClose: () => void;
  onRegister: (tournamentId: string, teamId: string | null) => void;
}

const TeamSelectionModal = ({ tournament, teams, onClose, onRegister }: TeamSelectionModalProps) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Filter teams based on the tournament game and team size requirements
  const eligibleTeams = teams.filter(team => {
    if (team.game !== tournament.game) return false;
    
    if (tournament.gameType === "Solo") return true;
    if (tournament.gameType === "Duo" && team.members >= 2) return true;
    if (tournament.gameType === "Squad" && team.members >= 4) return true;
    
    return false;
  });

  const handleRegister = () => {
    // For Solo tournaments, we don't need a team
    if (tournament.gameType === "Solo") {
      onRegister(tournament.id, null);
      return;
    }
    
    if (!selectedTeam) {
      toast({
        title: "Team Selection Required",
        description: "Please select a team to register for the tournament",
        variant: "destructive",
      });
      return;
    }
    
    onRegister(tournament.id, selectedTeam);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-esports-card border border-esports-accent/30 rounded-lg max-w-md w-full p-6 relative animate-fade-in">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-bold text-white mb-1">{tournament.title}</h2>
        <p className="text-gray-400 text-sm mb-6">Select a team to register for this {tournament.gameType} tournament</p>
        
        {tournament.gameType === "Solo" ? (
          <div className="bg-esports-accent/10 p-4 rounded-md mb-6">
            <p className="text-white text-sm">You will be registered as an individual player for this Solo tournament.</p>
          </div>
        ) : eligibleTeams.length > 0 ? (
          <div className="space-y-2 mb-6">
            {eligibleTeams.map((team) => (
              <div 
                key={team.id}
                className={`p-3 border ${selectedTeam === team.id ? 'border-esports-accent bg-esports-accent/10' : 'border-esports-accent/30 bg-esports-dark'} rounded-md cursor-pointer transition-colors`}
                onClick={() => setSelectedTeam(team.id)}
              >
                <div className="flex justify-between">
                  <span className="font-medium text-white">{team.name}</span>
                  <span className="text-sm text-gray-400">{team.members} members</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-md mb-6">
            <p className="text-red-400 text-sm">
              You don't have any eligible teams for this tournament. Create a team with at least 
              {tournament.gameType === "Duo" ? " 2 " : " 4 "}
              members first.
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            className="flex-1 bg-esports-dark text-gray-300 hover:bg-esports-dark/80"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-esports-accent hover:bg-esports-accent-hover"
            onClick={handleRegister}
            disabled={tournament.gameType !== "Solo" && !selectedTeam}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelectionModal;
