
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, Users, Shield, Trash, Flag, Trophy, PlusCircle, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Sample teams data
const initialTeams = [
  {
    id: "1",
    name: "Phoenix Rising",
    game: "BGMI",
    members: 4,
    maxMembers: 4,
    captain: "FireHawk22",
    tournaments: 12,
    wins: 3,
    createdAt: "2023-08-15",
    active: true
  },
  {
    id: "2",
    name: "Valorant Vipers",
    game: "Valorant",
    members: 5,
    maxMembers: 5,
    captain: "ViperStrike",
    tournaments: 8,
    wins: 2,
    createdAt: "2023-09-02",
    active: true
  },
  {
    id: "3",
    name: "COD Warriors",
    game: "COD",
    members: 3,
    maxMembers: 4,
    captain: "SniperElite48",
    tournaments: 5,
    wins: 0,
    createdAt: "2023-10-12",
    active: true
  },
  {
    id: "4",
    name: "FreeFire Foxes",
    game: "FreeFire",
    members: 4,
    maxMembers: 4,
    captain: "FoxHunter",
    tournaments: 6,
    wins: 1,
    createdAt: "2023-12-05",
    active: false
  }
];

// Team members for a specific team (would be fetched based on team ID in a real app)
const teamMembers = [
  { id: "1", name: "FireHawk22", role: "Captain", joined: "2023-08-15" },
  { id: "2", name: "BlazeDragon", role: "Member", joined: "2023-08-16" },
  { id: "3", name: "StormRider", role: "Member", joined: "2023-08-18" },
  { id: "4", name: "ThunderBolt", role: "Member", joined: "2023-08-20" }
];

const AdminTeams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(initialTeams);
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
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
    setIsTeamDetailsOpen(true);
  };
  
  const handleDeleteTeam = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (!teamToDelete) return;
    
    const updatedTeams = teams.filter(team => team.id !== teamToDelete);
    setTeams(updatedTeams);
    
    toast({
      title: "Team Removed",
      description: "The team has been successfully removed.",
    });
    
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };
  
  const handleBanTeam = (teamId: string) => {
    // Toggle team active status
    const updatedTeams = teams.map(team => {
      if (team.id === teamId) {
        const newStatus = !team.active;
        
        toast({
          title: newStatus ? "Team Unbanned" : "Team Banned",
          description: `Team ${team.name} has been ${newStatus ? 'unbanned' : 'banned'}.`,
        });
        
        return {
          ...team,
          active: newStatus
        };
      }
      return team;
    });
    
    setTeams(updatedTeams);
  };
  
  const handleCreateTeam = () => {
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
    
    // Create new team
    const newTeam = {
      id: (teams.length + 1).toString(),
      name: newTeamName,
      game: newTeamGame,
      members: 1, // Starting with just the captain
      maxMembers: parseInt(newTeamMaxMembers),
      captain: newTeamCaptain,
      tournaments: 0,
      wins: 0,
      createdAt: new Date().toISOString().split('T')[0],
      active: true
    };
    
    setTeams([...teams, newTeam]);
    
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
        
        <Button
          onClick={() => setIsCreateTeamDialogOpen(true)}
          className="bg-esports-accent hover:bg-esports-accent/80 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Team
        </Button>
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
        {filteredTeams.length > 0 ? (
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
            <DialogTitle className="text-xl">Phoenix Rising</DialogTitle>
            <DialogDescription className="text-gray-400 flex items-center gap-2">
              <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                BGMI
              </Badge>
              <span>Created on August 15, 2023</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Team Members</h4>
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
