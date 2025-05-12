
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Search, CalendarCheck, Edit, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sample tournaments data
const initialTournaments = [
  {
    id: "4",
    title: "COD Mobile Battle Royale",
    game: "COD",
    gameType: "Solo",
    date: "2025-05-10",
    formattedDate: "Completed on May 10",
    entryFeeType: "free",
    prizePool: "1800",
    participants: {
      current: 50,
      max: 50
    },
    status: "completed",
    distributeToTopThree: false,
    firstPlacePrize: "1800",
    description: "COD Mobile solo competition with amazing prizes.",
    winner: null
  },
  {
    id: "5",
    title: "Valorant Weekly Championship",
    game: "Valorant",
    gameType: "Squad",
    date: "2025-05-09",
    formattedDate: "Completed on May 9",
    entryFeeType: "paid",
    entryFee: "300",
    prizePool: "1500",
    participants: {
      current: 16,
      max: 16
    },
    status: "completed",
    distributeToTopThree: true,
    firstPlacePrize: "800",
    secondPlacePrize: "500",
    thirdPlacePrize: "200",
    description: "Weekly Valorant tournament for squad teams.",
    winner: null
  }
];

// Sample teams data
const teamsData = [
  { id: "team1", name: "Phoenix Rising" },
  { id: "team2", name: "Valorant Vipers" },
  { id: "team3", name: "COD Warriors" },
  { id: "team4", name: "FreeFire Foxes" },
  { id: "team5", name: "Esports Legends" },
  { id: "team6", name: "Game Masters" }
];

