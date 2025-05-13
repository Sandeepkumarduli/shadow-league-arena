
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import RefreshButton from "@/components/RefreshButton";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import TournamentWinnerCard from '@/components/admin/TournamentWinnerCard';
import UpdateWinnersDialog from '@/components/admin/UpdateWinnersDialog';
import { fetchCompletedTournaments, fetchAllTeams, updateTournamentWinners } from '@/services/tournamentService';
import { Tournament } from '@/types/tournament';
import { Team } from '@/types/team';

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
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("status", "completed")
        .order("end_date", { ascending: false });

      if (error) throw error;
      
      console.log("Fetched completed tournaments:", data);
      setTournaments(data || []);
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
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      if (error) throw error;
      
      console.log("Fetched teams:", data);
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Failed to load teams",
        description: "There was an error loading the team data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
    
    // Set up real-time subscription for tournaments with improved handling
    const tournamentsChannel = supabase
      .channel('public:tournaments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          console.log("Tournaments table updated, refreshing data");
          fetchTournaments();
        }
      )
      .subscribe();
      
    // Set up real-time subscription for tournament results
    const resultsChannel = supabase
      .channel('public:tournament_results')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_results' },
        () => {
          console.log("Tournament results updated, refreshing data");
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

      // Update winners
      const success = await updateTournamentWinners(
        currentTournament.id,
        currentTournament.prize_pool,
        winnerTeam.id,
        secondTeam?.id,
        thirdTeam?.id
      );

      if (success) {
        setIsUpdateDialogOpen(false);

        // Show success message
        toast({
          title: "Winners Updated",
          description: `Winners for ${currentTournament.name} have been updated successfully.`,
        });

        // Refresh the tournaments list
        fetchTournaments();
      }
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
            <TournamentWinnerCard 
              key={tournament.id}
              tournament={tournament}
              onUpdateClick={handleUpdateClick}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No completed tournaments match your search.</p>
          </div>
        )}
      </div>

      {/* Update Winners Dialog */}
      <UpdateWinnersDialog
        isOpen={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        tournament={currentTournament}
        teams={teams}
        winner={winner}
        setWinner={setWinner}
        secondPlace={secondPlace}
        setSecondPlace={setSecondPlace}
        thirdPlace={thirdPlace}
        setThirdPlace={setThirdPlace}
        multipleWinners={multipleWinners}
        setMultipleWinners={setMultipleWinners}
        onUpdateWinners={handleUpdateWinners}
      />
    </AdminLayout>
  );
};

export default UpdateWinners;
