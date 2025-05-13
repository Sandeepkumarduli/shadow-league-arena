
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import RefreshButton from "@/components/RefreshButton";
import { supabase } from "@/integrations/supabase/client";
import { fetchData } from "@/utils/data-fetcher";
import LoadingSpinner from "@/components/LoadingSpinner";
import TeamCard from "@/components/admin/TeamCard";
import TeamFilters from "@/components/admin/TeamFilters";
import TeamDetails from "@/components/admin/TeamDetails";
import CreateTeamDialog from "@/components/admin/CreateTeamDialog";
import DeleteTeamDialog from "@/components/admin/DeleteTeamDialog";
import { Team, TeamMember } from "@/types/team";

const AdminTeams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isTeamDetailsOpen, setIsTeamDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  
  // Form states for creating team
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamGame, setNewTeamGame] = useState("");
  const [newTeamCaptain, setNewTeamCaptain] = useState("");
  const [newTeamMaxMembers, setNewTeamMaxMembers] = useState("4");
  
  // Fetch teams data from Supabase
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await fetchData<Team[]>('teams', {
        columns: 'id, name, created_at, owner_id'
      });
      
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
        
        // Count team members
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select('count', { count: 'exact' })
          .eq('team_id', team.id);
        
        const membersCount = !membersError && membersData && membersData[0]?.count !== undefined
          ? membersData[0].count 
          : 0;
        
        // Count tournaments participated
        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from('tournament_registrations')
          .select('count', { count: 'exact' })
          .eq('team_id', team.id);
        
        const tournamentsCount = !tournamentsError && tournamentsData && tournamentsData[0]?.count !== undefined
          ? tournamentsData[0].count
          : 0;
        
        // Count wins (tournament results where position = 1)
        const { data: winsData, error: winsError } = await supabase
          .from('tournament_results')
          .select('count', { count: 'exact' })
          .eq('team_id', team.id)
          .eq('position', 1);
        
        const winsCount = !winsError && winsData && winsData[0]?.count !== undefined
          ? winsData[0].count
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
        };
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

  useEffect(() => {
    fetchTeams();
    
    // Setup real-time subscriptions
    const teamChannel = supabase
      .channel('public:teams')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          fetchTeams();
        }
      )
      .subscribe();
      
    const membersChannel = supabase
      .channel('public:team_members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_members' },
        () => {
          if (selectedTeam) {
            fetchTeamMembers(selectedTeam);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(teamChannel);
      supabase.removeChannel(membersChannel);
    };
  }, []);

  // Filter teams based on selections
  const filteredTeams = teams.filter(team => {
    // Apply game filter
    if (gameFilter !== "all" && team.game !== gameFilter) return false;
    
    // Apply status filter
    if (statusFilter !== "all" && 
        ((statusFilter === "active" && !team.active) || 
         (statusFilter === "inactive" && team.active))) return false;
    
    // Apply search query
    if (searchQuery && !team.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  const handleViewTeam = (teamId: string) => {
    setSelectedTeam(teamId);
    fetchTeamMembers(teamId);
    setIsTeamDetailsOpen(true);
  };
  
  const handleDeleteTeam = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
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
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };
  
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
  
  const handleCreateTeam = async () => {
    // Validation
    if (!newTeamName.trim()) {
      toast({
        title: "Team Name Required",
        description: "Please enter a team name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTeamGame) {
      toast({
        title: "Game Selection Required",
        description: "Please select a game for the team.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTeamCaptain.trim()) {
      toast({
        title: "Captain Required",
        description: "Please enter a captain username.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First check if captain exists by username
      const { data: captainData, error: captainError } = await supabase
        .from('users')
        .select('id')
        .eq('username', newTeamCaptain.trim())
        .single();
      
      if (captainError || !captainData) {
        toast({
          title: "Captain Not Found",
          description: "The captain username was not found in the system.",
          variant: "destructive",
        });
        return;
      }
      
      // Create new team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: newTeamName.trim(),
          owner_id: captainData.id,
          // game: newTeamGame // Uncomment if game column exists
        })
        .select()
        .single();
      
      if (teamError) throw teamError;
      
      // Add captain as team member
      await supabase
        .from('team_members')
        .insert({
          team_id: newTeam.id,
          user_id: captainData.id
        });
      
      toast({
        title: "Team Created",
        description: `Team "${newTeamName}" has been successfully created.`,
      });
      
      // Reset form and close dialog
      setNewTeamName("");
      setNewTeamGame("");
      setNewTeamCaptain("");
      setNewTeamMaxMembers("4");
      setIsCreateTeamDialogOpen(false);
      
      // Refresh teams list
      fetchTeams();
      
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
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
          <h1 className="text-2xl font-bold text-white">Manage Teams</h1>
        </div>
        
        <div className="flex gap-2">
          <RefreshButton onRefresh={fetchTeams} />
          <Button
            onClick={() => setIsCreateTeamDialogOpen(true)}
            className="bg-esports-accent hover:bg-esports-accent/80 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <TeamFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        gameFilter={gameFilter}
        onGameFilterChange={setGameFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      
      {/* Teams List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onViewDetails={handleViewTeam}
              onToggleBan={handleBanTeam}
              onDelete={handleDeleteTeam}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No teams match your filters.</p>
          </div>
        )}
      </div>
      
      {/* Create Team Dialog */}
      <CreateTeamDialog
        open={isCreateTeamDialogOpen}
        onOpenChange={setIsCreateTeamDialogOpen}
        newTeamName={newTeamName}
        onNewTeamNameChange={setNewTeamName}
        newTeamGame={newTeamGame}
        onNewTeamGameChange={setNewTeamGame}
        newTeamCaptain={newTeamCaptain}
        onNewTeamCaptainChange={setNewTeamCaptain}
        newTeamMaxMembers={newTeamMaxMembers}
        onNewTeamMaxMembersChange={setNewTeamMaxMembers}
        onCreateTeam={handleCreateTeam}
      />
      
      {/* Team Details Dialog */}
      <TeamDetails
        open={isTeamDetailsOpen}
        onOpenChange={setIsTeamDetailsOpen}
        selectedTeam={teams.find(t => t.id === selectedTeam) || null}
        teamMembers={teamMembers}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteTeamDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />
    </AdminLayout>
  );
};

export default AdminTeams;