const UpdateWinners = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [tournaments, setTournaments] = useState(initialTournaments);
  
  const [isUpdateWinnersOpen, setIsUpdateWinnersOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  
  // Form state
  const [firstPlaceTeam, setFirstPlaceTeam] = useState("");
  const [secondPlaceTeam, setSecondPlaceTeam] = useState("");
  const [thirdPlaceTeam, setThirdPlaceTeam] = useState("");
  
  // Filter tournaments
  const filteredTournaments = tournaments.filter(tournament => {
    // Only show completed tournaments
    if (tournament.status !== "completed") return false;
    
    // Apply game filter
    if (gameFilter !== "all" && tournament.game !== gameFilter) return false;
    
    // Apply search query
    if (searchQuery && !tournament.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  const handleUpdateWinners = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (tournament) {
      setSelectedTournament(tournament);
      setFirstPlaceTeam("");
      setSecondPlaceTeam("");
      setThirdPlaceTeam("");
      setIsUpdateWinnersOpen(true);
    }
  };
  
  const handleSaveWinners = () => {
    if (!selectedTournament) return;
    
    if (!firstPlaceTeam) {
      toast({
        title: "First Place Required",
        description: "Please select a team for first place.",
        variant: "destructive",
      });
      return;
    }
    
    // If top 3 distribution is enabled, require all three places
    if (selectedTournament.distributeToTopThree) {
      if (!secondPlaceTeam || !thirdPlaceTeam) {
        toast({
          title: "All Winners Required",
          description: "Please select teams for all three places.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Update tournament with winners
    const updatedTournaments = tournaments.map(tournament => {
      if (tournament.id === selectedTournament.id) {
        const winners = {
          firstPlace: {
            teamId: firstPlaceTeam,
            teamName: teamsData.find(t => t.id === firstPlaceTeam)?.name || "",
            prize: selectedTournament.firstPlacePrize || selectedTournament.prizePool
          }
        };
        
        if (selectedTournament.distributeToTopThree) {
          winners["secondPlace"] = {
            teamId: secondPlaceTeam,
            teamName: teamsData.find(t => t.id === secondPlaceTeam)?.name || "",
            prize: selectedTournament.secondPlacePrize
          };
          winners["thirdPlace"] = {
            teamId: thirdPlaceTeam,
            teamName: teamsData.find(t => t.id === thirdPlaceTeam)?.name || "",
            prize: selectedTournament.thirdPlacePrize
          };
        }
        
        return {
          ...tournament,
          winner: winners
        };
      }
      return tournament;
    });
    
    setTournaments(updatedTournaments);
    
    toast({
      title: "Winners Updated",
      description: "Tournament winners have been set and prize money distributed.",
    });
    
    // In a real app, this would trigger notifications to winners and update balances
    
    setIsUpdateWinnersOpen(false);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center text-gray-400 hover:text-white mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Update Tournament Winners</h1>
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <InputWithIcon
          placeholder="Search completed tournaments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-esports-dark border-esports-accent/20 text-white"
          icon={<Search className="h-4 w-4" />}
        />
        
        <Select
          value={gameFilter}
          onValueChange={setGameFilter}
        >
          <SelectTrigger className="bg-esports-dark border-esports-accent/20 text-white">
            <SelectValue placeholder="Filter by Game" />
          </SelectTrigger>
          <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="BGMI">BGMI</SelectItem>
            <SelectItem value="Valorant">Valorant</SelectItem>
            <SelectItem value="COD">COD</SelectItem>
            <SelectItem value="FreeFire">Free Fire</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Completed Tournaments List */}
      <div className="space-y-4">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                        {tournament.game}
                      </Badge>
                      <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                        {tournament.gameType}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-none">
                        Completed
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold font-rajdhani mb-4 text-white">
                      {tournament.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <CalendarCheck className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>{tournament.formattedDate}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300">
                        <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Prize pool: {tournament.prizePool} rdCoins</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300">
                        {tournament.winner ? (
                          <div className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-green-400">Winners updated</span>
                          </div>
                        ) : (
                          <div className="text-amber-400">Pending winner update</div>
                        )}
                      </div>
                    </div>
                    
                    {tournament.winner && (
                      <div className="mt-4 pt-4 border-t border-esports-accent/10">
                        <h4 className="text-sm font-medium text-white mb-2">Winners:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                            <span className="text-sm">1st: {tournament.winner.firstPlace.teamName} ({tournament.winner.firstPlace.prize} rdCoins)</span>
                          </div>
                          
                          {tournament.distributeToTopThree && tournament.winner.secondPlace && (
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm">2nd: {tournament.winner.secondPlace.teamName} ({tournament.winner.secondPlace.prize} rdCoins)</span>
                            </div>
                          )}
                          
                          {tournament.distributeToTopThree && tournament.winner.thirdPlace && (
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 mr-2 text-amber-700" />
                              <span className="text-sm">3rd: {tournament.winner.thirdPlace.teamName} ({tournament.winner.thirdPlace.prize} rdCoins)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateWinners(tournament.id)}
                      className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
                      disabled={!!tournament.winner}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {tournament.winner ? "Winners Updated" : "Update Winners"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No completed tournaments found.</p>
          </div>
        )}
      </div>
      
      {/* Update Winners Dialog */}
      <Dialog open={isUpdateWinnersOpen} onOpenChange={setIsUpdateWinnersOpen}>
        {selectedTournament && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle>Update Tournament Winners</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set the winners for "{selectedTournament.title}" and distribute the prize pool.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-2">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                  <span className="text-sm text-gray-300">Total Prize Pool: {selectedTournament.prizePool} rdCoins</span>
                </div>
                
                {selectedTournament.distributeToTopThree && (
                  <div className="text-xs text-amber-400 mt-1">
                    This tournament has prize distribution for top 3 teams.
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="firstPlaceTeam" className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                  1st Place ({selectedTournament.distributeToTopThree ? selectedTournament.firstPlacePrize : selectedTournament.prizePool} rdCoins)
                </Label>
                <Select value={firstPlaceTeam} onValueChange={setFirstPlaceTeam}>
                  <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    {teamsData.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTournament.distributeToTopThree && (
                <>
                  <div>
                    <Label htmlFor="secondPlaceTeam" className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-gray-400" />
                      2nd Place ({selectedTournament.secondPlacePrize} rdCoins)
                    </Label>
                    <Select value={secondPlaceTeam} onValueChange={setSecondPlaceTeam}>
                      <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                        {teamsData
                          .filter(team => team.id !== firstPlaceTeam)
                          .map(team => (
                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="thirdPlaceTeam" className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-amber-700" />
                      3rd Place ({selectedTournament.thirdPlacePrize} rdCoins)
                    </Label>
                    <Select value={thirdPlaceTeam} onValueChange={setThirdPlaceTeam}>
                      <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                        {teamsData
                          .filter(team => team.id !== firstPlaceTeam && team.id !== secondPlaceTeam)
                          .map(team => (
                            <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsUpdateWinnersOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveWinners}
                className="bg-esports-accent hover:bg-esports-accent/80"
              >
                Update Winners & Distribute Prizes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
};

export default UpdateWinners;
