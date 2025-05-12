
import { CalendarCheck, Users, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TournamentCardProps {
  id: string;
  title: string;
  game: string;
  gameImage?: string;
  date: string;
  entryFee: string;
  prizePool: string;
  participants: {
    current: number;
    max: number;
  };
  status: "upcoming" | "live" | "completed";
}

const TournamentCard = ({
  id,
  title,
  game,
  date,
  entryFee,
  prizePool,
  participants,
  status,
}: TournamentCardProps) => {
  const statusColors = {
    upcoming: "bg-esports-cyan/20 text-esports-cyan",
    live: "bg-esports-green/20 text-esports-green",
    completed: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="esports-card p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header with title and badges */}
        <div className="flex justify-between items-start mb-4">
          <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
            {game}
          </Badge>
          
          <Badge variant="outline" className={`${statusColors[status]} border-none`}>
            {status === "live" && <span className="mr-1.5 w-2 h-2 bg-esports-green rounded-full inline-block animate-pulse"></span>}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold font-rajdhani mb-4 group-hover:text-esports-accent transition-colors line-clamp-2">
          {title}
        </h3>
        
        {/* Tournament Details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center text-sm text-gray-300">
            <CalendarCheck className="h-4 w-4 mr-2 text-esports-accent" />
            <span>{date}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-300">
            <Users className="h-4 w-4 mr-2 text-esports-accent" />
            <span>{participants.current} / {participants.max} participants</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-300">
            <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
            <span>Prize pool: {prizePool}</span>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-esports-accent/20">
        <div className="text-sm">
          <span className="text-gray-400">Entry:</span>{" "}
          <span className="font-semibold text-white">{entryFee}</span>
        </div>
        
        <Button 
          size="sm" 
          className="bg-esports-accent hover:bg-esports-accent-hover text-white"
        >
          {status === "live" ? "Join Now" : status === "upcoming" ? "Register" : "View Results"}
        </Button>
      </div>
    </div>
  );
};

export default TournamentCard;
