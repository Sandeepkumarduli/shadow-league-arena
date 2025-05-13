
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, Users, Shield, Trash, Flag, Trophy, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RefreshButton from "@/components/RefreshButton";
import { supabase } from "@/integrations/supabase/client";
import { fetchData } from "@/utils/data-fetcher";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Team {
  id: string;
  name: string;
  game?: string;
  created_at: string;
  active?: boolean;
  captain?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  joined: string;
}

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
        
        const membersCount = !membersError ? membersData || 0 : 0;
        
        // Count tournaments participated
        const { data: tournamentsData, error: tournamentsError } = await supabase
          .from('tournament_registrations')
          .select('count', { count: 'exact' })
          .eq('team_id', team.id);
        
        const tournamentsCount = !tournamentsError ? tournamentsData || 0 : 0;
        
        // Count wins (tournament results where position = 1)
        const { data: winsData, error: winsError } = await supabase
          .from('tournament_results')
          .select('count', { count: 'exact' })
          .eq('team_id', team.id)
          .eq('position', 1);
        
        const winsCount = !winsError ? winsData || 0 : 0;
        
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <InputWithIcon
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-esports-dark border-esports-accent/20 text-white"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div>
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
        <div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="bg-esports-dark border-esports-accent/20 text-white">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Teams List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <Card key={team.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                        {team.game}
                      </Badge>
                      <Badge variant={team.active ? "default" : "secondary"} className={team.active ? "bg-green-800/30 text-green-400 border-none" : "bg-red-800/30 text-red-400 border-none"}>
                        {team.active ? "Active" : "Banned"}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold font-rajdhani mb-3 text-white">
                      {team.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-300">
                        <Shield className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Captain: {team.captain}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Users className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Members: {team.members}/{team.maxMembers}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Tournaments: {team.tournaments}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300">
                        <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Wins: {team.wins}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
                      onClick={() => handleViewTeam(team.id)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className={team.active ? 
                        "border-amber-500/20 text-amber-400 hover:bg-amber-500/10" : 
                        "border-green-500/20 text-green-400 hover:bg-green-500/10"}
                      onClick={() => handleBanTeam(team.id)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      {team.active ? "Ban Team" : "Unban Team"}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-900/20 hover:bg-red-900/40 text-red-500"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No teams match your filters.</p>
          </div>
        )}
      </div>
      
      {/* Create Team Dialog */}
      <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details to create a new team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div>
              <Label htmlFor="teamName" className="text-white">Team Name</Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                className="bg-esports-darker border-esports-accent/20 text-white mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="game" className="text-white">Game</Label>
              <Select value={newTeamGame} onValueChange={setNewTeamGame}>
                <SelectTrigger id="game" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                  <SelectValue placeholder="Select game" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  <SelectItem value="BGMI">BGMI</SelectItem>
                  <SelectItem value="Valorant">Valorant</SelectItem>
                  <SelectItem value="COD">COD Mobile</SelectItem>
                  <SelectItem value="FreeFire">Free Fire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="captain" className="text-white">Captain Username</Label>
              <Input
                id="captain"
                value={newTeamCaptain}
                onChange={(e) => setNewTeamCaptain(e.target.value)}
                placeholder="Enter captain's username"
                className="bg-esports-darker border-esports-accent/20 text-white mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="maxMembers" className="text-white">Maximum Team Size</Label>
              <Select value={newTeamMaxMembers} onValueChange={setNewTeamMaxMembers}>
                <SelectTrigger id="maxMembers" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                  <SelectValue placeholder="Select max team size" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  <SelectItem value="1">1 (Solo)</SelectItem>
                  <SelectItem value="2">2 (Duo)</SelectItem>
                  <SelectItem value="4">4 (Squad)</SelectItem>
                  <SelectItem value="5">5 (Squad+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateTeamDialogOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleCreateTeam}
              className="bg-esports-accent hover:bg-esports-accent/80"
            >
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Team Details Dialog */}
      <Dialog open={isTeamDetailsOpen} onOpenChange={setIsTeamDetailsOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{teams.find(t => t.id === selectedTeam)?.name || "Team Details"}</DialogTitle>
            <DialogDescription className="text-gray-400 flex items-center gap-2">
              <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                {teams.find(t => t.id === selectedTeam)?.game || "Unknown Game"}
              </Badge>
              <span>Created on {teams.find(t => t.id === selectedTeam)?.created_at ? 
                new Date(teams.find(t => t.id === selectedTeam)?.created_at || "").toLocaleDateString() : 
                "Unknown Date"}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Team Members</h4>
            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex justify-between items-center p-3 bg-esports-darker rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-esports-accent" />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-400">Joined: {member.joined}</p>
                      </div>
                    </div>
                    <div>
                      <Badge variant={member.role === "Captain" ? "default" : "outline"} className={member.role === "Captain" ? "bg-esports-accent/20 text-esports-accent border-none" : "bg-esports-dark text-white border-esports-accent/30"}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">No team members found.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTeamDetailsOpen(false)}
              className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-900/20 hover:bg-red-900/40 text-red-500"
            >
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminTeams;
