
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, Users, Shield, Trash, Flag, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Sample teams data
const teamsData = [
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
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isTeamDetailsOpen, setIsTeamDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  
  // Filter teams based on selections
  const filteredTeams = teamsData.filter(team => {
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
    
    // In a real application, this would be an API call to delete the team
    toast({
      title: "Team Removed",
      description: "The team has been successfully removed.",
    });
    
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
    // In a real app, you would update the state or refetch the data
  };
  
  const handleBanTeam = (teamId: string) => {
    // In a real application, this would be an API call to ban the team
    toast({
      title: "Team Banned",
      description: `Team ID: ${teamId} has been banned.`,
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-center mb-6">
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
              <SelectItem value="inactive">Inactive</SelectItem>
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
                      <Badge variant={team.active ? "default" : "secondary"} className={team.active ? "bg-green-800/30 text-green-400 border-none" : "bg-gray-800/30 text-gray-400 border-none"}>
                        {team.active ? "Active" : "Inactive"}
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
                        <Shield className="h-4 w-4 mr-2 text-esports-accent" />
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
                      className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
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
