
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TournamentCard from "@/components/TournamentCard";
import TournamentFilters from "@/components/TournamentFilters";
import { toast } from "@/hooks/use-toast";

// Sample tournaments data
const registeredTournaments = [
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
    isRegistered: true,
    roomId: "",
    password: "",
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
    isRegistered: true,
    roomId: "BGM45678",
    password: "winner2025",
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
    isRegistered: true,
    roomId: "",
    password: "",
  },
  {
    id: "4",
    title: "COD Mobile Battle Royale",
    game: "COD",
    gameType: "Solo" as const,
    date: "Completed on May 10",
    entryFee: "$8",
    prizePool: "$1,800",
    participants: { current: 50, max: 50 },
    status: "completed" as const,
    isRegistered: true,
    roomId: "",
    password: "",
    position: 3,
  },
  {
    id: "5",
    title: "BGMI Solo Showdown",
    game: "BGMI",
    gameType: "Solo" as const,
    date: "May 22, 2025 • 9:00 PM",
    entryFee: "$2",
    prizePool: "$800",
    participants: { current: 120, max: 150 },
    status: "upcoming" as const,
    isRegistered: true,
    roomId: "",
    password: "",
  },
];

const RegisteredTournaments = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [gameTypeFilter, setGameTypeFilter] = useState("all");

  // Filter tournaments based on selections
  const filteredTournaments = registeredTournaments.filter((tournament) => {
    if (statusFilter !== "all" && tournament.status !== statusFilter) return false;
    if (gameFilter !== "all" && tournament.game !== gameFilter) return false;
    if (gameTypeFilter !== "all" && tournament.gameType !== gameTypeFilter) return false;
    return true;
  });

  const handleJoinLive = (tournamentId: string) => {
    // Get the tournament
    const tournament = registeredTournaments.find(t => t.id === tournamentId);
    
    if (tournament && tournament.status === "live") {
      if (tournament.roomId && tournament.password) {
        toast({
          title: "Joining Tournament",
          description: `Room ID: ${tournament.roomId}, Password: ${tournament.password}`,
        });
      } else {
        toast({
          title: "Room details not available",
          description: "The admin has not provided room details yet.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Registered Tournaments</h1>
          <p className="text-gray-400">View tournaments you have registered for</p>
        </div>

        {/* Filters */}
        <TournamentFilters 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          gameFilter={gameFilter}
          setGameFilter={setGameFilter}
          gameTypeFilter={gameTypeFilter}
          setGameTypeFilter={setGameTypeFilter}
        />

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
                isRegistered={tournament.isRegistered}
                roomId={tournament.roomId}
                password={tournament.password}
                position={tournament.position}
                onJoin={() => handleJoinLive(tournament.id)}
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

export default RegisteredTournaments;
