
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Tournament } from "@/types/tournament";
import { logActivity } from "./activityLogService";

// Interface for update tournament request
interface UpdateTournamentParams {
  id: string;
  name?: string;
  game?: string;
  date?: string;
  status?: string;
  max_teams?: number;
  prize_pool?: number;
  entry_fee?: number;
  start_date?: string;
  winner?: string;
  secondPlace?: string;
  thirdPlace?: string;
}

// Fetch all tournaments
export const fetchTournaments = async (): Promise<Tournament[]> => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    toast({
      title: "Failed to fetch tournaments",
      description: "There was an error loading the tournaments.",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch a single tournament by ID
export const fetchTournamentById = async (id: string): Promise<Tournament | null> => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error fetching tournament ${id}:`, error);
    toast({
      title: "Failed to fetch tournament",
      description: "There was an error loading the tournament details.",
      variant: "destructive"
    });
    return null;
  }
};

// Create a new tournament
export const createTournament = async (tournamentData: Partial<Tournament>): Promise<Tournament | null> => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournamentData)
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the activity
    await logActivity({
      type: 'tournament',
      action: 'create',
      details: `Created tournament: ${tournamentData.name}`,
      metadata: { tournamentId: data.id }
    });
    
    toast({
      title: "Tournament Created",
      description: `Tournament "${tournamentData.name}" has been created successfully.`,
    });
    
    return data;
  } catch (error) {
    console.error('Error creating tournament:', error);
    toast({
      title: "Failed to create tournament",
      description: "There was an error creating the tournament.",
      variant: "destructive"
    });
    return null;
  }
};

// Update an existing tournament
export const updateTournament = async (tournamentData: UpdateTournamentParams): Promise<Tournament | null> => {
  try {
    const { id, ...updateData } = tournamentData;
    
    const { data, error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the activity
    await logActivity({
      type: 'tournament',
      action: 'update',
      details: `Updated tournament: ${data.name}`,
      metadata: { tournamentId: id, updates: updateData }
    });
    
    toast({
      title: "Tournament Updated",
      description: `Tournament "${data.name}" has been updated successfully.`,
    });
    
    return data;
  } catch (error) {
    console.error('Error updating tournament:', error);
    toast({
      title: "Failed to update tournament",
      description: "There was an error updating the tournament.",
      variant: "destructive"
    });
    return null;
  }
};

// Delete a tournament
export const deleteTournament = async (id: string): Promise<boolean> => {
  try {
    // Get tournament info for the log before deletion
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('name')
      .eq('id', id)
      .single();
      
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    // Log the activity
    await logActivity({
      type: 'tournament',
      action: 'delete',
      details: `Deleted tournament: ${tournament?.name || id}`,
      metadata: { tournamentId: id }
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting tournament:', error);
    toast({
      title: "Failed to delete tournament",
      description: "There was an error deleting the tournament.",
      variant: "destructive"
    });
    return false;
  }
};

// Register a team for a tournament
export const registerTeamForTournament = async (
  tournamentId: string, 
  teamId: string
): Promise<boolean> => {
  try {
    // Call Supabase RPC function to handle registration and payment
    const { data, error } = await supabase.rpc(
      'register_team_for_tournament', 
      { p_tournament_id: tournamentId, p_team_id: teamId } as any
    );

    if (error) throw error;
    
    if (data) {
      toast({
        title: "Registration Successful",
        description: "Your team has been registered for the tournament.",
      });
      return true;
    } else {
      toast({
        title: "Registration Failed",
        description: "You may not have enough coins or the tournament is full.",
        variant: "destructive"
      });
      return false;
    }
  } catch (error: any) {
    console.error('Error registering team:', error);
    toast({
      title: "Registration Failed",
      description: error.message || "There was an error registering for this tournament.",
      variant: "destructive"
    });
    return false;
  }
};
