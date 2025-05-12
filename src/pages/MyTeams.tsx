import { useState } from "react";
import { Plus, UserPlus, Key, LogIn, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Sample teams data
const sampleTeams = [
  {
    id: "1",
    name: "Phoenix Squad",
    game: "BGMI",
    teamCode: "PHX-123",
    members: [
      { id: "u1", username: "FireHawk", isCaptain: true },
      { id: "u2", username: "BlazeDragon", isCaptain: false },
      { id: "u3", username: "InfernoKnight", isCaptain: false },
    ],
    createdBy: "u1"
  },
  {
    id: "2",
    name: "Shadow Wolves",
    game: "BGMI",
    teamCode: "SW-456",
    members: [
      { id: "u1", username: "FireHawk", isCaptain: true },
      { id: "u4", username: "NightStalker", isCaptain: false },
      { id: "u5", username: "SilentAssassin", isCaptain: false },
      { id: "u6", username: "PhantomBlade", isCaptain: false },
    ],
    createdBy: "u1"
  }
];

// Mock current user
const currentUser = { id: "u1", username: "FireHawk" };

// Form validation schema for create team
const createTeamSchema = z.object({
  teamName: z.string().min(3, { message: "Team name must be at least 3 characters" }).max(30),
  gameType: z.string().min(1, { message: "Game type is required" }),
  members: z.string().optional()
});

// Form validation schema for join team
const joinTeamSchema = z.object({
  teamCode: z.string().min(5, { message: "Team code must be at least 5 characters" })
});

const MyTeams = () => {
  const [teams, setTeams] = useState(sampleTeams);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isAddMemberSheetOpen, setIsAddMemberSheetOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<typeof sampleTeams[0] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form for creating teams
  const createTeamForm = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      teamName: "",
      gameType: "BGMI",
      members: ""
    }
  });

  // Form for joining teams
  const joinTeamForm = useForm<z.infer<typeof joinTeamSchema>>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: {
      teamCode: ""
    }
  });

  // Form for adding members
  const addMemberForm = useForm({
    defaultValues: {
      memberUsername: ""
    }
  });

  // Handle create team submission
  const onCreateTeamSubmit = (data: z.infer<typeof createTeamSchema>) => {
    if (teams.length >= 4) {
      setError("You can only create up to 4 teams");
      return;
    }

    // Generate a unique team code
    const teamCode = `${data.teamName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    
    // Create a new team
    const newTeam = {
      id: `team-${Date.now()}`,
      name: data.teamName,
      game: data.gameType,
      teamCode,
      members: [
        { id: currentUser.id, username: currentUser.username, isCaptain: true }
      ],
      createdBy: currentUser.id
    };

    // Add member if provided
    if (data.members) {
      const memberUsernames = data.members.split(',').map(m => m.trim()).filter(m => m);
      
      for (const username of memberUsernames) {
        // In a real app, you'd verify if the username exists
        if (username !== currentUser.username) {
          newTeam.members.push({
            id: `u-${Date.now()}-${Math.random()}`,
            username,
            isCaptain: false
          });
        }
      }
    }

    setTeams([...teams, newTeam]);
    setIsCreateDialogOpen(false);
    setSuccessMessage(`Team "${data.teamName}" created successfully!`);
    createTeamForm.reset();

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle join team submission
  const onJoinTeamSubmit = (data: z.infer<typeof joinTeamSchema>) => {
    const team = teams.find(t => t.teamCode === data.teamCode);
    
    if (!team) {
      setError("Invalid team code");
      return;
    }

    if (team.members.some(m => m.id === currentUser.id)) {
      setError("You are already a member of this team");
      return;
    }

    if (team.members.length >= 5) {
      setError("This team already has the maximum number of members (5)");
      return;
    }

    // Add the current user to the team
    const updatedTeams = teams.map(t => {
      if (t.id === team.id) {
        return {
          ...t,
          members: [
            ...t.members,
            { id: currentUser.id, username: currentUser.username, isCaptain: false }
          ]
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    setIsJoinDialogOpen(false);
    setSuccessMessage(`Successfully joined team "${team.name}"`);
    joinTeamForm.reset();

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle adding a member to a team
  const onAddMemberSubmit = (data: { memberUsername: string }) => {
    if (!selectedTeam) return;
    
    if (selectedTeam.members.length >= 5) {
      setError("This team already has the maximum number of members (5)");
      return;
    }

    if (selectedTeam.members.some(m => m.username === data.memberUsername)) {
      setError(`${data.memberUsername} is already a member of this team`);
      return;
    }

    // Add the member to the team
    const updatedTeams = teams.map(t => {
      if (t.id === selectedTeam.id) {
        return {
          ...t,
          members: [
            ...t.members,
            { id: `u-${Date.now()}-${Math.random()}`, username: data.memberUsername, isCaptain: false }
          ]
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    // Update selected team with the new data
    setSelectedTeam(updatedTeams.find(t => t.id === selectedTeam.id) || null);
    addMemberForm.reset();
    setSuccessMessage(`${data.memberUsername} added to the team!`);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle removing a member from a team
  const handleRemoveMember = (teamId: string, memberId: string) => {
    if (memberId === currentUser.id) {
      setError("You cannot remove yourself from the team");
      return;
    }

    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          members: t.members.filter(m => m.id !== memberId)
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    // Update selected team if it's currently open
    if (selectedTeam && selectedTeam.id === teamId) {
      setSelectedTeam(updatedTeams.find(t => t.id === teamId) || null);
    }
    setSuccessMessage("Team member removed successfully");

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle leaving a team
  const handleLeaveTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    
    if (!team) return;

    // If user is captain and there are other members
    if (team.createdBy === currentUser.id && team.members.length > 1) {
      setError("As the team captain, you must transfer captaincy or delete the team first");
      return;
    }

    // If user is the only member, remove the team
    if (team.members.length === 1) {
      setTeams(teams.filter(t => t.id !== teamId));
      setSuccessMessage(`Team "${team.name}" has been deleted as you were the only member`);
      return;
    }

    // Otherwise, leave the team
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          members: t.members.filter(m => m.id !== currentUser.id)
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    setSuccessMessage(`You have left the team "${team.name}"`);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Handle deleting a team
  const handleDeleteTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    
    if (!team) return;

    // Verify the user is the captain
    if (team.createdBy !== currentUser.id) {
      setError("Only the team captain can delete the team");
      return;
    }

    setTeams(teams.filter(t => t.id !== teamId));
    setSuccessMessage(`Team "${team.name}" has been deleted`);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Check if the user can modify the team (is captain)
  const canModifyTeam = (team: typeof sampleTeams[0]) => {
    return team.createdBy === currentUser.id;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Teams</h1>
            <p className="text-gray-400">Manage your teams and invites</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-esports-accent hover:bg-esports-accent-hover"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsJoinDialogOpen(true)}
              className="border-esports-accent text-esports-accent hover:bg-esports-accent/20"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Join Now
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="bg-green-900/20 border-green-700">
            <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="bg-red-900/20 border-red-700">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Teams Grid */}
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <Card 
                key={team.id} 
                className="bg-esports-card border-esports-accent/20 text-white overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    <span>{team.name}</span>
                    <span className="text-sm font-normal text-esports-accent px-2 py-1 bg-esports-accent/10 rounded">
                      {team.game}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    {/* Team Code */}
                    <div className="flex items-center bg-esports-dark/50 p-2 rounded-md">
                      <Key className="h-4 w-4 text-esports-accent mr-2" />
                      <div className="text-sm">
                        <span className="text-gray-400">Team Code: </span>
                        <span className="font-mono">{team.teamCode}</span>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Members:</div>
                      <div className="space-y-1">
                        {team.members.map(member => (
                          <div 
                            key={member.id} 
                            className="flex items-center justify-between bg-esports-dark/30 p-2 rounded-md"
                          >
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{member.username}</span>
                              {member.isCaptain && (
                                <span className="ml-2 text-xs bg-esports-accent/20 text-esports-accent px-2 py-0.5 rounded">
                                  Captain
                                </span>
                              )}
                            </div>
                            
                            {canModifyTeam(team) && member.id !== currentUser.id && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => handleRemoveMember(team.id, member.id)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-2 border-t border-gray-800">
                  {canModifyTeam(team) ? (
                    // Captain actions
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-esports-accent hover:text-esports-accent-hover hover:bg-esports-accent/10"
                        onClick={() => {
                          setSelectedTeam(team);
                          setIsAddMemberSheetOpen(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Member
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        Delete Team
                      </Button>
                    </>
                  ) : (
                    // Member actions
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 ml-auto"
                      onClick={() => handleLeaveTeam(team.id)}
                    >
                      Leave Team
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-esports-card border border-dashed border-esports-accent/20 rounded-lg p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-esports-accent/50 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Teams Found</h3>
            <p className="text-gray-400 mb-4">
              You haven't created or joined any teams yet. Create a new team or join an existing one.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-esports-accent hover:bg-esports-accent-hover"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsJoinDialogOpen(true)}
                className="border-esports-accent text-esports-accent hover:bg-esports-accent/20"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Join Now
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-esports-card border-esports-accent/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details below to create your team. You'll be the team captain.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createTeamForm}>
            <form onSubmit={createTeamForm.handleSubmit(onCreateTeamSubmit)} className="space-y-4">
              <FormField
                control={createTeamForm.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your team name" 
                        className="bg-esports-dark border-esports-accent/20 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createTeamForm.control}
                name="gameType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-esports-dark border-esports-accent/20 text-white">
                          <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                        <SelectItem value="BGMI">BGMI</SelectItem>
                        <SelectItem value="COD" disabled>COD (Coming Soon)</SelectItem>
                        <SelectItem value="Free Fire" disabled>Free Fire (Coming Soon)</SelectItem>
                        <SelectItem value="Valorant" disabled>Valorant (Coming Soon)</SelectItem>
                        <SelectItem value="Fortnite" disabled>Fortnite (Coming Soon)</SelectItem>
                        <SelectItem value="League of Legends" disabled>League of Legends (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createTeamForm.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Members (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter usernames separated by commas" 
                        className="bg-esports-dark border-esports-accent/20 text-white min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      You can add up to 4 more members (5 total including you)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-esports-accent hover:bg-esports-accent-hover">
                  Create Team
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Join Team Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="bg-esports-card border-esports-accent/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Team</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the team code to join an existing team
            </DialogDescription>
          </DialogHeader>
          
          <Form {...joinTeamForm}>
            <form onSubmit={joinTeamForm.handleSubmit(onJoinTeamSubmit)} className="space-y-4">
              <FormField
                control={joinTeamForm.control}
                name="teamCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter team code" 
                        className="bg-esports-dark border-esports-accent/20 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      The team code was shared by the team captain
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsJoinDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-esports-accent hover:bg-esports-accent-hover">
                  Join Team
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Team Member Sheet */}
      <Sheet open={isAddMemberSheetOpen} onOpenChange={setIsAddMemberSheetOpen}>
        <SheetContent className="bg-esports-card border-esports-accent/20 text-white">
          <SheetHeader>
            <SheetTitle>Add Team Member</SheetTitle>
            <SheetDescription className="text-gray-400">
              {selectedTeam && `Add new members to ${selectedTeam.name}`}
            </SheetDescription>
          </SheetHeader>
          
          {selectedTeam && selectedTeam.members.length >= 5 ? (
            <div className="mt-6">
              <Alert className="bg-red-900/20 border-red-700">
                <AlertDescription className="text-red-400">
                  This team already has the maximum number of members (5)
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <form 
              onSubmit={addMemberForm.handleSubmit(onAddMemberSubmit)} 
              className="mt-6 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="memberUsername">Username</Label>
                <Input 
                  id="memberUsername"
                  placeholder="Enter username to add" 
                  className="bg-esports-dark border-esports-accent/20 text-white"
                  {...addMemberForm.register("memberUsername", { required: true })} 
                />
                <p className="text-sm text-gray-400">
                  Only registered users can be added to your team
                </p>
              </div>
              
              <SheetFooter>
                <Button type="submit" className="bg-esports-accent hover:bg-esports-accent-hover">
                  Add Member
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default MyTeams;
