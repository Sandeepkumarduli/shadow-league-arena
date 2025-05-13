
import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Trophy, UserPlus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  members?: TeamMember[];
}

interface TeamMember {
  id: string;
  user_id: string;
  username?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

const MyTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [editTeamName, setEditTeamName] = useState("");
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [usersSearchResults, setUsersSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log("Fetching teams for user:", user.id);
      
      // Get teams where user is owner
      const { data: ownedTeams, error: ownedError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id);
      
      if (ownedError) {
        console.error("Error fetching owned teams:", ownedError);
        throw ownedError;
      }
      
      console.log("Owned teams:", ownedTeams);
      
      // Get teams the user is a member of
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);
      
      if (memberError) {
        console.error("Error fetching member teams:", memberError);
        throw memberError;
      }
      
      console.log("Member team IDs:", memberTeams);
      
      // Fetch complete team data for teams user is a member of
      let memberTeamsData: Team[] = [];
      if (memberTeams && memberTeams.length > 0) {
        const teamIds = memberTeams.map(t => t.team_id);
        
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .not('owner_id', 'eq', user.id); // Exclude teams where user is owner to avoid duplicates
        
        if (teamsError) {
          console.error("Error fetching member teams data:", teamsError);
          throw teamsError;
        }
        
        console.log("Member teams data:", teamsData);
        memberTeamsData = teamsData || [];
      }
      
      // Combine both sets of teams
      const allTeams = [...(ownedTeams || []), ...memberTeamsData];
      
      // For each team, fetch members
      const teamsWithMembers = await Promise.all(allTeams.map(async (team) => {
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('*, users:user_id(username)')
          .eq('team_id', team.id);
        
        if (membersError) {
          console.error('Error fetching team members for team ' + team.id + ':', membersError);
          return { ...team, members: [] };
        }
        
        console.log("Team " + team.id + " members:", members);
        
        const formattedMembers = members?.map(member => ({
          id: member.id,
          user_id: member.user_id,
          username: member.users?.username
        })) || [];
        
        return { ...team, members: formattedMembers };
      }));
      
