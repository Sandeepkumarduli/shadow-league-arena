
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import RefreshButton from "@/components/RefreshButton";
import { createRealtimeChannel, supabase } from "@/integrations/supabase/client";
import TeamFilters from "@/components/admin/TeamFilters";
import TeamDetails from "@/components/admin/TeamDetails";
import DeleteTeamDialog from "@/components/admin/DeleteTeamDialog";
import { useTeams } from "@/hooks/use-teams";
import CreateTeamHandler from "@/components/admin/team-management/CreateTeamHandler";
import FilteredTeamList from "@/components/admin/team-management/FilteredTeamList";

const AdminTeams = () => {
  const navigate = useNavigate();
  
  // Team state and management via custom hook
  const { 
    teams, 
    teamMembers, 
    loading, 
    selectedTeam,
    setSelectedTeam, 
    teamToDelete, 
    setTeamToDelete, 
    fetchTeams, 
    fetchTeamMembers, 
    confirmDeleteTeam, 
    handleBanTeam 
  } = useTeams();
  
  // Filter states
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [isTeamDetailsOpen, setIsTeamDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchTeams();
    
    // Setup real-time subscriptions with improved error handling
    const teamChannel = createRealtimeChannel('teams', () => {
      console.log("Teams table updated, refreshing data");
      fetchTeams();
    });
      
    const membersChannel = createRealtimeChannel('team_members', () => {
      console.log("Team members updated, refreshing data");
      if (selectedTeam) {
        fetchTeamMembers(selectedTeam);
      }
    });
    
    return () => {
      supabase.removeChannel(teamChannel);
      supabase.removeChannel(membersChannel);
    };
  }, []);

  const handleViewTeam = (teamId: string) => {
    setSelectedTeam(teamId);
    fetchTeamMembers(teamId);
    setIsTeamDetailsOpen(true);
  };
  
  const handleDeleteTeam = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDeleteDialogOpen(true);
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
      <FilteredTeamList
        teams={teams}
        loading={loading}
        gameFilter={gameFilter}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onViewDetails={handleViewTeam}
        onToggleBan={handleBanTeam}
        onDelete={handleDeleteTeam}
      />
      
      {/* Create Team Dialog */}
      <CreateTeamHandler
        isOpen={isCreateTeamDialogOpen}
        onOpenChange={setIsCreateTeamDialogOpen}
        onTeamCreated={fetchTeams}
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
        onConfirmDelete={confirmDeleteTeam}
      />
    </AdminLayout>
  );
};

export default AdminTeams;
