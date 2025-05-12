
import { CalendarCheck, Users, Trophy, Gamepad } from "lucide-react";
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
  gameType: "Solo" | "Duo" | "Squad";
  participants: {
    current: number;
    max: number;
  };
  status: "upcoming" | "live" | "completed";
  isRegistered?: boolean;
  roomId?: string;
  password?: string;
  position?: number;
  onJoin?: () => void;
}

const TournamentCard = ({
  id,
  title,
  game,
  date,
  entryFee,
  prizePool,
  gameType,
  participants,
  status,
  isRegistered = false,
  roomId = "",
  password = "",
  position,
  onJoin,
}: TournamentCardProps) => {
  const statusColors = {
    upcoming: "bg-amber-400/20 text-amber-400",
    live: "bg-esports-green/20 text-esports-green",
    completed: "bg-gray-500/20 text-gray-400",
  };

  // Only show Join button for upcoming tournaments and when not already registered
  const showJoinButton = status === "upcoming" && !isRegistered;
  
  // Button text based on status and registration
  const buttonText = isRegistered
    ? "Registered"
    : status === "upcoming" 
      ? "Register" 
      : status === "completed"
        ? "View Results"
        : "Join Now";

  return (
    <div className="esports-card p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header with title and badges */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
              {game}
            </Badge>
            <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
              {gameType}
            </Badge>
          </div>
          
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

        {/* Room Details (only for live tournaments) */}
        {status === 'live' && isRegistered && roomId && (
          <div className="bg-esports-accent/10 p-3 rounded-md mb-5">
            <div className="text-esports-accent font-medium mb-2">Room Details</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-400">Room ID</div>
                <div className="text-white font-mono">{roomId}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Password</div>
                <div className="text-white font-mono">{password}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Completed Tournament Result */}
        {status === 'completed' && position && (
          <div className="bg-esports-accent/10 p-3 rounded-md mb-5">
            <div className="text-esports-accent font-medium mb-2">Results</div>
            <div className="flex items-center">
              <Gamepad className="h-4 w-4 mr-2 text-esports-accent" />
              <span className="text-white">Position: #{position}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-esports-accent/20">
        <div className="text-sm">
          <span className="text-gray-400">Entry:</span>{" "}
          <span className="font-semibold text-white">{entryFee}</span>
        </div>
        
        {(showJoinButton || isRegistered || status === "completed") && (
          <Button 
            size="sm" 
            className={isRegistered 
              ? "bg-gray-600 hover:bg-gray-700 text-white" // Flat grey for registered
              : "bg-esports-accent hover:bg-esports-accent-hover text-white"
            }
            onClick={onJoin}
            disabled={isRegistered || status === "completed" || status === "live"}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TournamentCard;
