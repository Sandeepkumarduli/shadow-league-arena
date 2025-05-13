
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchData } from "@/utils/data-fetcher";
import { Team, TeamMember } from "@/types/team";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  // Fetch teams data from Supabase
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await fetchData<Team[]>('teams', {
        columns: 'id, name, created_at, owner_id'
      });
      
      console.log("Fetched teams:", data);
      
      // Add some extra properties for UI
      const teamsWithMeta = await Promise.all(data.map(async (team) => {
        // Get team captain (owner)
        let captainName = "Unknown";
        if (team.owner_id) {
          const owner = await fetchData('users', {
            columns: 'username',
            filters: { id: team.owner_id },
            single: true
          });
          
          if (owner) {
            captainName = owner.username;
          }
        }
        
        // Count team members - fix type conversion issue
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select('count', { count: 'exact' })
          .eq('team_id', team.id);
        
        const membersCount = !membersError && membersData && membersData[0]?.count !== undefined
          ? Number(membersData[0].count) 
          : 0;
        
        // Count tournaments participated
        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from('tournament_registrations')
          .select('count', { count: 'exact' })
          .eq('team_id', team.id);
        
        const tournamentsCount = !tournamentsError && tournamentsData && tournamentsData[0]?.count !== undefined
          ? Number(tournamentsData[0].count)
          : 0;
        
        // Count wins (tournament results where position = 1)
        const { data: winsData, error: winsError } = await supabase
          .from('tournament_results')
          .select('count', { count: 'exact' })
          .eq('team_id', team.id)
          .eq('position', 1);
        
        const winsCount = !winsError && winsData && winsData[0]?.count !== undefined
          ? Number(winsData[0].count)
          : 0;
        
        return {
          ...team,
          game: team.game || "BGMI", // Default game if not set
          captain: captainName,
          members: membersCount,
          maxMembers: 4, // Default max members
          tournaments: tournamentsCount,
          wins: winsCount,
          active: true // Default active status
        } as Team; // Explicitly cast to Team type
      }));
      
      setTeams(teamsWithMeta);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error loading teams",
        description: "There was a problem loading the teams data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch team members for a specific team
  const fetchTeamMembers = async (teamId: string) => {
    try {
      // Get team members
      const { data: memberIds, error } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);
      
      if (error) throw error;
      
      // Get user details for each member
      const members = await Promise.all(memberIds.map(async (item) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, created_at')
          .eq('id', item.user_id)
          .single();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          return null;
        }
        
        // Determine if user is captain (team owner)
        const { data: team } = await supabase
          .from('teams')
          .select('owner_id')
          .eq('id', teamId)
          .single();
        
        const role = team && team.owner_id === userData.id ? "Captain" : "Member";
        
        return {
          id: userData.id,
          name: userData.username,
          role: role,
          joined: new Date(userData.created_at).toISOString().split('T')[0]
        };
      }));
      
      // Filter out null values (from errors)
      const validMembers = members.filter(member => member !== null) as TeamMember[];
      setTeamMembers(validMembers);
      
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Could not load team members",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a team
  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    try {
      // First delete team members
      await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamToDelete);
      
      // Then delete the team
      await supabase
        .from('teams')
        .delete()
        .eq('id', teamToDelete);
      
      toast({
        title: "Team Removed",
        description: "The team has been successfully removed.",
      });
      
      // Update local state
      setTeams(teams.filter(team => team.id !== teamToDelete));
      
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setTeamToDelete(null);
    }
  };
  
  // Handle banning a team
  const handleBanTeam = async (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    
    const newStatus = !team.active;
    
    try {
      // In a real app, you would update the active status in the database
      // Since there's no active column currently, this is just updating UI
      setTeams(teams.map(t => 
        t.id === teamId ? { ...t, active: newStatus } : t
      ));
      
      toast({
        title: newStatus ? "Team Unbanned" : "Team Banned",
        description: `Team ${team.name} has been ${newStatus ? 'unbanned' : 'banned'}.`,
      });
    } catch (error) {
      console.error("Error updating team status:", error);
      toast({
        title: "Error",
        description: "Failed to update team status",
        variant: "destructive",
      });
    }
  };
  
  return {
    teams,
    setTeams,
    teamMembers,
    setTeamMembers,
    loading,
    setLoading,
    selectedTeam,
    setSelectedTeam,
    teamToDelete,
    setTeamToDelete,
    fetchTeams,
    fetchTeamMembers,
    confirmDeleteTeam,
    handleBanTeam
  };
}
