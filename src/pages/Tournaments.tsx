
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Trophy, Users, Filter, ChevronDown, ArrowRight } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { fetchTournaments, subscribeTournamentChanges } from "@/services/tournamentService";
import { Tournament } from "@/types/tournament";
import LoadingSpinner from "@/components/LoadingSpinner";

const Tournaments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeTournamentChanges((fetchedTournaments) => {
      setTournaments(fetchedTournaments);
      setFilteredTournaments(fetchedTournaments);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Apply filters
    let result = tournaments;
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        tournament => 
          tournament.name.toLowerCase().includes(query) || 
          tournament.game.toLowerCase().includes(query)
      );
    }
    
    // Game filter
    if (gameFilter !== "all") {
      result = result.filter(tournament => tournament.game === gameFilter);
    }
    
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(tournament => tournament.status === statusFilter);
    }
    
    setFilteredTournaments(result);
  }, [searchQuery, gameFilter, statusFilter, tournaments]);

  // Get unique games for the filter
  const uniqueGames = Array.from(new Set(tournaments.map(t => t.game)));

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-none";
      case "live":
        return "bg-green-500/20 text-green-400 border-none";
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-none";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-none";
      default:
        return "bg-gray-500/20 text-gray-400 border-none";
    }
  };

  return (
    <div className="flex h-screen bg-esports-darker overflow-hidden">
      {/* Sidebar */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Tournaments</h1>
              <p className="text-gray-400">Browse and join upcoming tournaments</p>
            </div>
            
            <Button
              className="bg-esports-accent hover:bg-esports-accent/80 text-white mt-4 md:mt-0"
              onClick={() => navigate('/request-admin')}
            >
              Request to Host Tournament
            </Button>
          </div>
          
          {/* Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search tournaments..."
                    className="bg-esports-dark border-esports-accent/20 text-white pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex md:hidden">
                <Button
                  variant="outline"
                  className="w-full border-esports-accent/20 text-white flex items-center justify-between"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                >
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Filter</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className={cn(
                "md:flex gap-4",
                isMobileFilterOpen ? "flex flex-col" : "hidden"
              )}>
                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-esports-dark border-esports-accent/20 text-white">
                    <SelectValue placeholder="Game" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    <SelectItem value="all">All Games</SelectItem>
                    {uniqueGames.map(game => (
                      <SelectItem key={game} value={game}>{game}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-esports-dark border-esports-accent/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Tournaments List */}
          {loading ? (
            <div className="text-center py-20">
              <LoadingSpinner />
            </div>
          ) : filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <Card key={tournament.id} className="bg-esports-dark border-esports-accent/20 hover:border-esports-accent/50 transition-colors overflow-hidden">
                  <div className="h-3 bg-esports-accent" />
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={getStatusBadgeClass(tournament.status)}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                        {tournament.game}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold font-rajdhani mb-3 text-white">
                      {tournament.name}
                    </h3>
                    
                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>{formatDate(tournament.start_date)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400">
                        <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Prize: {tournament.prize_pool} rdCoins</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400">
                        <Users className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Teams: {tournament.max_teams}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-esports-accent/10 flex items-center justify-between">
                      <div className="text-xl font-bold text-esports-accent">
                        {tournament.entry_fee > 0 ? `${tournament.entry_fee} rdCoins` : 'Free Entry'}
                      </div>
                      <Button 
                        className="bg-esports-accent hover:bg-esports-accent/80 text-white rounded-full"
                        size="sm"
                        onClick={() => navigate(`/tournaments/${tournament.id}`)}
                      >
                        <span className="mr-1">Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">No tournaments found matching your filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Tournaments;