      console.log("Teams with members:", teamsWithMembers);
      setTeams(teamsWithMembers);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load your teams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!user) return;
    
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Creating team with name:", newTeamName);
      
      // Insert new team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([
          { name: newTeamName.trim(), owner_id: user.id }
        ])
        .select();
      
      if (teamError) {
        console.error("Error creating team:", teamError);
        throw teamError;
      }
      
      if (teamData && teamData.length > 0) {
        const newTeam = teamData[0];
        
        console.log("New team created:", newTeam);
        
        // Add the owner as a team member as well
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([
            { team_id: newTeam.id, user_id: user.id }
          ]);
        
        if (memberError) {
          console.error("Error adding owner as team member:", memberError);
          throw memberError;
        }
        
        toast({
          title: "Team Created",
          description: `Your team "${newTeamName}" has been created successfully.`,
        });
        
        setNewTeamName("");
        setIsCreateDialogOpen(false);
        fetchTeams(); // Refresh the teams list
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (team: Team) => {
    setCurrentTeam(team);
    setEditTeamName(team.name);
    setIsEditDialogOpen(true);
  };

  const openAddMemberDialog = (team: Team) => {
    setCurrentTeam(team);
    setUserSearch("");
    setUsersSearchResults([]);
    setIsAddMemberDialogOpen(true);
  };

  const handleSearchUsers = async () => {
    if (!userSearch.trim() || userSearch.trim().length < 3) {
      toast({
        title: "Invalid Search",
        description: "Please enter at least 3 characters to search.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      console.log("Searching for users with query:", userSearch);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email')
        .ilike('username', `%${userSearch}%`)
        .limit(10);
      
      if (error) {
        console.error("Error searching users:", error);
        throw error;
      }
      
      console.log("User search results:", data);
      
      // Filter out users that are already team members if a team is selected
      if (currentTeam && currentTeam.members) {
        const currentMemberIds = currentTeam.members.map(m => m.user_id);
        const filteredUsers = data?.filter(u => !currentMemberIds.includes(u.id)) || [];
        setUsersSearchResults(filteredUsers);
      } else {
        setUsersSearchResults(data || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search for users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!currentTeam || !user) return;
    
    try {
      console.log(`Adding user ${userId} to team ${currentTeam.id}`);
      
      const { error } = await supabase
        .from('team_members')
        .insert([
          { team_id: currentTeam.id, user_id: userId }
        ]);
      
      if (error) {
        console.error("Error adding team member:", error);
        throw error;
      }
      
      toast({
        title: "Member Added",
        description: "Team member has been added successfully.",
      });
      
      // Remove added user from search results
      setUsersSearchResults(usersSearchResults.filter(u => u.id !== userId));
      
      // Refresh teams data
      fetchTeams();
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    try {
      console.log(`Removing member ${memberId} from team ${teamId}`);
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);
      
      if (error) {
        console.error("Error removing team member:", error);
        throw error;
      }
      
      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully.",
      });
      
      // Update local state
      setTeams(teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            members: team.members?.filter(member => member.id !== memberId)
          };
        }
        return team;
      }));
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTeam = async () => {
    if (!currentTeam || !editTeamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log(`Updating team ${currentTeam.id} name to: ${editTeamName}`);
      
      const { error } = await supabase
        .from('teams')
        .update({ name: editTeamName.trim() })
        .eq('id', currentTeam.id);
      
      if (error) {
        console.error("Error updating team:", error);
        throw error;
      }
      
      toast({
        title: "Team Updated",
        description: "Your team has been updated successfully.",
      });
      
      // Update local state
      setTeams(teams.map(team => 
        team.id === currentTeam.id ? { ...team, name: editTeamName.trim() } : team
      ));
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Deleting team:", teamToDelete);
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamToDelete);
      
      if (error) {
        console.error("Error deleting team:", error);
        throw error;
      }
      
      toast({
        title: "Team Deleted",
        description: "Your team has been deleted successfully.",
      });
      
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
      
      // Update local state by removing the deleted team
      setTeams(teams.filter(team => team.id !== teamToDelete));
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-esports-darker overflow-hidden">
      {/* Sidebar */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">My Teams</h1>
              <p className="text-gray-400">Manage your teams and members</p>
            </div>
            
            <Button 
              className="bg-esports-accent hover:bg-esports-accent/80 text-white"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
          
          {/* Teams Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="bg-esports-dark border-esports-accent/20 overflow-hidden">
                  <div className="h-2 bg-esports-accent" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 bg-esports-dark/50" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-1/3 bg-esports-dark/50" />
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full bg-esports-dark/50" />
                      <Skeleton className="h-10 w-full bg-esports-dark/50" />
                      <Skeleton className="h-10 w-full bg-esports-dark/50" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="bg-esports-dark border-esports-accent/20 overflow-hidden">
                  <div className="h-2 bg-esports-accent" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white flex items-center justify-between">
                      <span className="truncate">{team.name}</span>
                      {team.owner_id === user?.id && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-white"
                            onClick={() => openEditDialog(team)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                            onClick={() => openDeleteDialog(team.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <div className="text-xs text-gray-500 mb-4">
                      Created: {formatDate(team.created_at)}
                    </div>
                    
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Trophy className="h-4 w-4 text-esports-accent mr-2" />
                        <span>Tournaments: 0</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300 text-sm">
                        <Trophy className="h-4 w-4 text-green-500 mr-2" />
                        <span>Wins: 0</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t border-esports-accent/10 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-white">Team Members</h4>
                        
                        {team.owner_id === user?.id && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-esports-accent hover:text-white hover:bg-esports-accent/10"
                            onClick={() => openAddMemberDialog(team)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {team.members && team.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between bg-esports-darker rounded-md p-2">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-esports-accent/20 flex items-center justify-center mr-2">
                                <Users className="h-3 w-3 text-esports-accent" />
                              </div>
                              <span className="text-sm text-white">{member.username || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center">
                              {member.user_id === team.owner_id && (
                                <span className="text-xs bg-esports-accent/20 text-esports-accent px-2 py-0.5 rounded mr-2">
                                  Owner
                                </span>
                              )}
                              
                              {team.owner_id === user?.id && member.user_id !== team.owner_id && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleRemoveMember(team.id, member.id)}
                                  className="h-6 w-6 text-gray-400 hover:text-red-400"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="h-16 w-16 bg-esports-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-esports-accent" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No Teams Yet</h2>
              <p className="text-gray-400 mb-6">Create a team to start participating in tournaments</p>
              <Button 
                className="bg-esports-accent hover:bg-esports-accent/80 text-white"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
            </div>
          )}
        </main>
      </div>
      
      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your team details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="bg-esports-darker border-esports-accent/20 text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              className="text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-esports-accent hover:bg-esports-accent/80 text-white"
              onClick={handleCreateTeam}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your team details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editTeamName">Team Name</Label>
              <Input
                id="editTeamName"
                placeholder="Enter team name"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                className="bg-esports-darker border-esports-accent/20 text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-esports-accent hover:bg-esports-accent/80 text-white"
              onClick={handleEditTeam}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Search for users to add to your team
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Input
                placeholder="Search users by username"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-esports-darker border-esports-accent/20 text-white flex-1"
              />
              <Button
                onClick={handleSearchUsers}
                disabled={isSearching || userSearch.trim().length < 3}
                className="bg-esports-accent hover:bg-esports-accent/80"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {usersSearchResults.length > 0 ? (
              <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-400">Search Results</h3>
                {usersSearchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-esports-darker rounded-md p-3">
                    <div>
                      <p className="text-white text-sm">{user.username}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddMember(user.id)}
                      className="bg-esports-accent/20 hover:bg-esports-accent/40 text-esports-accent"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : userSearch.trim() && !isSearching ? (
              <div className="text-center py-4 text-gray-400">
                No users found
              </div>
            ) : null}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddMemberDialogOpen(false)}
              className="text-white"
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
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTeam}
              disabled={isSubmitting}
              className="bg-red-900 hover:bg-red-800 text-white"
            >
              {isSubmitting ? "Deleting..." : "Delete Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTeams;
