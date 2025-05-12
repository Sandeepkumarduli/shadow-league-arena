
import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Trophy, UserPlus } from "lucide-react";
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

const MyTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get teams where user is owner
      const { data: ownedTeams, error: ownedError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id);
      
      if (ownedError) {
        throw ownedError;
      }
      
      // Get teams the user is a member of
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);
      
      if (memberError) {
        throw memberError;
      }
      
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
          throw teamsError;
        }
        
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
          console.error('Error fetching team members:', membersError);
          return { ...team, members: [] };
        }
        
        const formattedMembers = members?.map(member => ({
          id: member.id,
          user_id: member.user_id,
          username: member.users?.username
        })) || [];
        
        return { ...team, members: formattedMembers };
      }));
      
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
      // Insert new team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([
          { name: newTeamName.trim(), owner_id: user.id }
        ])
        .select();
      
      if (teamError) throw teamError;
      
      if (teamData && teamData.length > 0) {
        const newTeam = teamData[0];
        
        // Add the owner as a team member as well
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([
            { team_id: newTeam.id, user_id: user.id }
          ]);
        
        if (memberError) throw memberError;
        
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

  const openDeleteDialog = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamToDelete);
      
      if (error) throw error;
      
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
            <div className="text-center py-20">
              <p className="text-gray-400">Loading your teams...</p>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
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
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-esports-accent hover:text-white hover:bg-esports-accent/10">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {team.members && team.members.map((member, index) => (
                          <div key={index} className="flex items-center justify-between bg-esports-darker rounded-md p-2">
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-esports-accent/20 flex items-center justify-center mr-2">
                                <Users className="h-3 w-3 text-esports-accent" />
                              </div>
                              <span className="text-sm text-white">{member.username || 'Unknown'}</span>
                            </div>
                            {member.user_id === team.owner_id && (
                              <span className="text-xs bg-esports-accent/20 text-esports-accent px-2 py-0.5 rounded">
                                Owner
                              </span>
                            )}
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
