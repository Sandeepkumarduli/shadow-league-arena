
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TournamentCard from "@/components/TournamentCard";
import TournamentFilters from "@/components/TournamentFilters";
import TeamSelectionModal from "@/components/TeamSelectionModal";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/LoadingSpinner";

// Sample tournaments data
const availableTournaments = [
  {
    id: "1",
    title: "BGMI Pro League Season 5",
    game: "BGMI",
    gameType: "Squad" as const,
    date: "May 18, 2025 • 8:00 PM",
    entryFee: "500",
    prizePool: "3,000",
    participants: { current: 64, max: 100 },
    status: "upcoming" as const,
    isNew: true,
  },
  {
    id: "2",
    title: "BGMI Weekend Cup",
    game: "BGMI",
    gameType: "Duo" as const,
    date: "Live Now",
    entryFee: "500",
    prizePool: "1,200",
    participants: { current: 98, max: 100 },
    status: "live" as const,
    isNew: false,
  },
  {
    id: "3",
    title: "Valorant Championship Series",
    game: "Valorant",
    gameType: "Squad" as const,
    date: "May 15, 2025 • 7:00 PM",
    entryFee: "1000",
    prizePool: "2,500",
    participants: { current: 32, max: 32 },
    status: "upcoming" as const,
    isNew: false,
  },
  {
    id: "5",
    title: "COD Solo Showdown",
    game: "COD",
    gameType: "Solo" as const,
    date: "May 20, 2025 • 6:00 PM",
    entryFee: "300",
    prizePool: "500",
    participants: { current: 45, max: 100 },
    status: "upcoming" as const,
    isNew: true,
  },
  {
    id: "6",
    title: "BGMI Solo Championships",
    game: "BGMI",
    gameType: "Solo" as const,
    date: "Live Now",
    entryFee: "200",
    prizePool: "800",
    participants: { current: 76, max: 100 },
    status: "live" as const,
    isNew: false,
  },
  {
    id: "7",
    title: "Valorant Duo Masters",
    game: "Valorant",
    gameType: "Duo" as const,
    date: "May 25, 2025 • 7:30 PM",
    entryFee: "800",
    prizePool: "1,500",
    participants: { current: 15, max: 32 },
    status: "upcoming" as const,
    isNew: true,
  },
];

// Sample teams data
const myTeams = [
  { id: "1", name: "Phoenix Rising", game: "BGMI", members: 4 },
  { id: "2", name: "Valorant Vipers", game: "Valorant", members: 5 },
  { id: "3", name: "COD Warriors", game: "COD", members: 2 },
];

const Tournaments = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("BGMI"); // Default to BGMI
  const [gameTypeFilter, setGameTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [registeredTournamentIds, setRegisteredTournamentIds] = useState<string[]>([]);

  // Handler for manual data refresh
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "Tournament data has been updated",
      });
    }, 1000);
  };

  // Filter tournaments based on selections
  let filteredTournaments = availableTournaments.filter((tournament) => {
    // For Tournaments page, we only show Live and Upcoming
    if (["live", "upcoming"].indexOf(tournament.status) === -1) return false;
    if (statusFilter !== "all" && tournament.status !== statusFilter) return false;
    if (gameFilter !== "all" && tournament.game !== gameFilter) return false;
    if (gameTypeFilter !== "all" && tournament.gameType !== gameTypeFilter) return false;
    
    // Date filter (simplified for example purposes)
    if (dateFilter) {
      // Implement date filtering logic here
      // For demo purposes, we'll just return true
      return true;
    }
    
    return true;
  });

  // Sort tournaments
  filteredTournaments = filteredTournaments.sort((a, b) => {
    if (sortBy === "newest") {
      return a.isNew ? -1 : b.isNew ? 1 : 0;
    } else {
      // Sort by status (live first, then upcoming)
      return a.status === "live" ? -1 : b.status === "live" ? 1 : 0;
    }
  });

  const handleJoinTournament = (tournament: (typeof availableTournaments)[0]) => {
    // For registered tournaments, don't allow re-registration
    if (registeredTournamentIds.includes(tournament.id)) {
      toast({
        title: "Already Registered",
        description: `You are already registered for ${tournament.title}`,
      });
      return;
    }
    
    // Open team selection modal
    setSelectedTournament(tournament);
  };
  
  const handleRegister = (tournamentId: string, teamId: string | null) => {
    // Close the modal
    setSelectedTournament(null);
    
    // Add to registered tournaments
    setRegisteredTournamentIds([...registeredTournamentIds, tournamentId]);
    
    const tournament = availableTournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    if (tournament.gameType === "Solo") {
      toast({
        title: "Registered Successfully",
        description: `You have registered for ${tournament.title}`,
      });
      return;
    }
    
    const team = myTeams.find(t => t.id === teamId);
    if (!team) return;
    
    toast({
      title: "Registered Successfully",
      description: `Team ${team.name} has been registered for ${tournament.title}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tournaments</h1>
            <p className="text-gray-400">Browse all available tournaments</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-300 bg-esports-dark border-esports-accent/30 flex items-center gap-2"
            onClick={handleRefresh}
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Team Selection Modal */}
        {selectedTournament && (
          <TeamSelectionModal 
            tournament={selectedTournament} 
            teams={myTeams}
            onClose={() => setSelectedTournament(null)}
            onRegister={handleRegister}
          />
        )}

        {/* Filters and Sort in one line */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TournamentFilters 
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            gameFilter={gameFilter}
            setGameFilter={setGameFilter}
            gameTypeFilter={gameTypeFilter}
            setGameTypeFilter={setGameTypeFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            showCompletedFilter={false}
          />
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-esports-dark border-esports-accent/30 text-gray-300">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/30">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="status">By Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tournament Cards */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                id={tournament.id}
                title={tournament.title}
                game={tournament.game}
                gameType={tournament.gameType}
                date={tournament.date}
                entryFee={tournament.entryFee}
                prizePool={tournament.prizePool}
                participants={tournament.participants}
                status={tournament.status}
                isRegistered={registeredTournamentIds.includes(tournament.id)}
                onJoin={() => handleJoinTournament(tournament)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No tournaments match your filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Simple refresh icon component to avoid importing from lucide-react
const RefreshIcon = ({ className }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 2v6h-6"></path>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
      <path d="M3 22v-6h6"></path>
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
    </svg>
  );
};

export default Tournaments;
