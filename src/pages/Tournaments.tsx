
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TournamentCard from "@/components/TournamentCard";
import TournamentFilters from "@/components/TournamentFilters";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tournament } from "@/types/tournament";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { subscribeTournamentChanges } from "@/services/tournamentService";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Search } from "lucide-react";

export default function Tournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeTournamentChanges(
      (data) => {
        setTournaments(data);
        setLoading(false);
      },
      {
        status: statusFilter !== "all" ? statusFilter : undefined,
        game: gameFilter !== "all" && gameFilter !== "" ? gameFilter : undefined
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [statusFilter, gameFilter]);

  // Get unique game types for filter dropdown
  const gameTypes = Array.from(
    new Set(tournaments.map((tournament) => tournament.game))
  );

  // Filter tournaments based on search query
  const filteredTournaments = tournaments.filter((tournament) =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tournament.game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-24">
      {/* Hero Section */}
      <div className="relative bg-esports-dark rounded-lg p-6 md:p-10 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-esports-accent/20 to-transparent opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <Trophy className="h-7 w-7 md:h-10 md:w-10 text-esports-accent mr-3" />
            <h1 className="text-3xl md:text-5xl font-bold font-rajdhani text-white">
              TOURNAMENTS
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-6">
            Compete in exciting esports tournaments across various games. 
            Register your team, battle against the best, and win incredible prizes!
          </p>
          <Button 
            className="bg-esports-accent hover:bg-esports-accent/80 text-white clip-path-angle"
            onClick={() => navigate('/my-teams')}
          >
            Register Your Team
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <InputWithIcon
          placeholder="Search tournaments..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="bg-esports-dark border-esports-accent/20 text-white"
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <TournamentFilters
        statusFilter={statusFilter}
        gameFilter={gameFilter}
        searchQuery={searchQuery}
        gameTypes={gameTypes}
        onStatusChange={setStatusFilter}
        onGameChange={setGameFilter}
        onSearchChange={handleSearchChange}
      />

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <Trophy className="h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
          <p className="text-gray-400 text-center max-w-md">
            There are no tournaments matching your current filters. Try changing your filter criteria or check back later for new tournaments.
          </p>
        </div>
      )}
    </div>
  );
}
