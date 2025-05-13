
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flag, Shield, Trash, Trophy, Users } from "lucide-react";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    game?: string;
    captain?: string;
    members?: number;
    maxMembers?: number;
    tournaments?: number;
    wins?: number;
    active?: boolean;
  };
  onViewDetails: (teamId: string) => void;
  onToggleBan: (teamId: string) => void;
  onDelete: (teamId: string) => void;
}

const TeamCard = ({ team, onViewDetails, onToggleBan, onDelete }: TeamCardProps) => {
  return (
    <Card className="bg-esports-dark border-esports-accent/20">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                {team.game}
              </Badge>
              <Badge 
                variant={team.active ? "default" : "secondary"} 
                className={team.active ? "bg-green-800/30 text-green-400 border-none" : "bg-red-800/30 text-red-400 border-none"}
              >
                {team.active ? "Active" : "Banned"}
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold font-rajdhani mb-3 text-white">
              {team.name}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center text-gray-300">
                <Shield className="h-4 w-4 mr-2 text-esports-accent" />
                <span>Captain: {team.captain}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <Users className="h-4 w-4 mr-2 text-esports-accent" />
                <span>Members: {team.members}/{team.maxMembers}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                <span>Tournaments: {team.tournaments}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                <span>Wins: {team.wins}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
              onClick={() => onViewDetails(team.id)}
            >
              <Users className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={team.active ? 
                "border-amber-500/20 text-amber-400 hover:bg-amber-500/10" : 
                "border-green-500/20 text-green-400 hover:bg-green-500/10"}
              onClick={() => onToggleBan(team.id)}
            >
              <Flag className="h-4 w-4 mr-2" />
              {team.active ? "Ban Team" : "Unban Team"}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-900/20 hover:bg-red-900/40 text-red-500"
              onClick={() => onDelete(team.id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
