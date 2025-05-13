
import { supabase } from "@/integrations/supabase/client";
import { Tournament } from "@/types/tournament";
import { fetchData } from "@/utils/data-fetcher";
import { Team } from "@/types/team";

export const fetchCompletedTournaments = async (): Promise<Tournament[]> => {
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
    
    return tournamentsWithResults;
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    throw error;
  }
};

export const fetchAllTeams = async (): Promise<Team[]> => {
  try {
    return await fetchData<Team[]>('teams', {
      columns: 'id, name'
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

export const updateTournamentWinners = async (
  tournamentId: string,
  prizePool: number,
  winnerTeamId: string, 
  secondTeamId?: string, 
  thirdTeamId?: string
) => {
  try {
    // First, delete any existing results for this tournament
    await supabase
      .from('tournament_results')
      .delete()
      .eq('tournament_id', tournamentId);

    // Insert winner
    await supabase
      .from('tournament_results')
      .insert({
        tournament_id: tournamentId,
        team_id: winnerTeamId,
        position: 1,
        prize: Math.floor(prizePool * 0.6) // 60% to winner
      });

    // Insert second place if applicable
    if (secondTeamId) {
      await supabase
        .from('tournament_results')
        .insert({
          tournament_id: tournamentId,
          team_id: secondTeamId,
          position: 2,
          prize: Math.floor(prizePool * 0.3) // 30% to second place
        });
    }

    // Insert third place if applicable
    if (thirdTeamId) {
      await supabase
        .from('tournament_results')
        .insert({
          tournament_id: tournamentId,
          team_id: thirdTeamId,
          position: 3,
          prize: Math.floor(prizePool * 0.1) // 10% to third place
        });
    }
  } catch (error) {
    console.error("Error updating tournament winners:", error);
    throw error;
  }
};
