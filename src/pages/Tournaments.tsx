
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TournamentCard from "@/components/TournamentCard";
import TournamentFilters from "@/components/TournamentFilters";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample tournaments data
const availableTournaments = [
  {
    id: "1",
    title: "BGMI Pro League Season 5",
    game: "BGMI",
    gameType: "Squad" as const,
    date: "May 18, 2025 • 8:00 PM",
    entryFee: "Free",
    prizePool: "$3,000",
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
    entryFee: "$5",
    prizePool: "$1,200",
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
    entryFee: "$10",
    prizePool: "$2,500",
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
    entryFee: "$3",
    prizePool: "$500",
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
    entryFee: "$2",
    prizePool: "$800",
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
    entryFee: "$8",
    prizePool: "$1,500",
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
  const [gameFilter, setGameFilter] = useState("all");
  const [gameTypeFilter, setGameTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Filter tournaments based on selections
  let filteredTournaments = availableTournaments.filter((tournament) => {
    // For Tournaments page, we only show Live and Upcoming
    // Fixed: Don't directly compare with "completed" status since it's not in the allowed types
    if (["live", "upcoming"].indexOf(tournament.status) === -1) return false;
    if (statusFilter !== "all" && tournament.status !== statusFilter) return false;
    if (gameFilter !== "all" && tournament.game !== gameFilter) return false;
    if (gameTypeFilter !== "all" && tournament.gameType !== gameTypeFilter) return false;
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
    // For Solo tournaments
    if (tournament.gameType === "Solo") {
      toast({
        title: "Registered Successfully",
        description: `You have registered for ${tournament.title}`,
      });
      return;
    }

    // Find a team for the specific game
    const eligibleTeams = myTeams.filter(team => team.game === tournament.game);
    
    if (eligibleTeams.length === 0) {
      toast({
        title: "No teams available",
        description: `You need to create a team for ${tournament.game} first.`,
        variant: "destructive",
      });
      return;
    }

    // Check team size requirements
    if (tournament.gameType === "Duo") {
      const duoTeam = eligibleTeams.find(team => team.members === 2);
      
      if (!duoTeam) {
        toast({
          title: "Team size mismatch",
          description: "Duo tournaments require a team of exactly 2 members.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registered Successfully",
        description: `Team ${duoTeam.name} has been registered for ${tournament.title}`,
      });
    } else if (tournament.gameType === "Squad") {
      const squadTeam = eligibleTeams.find(team => team.members >= 4);
      
      if (!squadTeam) {
        toast({
          title: "Team size mismatch",
          description: "Squad tournaments require a team of at least 4 members.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Registered Successfully",
        description: `Team ${squadTeam.name} has been registered for ${tournament.title}`,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <p className="text-gray-400">Browse all available tournaments</p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="lg:w-3/4">
            <TournamentFilters 
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              gameFilter={gameFilter}
              setGameFilter={setGameFilter}
              gameTypeFilter={gameTypeFilter}
              setGameTypeFilter={setGameTypeFilter}
              showCompletedFilter={false}
            />
          </div>
          
          <div className="w-full lg:w-1/4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full bg-esports-dark border-esports-accent/30 text-gray-300">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-esports-dark border-esports-accent/30">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tournament Cards */}
        {filteredTournaments.length > 0 ? (
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

export default Tournaments;
