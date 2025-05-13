
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Trophy, Check, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Badge } from "@/components/ui/badge";
import RefreshButton from "@/components/RefreshButton";
import { supabase } from "@/integrations/supabase/client";
import { fetchData } from "@/utils/data-fetcher";
import LoadingSpinner from "@/components/LoadingSpinner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Tournament {
  id: string;
  name: string;
  game: string;
  date?: string;
  status: string;
  max_teams: number;
  prize_pool: number;
  winner?: string;
  secondPlace?: string;
  thirdPlace?: string;
  start_date: string;
}

interface Team {
  id: string;
  name: string;
}

const UpdateWinners = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [secondPlace, setSecondPlace] = useState<string | null>(null);
  const [thirdPlace, setThirdPlace] = useState<string | null>(null);
  const [multipleWinners, setMultipleWinners] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch completed tournaments
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await fetchData<Tournament[]>('tournaments', {
        columns: 'id, name, game, status, max_teams, prize_pool, start_date',
        filters: { status: 'completed' }
      });
      
      // Get tournament results for each tournament
      const tournamentsWithResults = await Promise.all(data.map(async (tournament) => {
        try {
          // Get first place (winner)
          const firstPlace = await fetchData('tournament_results', {
            columns: 'team_id',
            filters: { tournament_id: tournament.id, position: 1 },
            single: true
          });
          
          // Get second place
          const secondPlace = await fetchData('tournament_results', {
            columns: 'team_id',
            filters: { tournament_id: tournament.id, position: 2 },
            single: true
          });
          
          // Get third place
          const thirdPlace = await fetchData('tournament_results', {
            columns: 'team_id',
            filters: { tournament_id: tournament.id, position: 3 },
            single: true
          });
          
          // Get team names
          let winnerName, secondPlaceName, thirdPlaceName;
          
          if (firstPlace?.team_id) {
            const winnerTeam = await fetchData('teams', {
              columns: 'name',
              filters: { id: firstPlace.team_id },
              single: true
            });
            winnerName = winnerTeam?.name;
          }
          
          if (secondPlace?.team_id) {
            const secondTeam = await fetchData('teams', {
              columns: 'name',
              filters: { id: secondPlace.team_id },
              single: true
            });
            secondPlaceName = secondTeam?.name;
          }
          
          if (thirdPlace?.team_id) {
            const thirdTeam = await fetchData('teams', {
              columns: 'name',
              filters: { id: thirdPlace.team_id },
              single: true
            });
            thirdPlaceName = thirdTeam?.name;
          }
          
          return {
            ...tournament,
            date: new Date(tournament.start_date).toLocaleDateString(),
            winner: winnerName || null,
            secondPlace: secondPlaceName || null,
            thirdPlace: thirdPlaceName || null
          };
        } catch (error) {
          console.error("Error getting tournament results", error);
          return tournament;
        }
      }));
      
      setTournaments(tournamentsWithResults);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast({
        title: "Failed to load tournaments",
        description: "There was an error loading the tournament data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams
  const fetchTeams = async () => {
    try {
      const data = await fetchData<Team[]>('teams', {
        columns: 'id, name'
      });
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
    
    // Set up real-time subscription for tournaments
    const tournamentsChannel = supabase
      .channel('public:tournaments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        () => {
          fetchTournaments();
        }
      )
      .subscribe();
      
    // Set up real-time subscription for tournament results
    const resultsChannel = supabase
      .channel('public:tournament_results')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_results'
        },
        () => {
          fetchTournaments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(tournamentsChannel);
      supabase.removeChannel(resultsChannel);
    };
  }, []);

  // Filter tournaments based on search
  const filteredTournaments = tournaments.filter(tournament => 
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tournament.game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateClick = (tournament: Tournament) => {
    setCurrentTournament(tournament);
    setWinner(tournament.winner || null);
    setSecondPlace(tournament.secondPlace || null);
    setThirdPlace(tournament.thirdPlace || null);
    setMultipleWinners(tournament.secondPlace !== null || tournament.thirdPlace !== null);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateWinners = async () => {
    if (!winner) {
      toast({
        title: "Error",
        description: "Please select at least a winner",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate selections
    const selections = [winner, secondPlace, thirdPlace].filter(Boolean);
    if (new Set(selections).size !== selections.length) {
      toast({
        title: "Error",
        description: "Each place must have a different team",
        variant: "destructive"
      });
      return;
    }

    if (!currentTournament) return;

    try {
      // Get team IDs
      const winnerTeam = teams.find(team => team.name === winner);
      const secondTeam = secondPlace ? teams.find(team => team.name === secondPlace) : null;
      const thirdTeam = thirdPlace ? teams.find(team => team.name === thirdPlace) : null;

      if (!winnerTeam) {
        toast({
          title: "Error",
          description: "Winner team not found",
          variant: "destructive"
        });
        return;
      }

      // First, delete any existing results for this tournament
      await supabase
        .from('tournament_results')
        .delete()
        .eq('tournament_id', currentTournament.id);

      // Insert winner
      await supabase
        .from('tournament_results')
        .insert({
          tournament_id: currentTournament.id,
          team_id: winnerTeam.id,
          position: 1,
          prize: Math.floor(currentTournament.prize_pool * 0.6) // 60% to winner
        });

      // Insert second place if applicable
      if (multipleWinners && secondPlace && secondTeam) {
        await supabase
          .from('tournament_results')
          .insert({
            tournament_id: currentTournament.id,
            team_id: secondTeam.id,
            position: 2,
            prize: Math.floor(currentTournament.prize_pool * 0.3) // 30% to second place
          });
      }

      // Insert third place if applicable
      if (multipleWinners && thirdPlace && thirdTeam) {
        await supabase
          .from('tournament_results')
          .insert({
            tournament_id: currentTournament.id,
            team_id: thirdTeam.id,
            position: 3,
            prize: Math.floor(currentTournament.prize_pool * 0.1) // 10% to third place
          });
      }

      setIsUpdateDialogOpen(false);

      // Show success message
      toast({
        title: "Winners Updated",
        description: `Winners for ${currentTournament.name} have been updated successfully.`,
      });

      // Refresh the tournaments list
      fetchTournaments();

    } catch (error) {
      console.error("Error updating winners:", error);
      toast({
        title: "Error",
        description: "Failed to update winners. Please try again.",
        variant: "destructive"
      });
    }
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
        <RefreshButton onRefresh={fetchTournaments} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <InputWithIcon
          placeholder="Search tournaments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-esports-dark border-esports-accent/20 text-white"
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-esports-accent/20 rounded-full p-4 flex-shrink-0">
                      <Trophy className="h-8 w-8 text-esports-accent" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                        <Badge variant="outline" className="bg-esports-accent/10 text-esports-accent border-esports-accent/20">
                          {tournament.game}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{tournament.date}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>{tournament.max_teams} Teams</span>
                        </div>
                        <div className="text-sm text-yellow-500">
                          <span>{tournament.prize_pool} rdCoins</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        {tournament.winner ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <span className="text-sm text-esports-accent mr-2">Winner:</span>
                              <span className="text-white">{tournament.winner}</span>
                            </div>
                            {tournament.secondPlace && (
                              <div className="flex items-center">
                                <span className="text-sm text-esports-accent mr-2">2nd Place:</span>
                                <span className="text-white">{tournament.secondPlace}</span>
                              </div>
                            )}
                            {tournament.thirdPlace && (
                              <div className="flex items-center">
                                <span className="text-sm text-esports-accent mr-2">3rd Place:</span>
                                <span className="text-white">{tournament.thirdPlace}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-none">
                            Winners Not Set
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-4 md:mt-0">
                    <Button
                      onClick={() => handleUpdateClick(tournament)}
                      className="bg-esports-accent hover:bg-esports-accent/80 text-white"
                    >
                      {tournament.winner ? "Update Winners" : "Set Winners"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No completed tournaments match your search.</p>
          </div>
        )}
      </div>

      {/* Update Winners Dialog */}
      {currentTournament && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle>Update Tournament Winners</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set winners for {currentTournament.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="multipleWinners"
                  checked={multipleWinners}
                  onChange={(e) => setMultipleWinners(e.target.checked)}
                  className="rounded bg-esports-darker border-esports-accent/20"
                />
                <Label htmlFor="multipleWinners">Distribute prize among top 3 teams</Label>
              </div>

              <div>
                <Label htmlFor="winner">Winner (1st Place)</Label>
                <Select value={winner || ""} onValueChange={setWinner}>
                  <SelectTrigger id="winner" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                    <SelectValue placeholder="Select winner team" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    <SelectItem value="">Select a team</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {multipleWinners && (
                <>
                  <div>
                    <Label htmlFor="secondPlace">2nd Place</Label>
                    <Select value={secondPlace || ""} onValueChange={setSecondPlace}>
                      <SelectTrigger id="secondPlace" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                        <SelectValue placeholder="Select 2nd place team" />
                      </SelectTrigger>
                      <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                        <SelectItem value="">Select a team</SelectItem>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="thirdPlace">3rd Place</Label>
                    <Select value={thirdPlace || ""} onValueChange={setThirdPlace}>
                      <SelectTrigger id="thirdPlace" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                        <SelectValue placeholder="Select 3rd place team" />
                      </SelectTrigger>
                      <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                        <SelectItem value="">Select a team</SelectItem>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => setIsUpdateDialogOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateWinners}
                className="bg-esports-accent hover:bg-esports-accent/80 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                Update Winners
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default UpdateWinners;
