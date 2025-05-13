
import { supabase, createRealtimeChannel } from "@/integrations/supabase/client";
import { Tournament } from "@/types/tournament";
import { Team } from "@/types/team";
import { toast } from "@/hooks/use-toast";

// Fetch tournaments with optional filters
export const fetchTournaments = async (filters?: Record<string, any>): Promise<Tournament[]> => {
  try {
    let query = supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    toast({
      title: "Failed to fetch tournaments",
      description: "There was an error loading tournaments. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch all teams
export const fetchAllTeams = async (): Promise<Team[]> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*');
      
    if (error) throw error;
    
    return data as Team[];
  } catch (error) {
    console.error('Error fetching teams:', error);
    toast({
      title: "Failed to fetch teams",
      description: "There was an error loading teams. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch completed tournaments
export const fetchCompletedTournaments = async (): Promise<Tournament[]> => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'completed')
      .order('end_date', { ascending: false });
      
    if (error) throw error;
    
    return data as Tournament[];
  } catch (error) {
    console.error('Error fetching completed tournaments:', error);
    toast({
      title: "Failed to fetch tournaments",
      description: "There was an error loading tournaments. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Update tournament winners and distribute prizes
export const updateTournamentWinners = async (
  tournamentId: string, 
  prizePool: number,
  winnerId: string,
  secondPlaceId?: string | null,
  thirdPlaceId?: string | null
) => {
  try {
    // Calculate prize distribution
    const firstPlacePrize = secondPlaceId || thirdPlaceId 
      ? Math.floor(prizePool * 0.6) // 60% for winner if multiple places
      : prizePool; // 100% for winner if single winner
      
    const secondPlacePrize = secondPlaceId ? Math.floor(prizePool * 0.3) : 0; // 30% for second place
    const thirdPlacePrize = thirdPlaceId ? Math.floor(prizePool * 0.1) : 0; // 10% for third place
    
    // Start a transaction
    const { error: tournamentError } = await supabase.rpc('update_tournament_winners', {
      tournament_id: tournamentId,
      winner_id: winnerId,
      second_place_id: secondPlaceId || null,
      third_place_id: thirdPlaceId || null,
      first_prize: firstPlacePrize,
      second_prize: secondPlacePrize,
      third_prize: thirdPlacePrize
    });
    
    if (tournamentError) throw tournamentError;
    
    return true;
  } catch (error) {
    console.error('Error updating tournament winners:', error);
    toast({
      title: "Failed to update winners",
      description: "There was an error updating tournament winners. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Subscribe to tournament changes
export const subscribeTournamentChanges = (callback: (tournaments: Tournament[]) => void) => {
  // Initial fetch
  fetchTournaments().then(callback);
  
  // Set up real-time subscription
  const channel = createRealtimeChannel('tournaments', () => {
    fetchTournaments().then(callback);
  });
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Create a new tournament
export const createTournament = async (tournamentData: Omit<Tournament, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error creating tournament:', error);
    toast({
      title: "Failed to create tournament",
      description: "There was an error creating the tournament. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Update an existing tournament
export const updateTournament = async (id: string, tournamentData: Partial<Tournament>) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .update(tournamentData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error updating tournament:', error);
    toast({
      title: "Failed to update tournament",
      description: "There was an error updating the tournament. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Delete a tournament
export const deleteTournament = async (id: string) => {
  try {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting tournament:', error);
    toast({
      title: "Failed to delete tournament",
      description: "There was an error deleting the tournament. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
