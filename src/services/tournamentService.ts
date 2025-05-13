
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tournament } from "@/types/tournament";
import { logActivity } from "./activityLogService";
import { Team } from "@/types/team";

// Fetch tournaments with optional filters
export const fetchTournaments = async (
  filters?: { status?: string; game?: string }
): Promise<Tournament[]> => {
  try {
    let query = supabase.from("tournaments").select("*");

    // Apply filters if provided
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.game && filters.game !== "all") {
      query = query.eq("game", filters.game);
    }

    // Order by date
    query = query.order("start_date", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    toast({
      title: "Error fetching tournaments",
      description: "There was an error loading tournament data.",
      variant: "destructive",
    });
    return [];
  }
};

// Fetch single tournament by ID
export const fetchTournamentById = async (id: string): Promise<Tournament | null> => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching tournament ${id}:`, error);
    toast({
      title: "Error fetching tournament",
      description: "There was an error loading the tournament data.",
      variant: "destructive",
    });
    return null;
  }
};

// Create tournament
export const createTournament = async (tournamentData: Omit<Tournament, 'id'>): Promise<Tournament | null> => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    // Make sure required fields have values
    const tournament = {
      ...tournamentData,
      created_by: user?.id
    };
    
    const { data, error } = await supabase
      .from("tournaments")
      .insert(tournament)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity({
      type: "tournament",
      action: "create",
      details: `Tournament "${tournament.name}" was created`,
      metadata: { tournamentId: data.id }
    });

    toast({
      title: "Tournament Created",
      description: `${tournament.name} has been created successfully.`,
    });

    return data;
  } catch (error) {
    console.error("Error creating tournament:", error);
    toast({
      title: "Error creating tournament",
      description: "There was an error creating the tournament.",
      variant: "destructive",
    });
    return null;
  }
};

// Update tournament
export const updateTournament = async (id: string, tournamentData: Partial<Tournament>): Promise<Tournament | null> => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .update(tournamentData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity({
      type: "tournament",
      action: "update",
      details: `Tournament "${data.name}" was updated`,
      metadata: { tournamentId: id, updates: tournamentData }
    });

    toast({
      title: "Tournament Updated",
      description: `Tournament has been updated successfully.`,
    });

    return data;
  } catch (error) {
    console.error(`Error updating tournament ${id}:`, error);
    toast({
      title: "Error updating tournament",
      description: "There was an error updating the tournament.",
      variant: "destructive",
    });
    return null;
  }
};

// Delete tournament
export const deleteTournament = async (id: string, name: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);

    if (error) throw error;

    // Log activity
    await logActivity({
      type: "tournament",
      action: "delete",
      details: `Tournament "${name}" was deleted`,
      metadata: { tournamentId: id }
    });

    toast({
      title: "Tournament Deleted",
      description: `${name} has been deleted successfully.`,
    });

    return true;
  } catch (error) {
    console.error(`Error deleting tournament ${id}:`, error);
    toast({
      title: "Error deleting tournament",
      description: "There was an error deleting the tournament.",
      variant: "destructive",
    });
    return false;
  }
};

// Subscribe to tournament changes
export const subscribeTournamentsChanges = (
  callback: (tournaments: Tournament[]) => void,
  filters?: { status?: string; game?: string }
) => {
  // Initial fetch
  fetchTournaments(filters).then(callback);

  // Set up real-time subscription
  const channel = supabase
    .channel('public:tournaments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tournaments' },
      () => {
        fetchTournaments(filters).then(callback);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Fetch completed tournaments
export const fetchCompletedTournaments = async (): Promise<Tournament[]> => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("status", "completed")
      .order("end_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching completed tournaments:", error);
    toast({
      title: "Error fetching tournaments",
      description: "There was an error loading completed tournaments.",
      variant: "destructive",
    });
    return [];
  }
};

// Fetch all teams
export const fetchAllTeams = async (): Promise<Team[]> => {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    toast({
      title: "Error fetching teams",
      description: "There was an error loading team data.",
      variant: "destructive",
    });
    return [];
  }
};

// Update tournament winners
export const updateTournamentWinners = async (
  tournamentId: string,
  prizePool: number,
  winnerId: string,
  secondPlaceId?: string | null,
  thirdPlaceId?: string | null
): Promise<boolean> => {
  try {
    // Get details of winner teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")
      .in("id", [winnerId, secondPlaceId, thirdPlaceId].filter(Boolean) as string[]);

    if (teamsError) throw teamsError;

    const teamsMap: Record<string, string> = {};
    teams?.forEach((team) => {
      teamsMap[team.id] = team.name;
    });

    // Calculate prize amounts based on positions
    // 1st place: 60% of prize pool
    // 2nd place: 30% of prize pool
    // 3rd place: 10% of prize pool
    const firstPrize = Math.floor(prizePool * 0.6);
    const secondPrize = Math.floor(prizePool * 0.3);
    const thirdPrize = Math.floor(prizePool * 0.1);

    // Update tournament with winner names
    const { error: updateError } = await supabase
      .from("tournaments")
      .update({
        winner: teamsMap[winnerId],
        secondPlace: secondPlaceId ? teamsMap[secondPlaceId] : null,
        thirdPlace: thirdPlaceId ? teamsMap[thirdPlaceId] : null,
      })
      .eq("id", tournamentId);

    if (updateError) throw updateError;

    // Add tournament results
    const results = [
      {
        tournament_id: tournamentId,
        team_id: winnerId,
        position: 1,
        prize: firstPrize,
      },
    ];

    if (secondPlaceId) {
      results.push({
        tournament_id: tournamentId,
        team_id: secondPlaceId,
        position: 2,
        prize: secondPrize,
      });
    }

    if (thirdPlaceId) {
      results.push({
        tournament_id: tournamentId,
        team_id: thirdPlaceId,
        position: 3,
        prize: thirdPrize,
      });
    }

    const { error: resultsError } = await supabase
      .from("tournament_results")
      .insert(results);

    if (resultsError) throw resultsError;

    // Log activity
    await logActivity({
      type: "tournament",
      action: "update_winners",
      details: `Tournament winners were updated`,
      metadata: {
        tournamentId,
        winner: teamsMap[winnerId],
        second: secondPlaceId ? teamsMap[secondPlaceId] : null,
        third: thirdPlaceId ? teamsMap[thirdPlaceId] : null,
      }
    });

    toast({
      title: "Winners Updated",
      description: "Tournament winners have been updated successfully.",
    });

    return true;
  } catch (error) {
    console.error(`Error updating tournament winners:`, error);
    toast({
      title: "Error updating winners",
      description: "There was an error updating the tournament winners.",
      variant: "destructive",
    });
    return false;
  }
};
