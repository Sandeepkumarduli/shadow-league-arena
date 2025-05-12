
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Trophy, Check, X, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Sample completed tournaments data
const completedTournaments = [
  {
    id: "1",
    name: "BGMI Weekly Cup",
    game: "BGMI",
    date: "2023-05-01",
    status: "completed",
    teams: 16,
    prizePool: 1000,
    winner: null,
    secondPlace: null,
    thirdPlace: null
  },
  {
    id: "2",
    name: "Free Fire Tournament",
    game: "Free Fire",
    date: "2023-05-05",
    status: "completed",
    teams: 24,
    prizePool: 1500,
    winner: null,
    secondPlace: null,
    thirdPlace: null
  },
  {
    id: "3",
    name: "COD Mobile League",
    game: "COD Mobile",
    date: "2023-05-08",
    status: "completed",
    teams: 12,
    prizePool: 800,
    winner: "Team Alpha",
    secondPlace: "The Destroyers",
    thirdPlace: "Phoenix Squad"
  }
];

// Sample teams data for selection
const teamsData = [
  { id: "1", name: "Team Alpha" },
  { id: "2", name: "Team Bravo" },
  { id: "3", name: "Team Charlie" },
  { id: "4", name: "The Destroyers" },
  { id: "5", name: "Phoenix Squad" },
  { id: "6", name: "Ghost Gamers" },
  { id: "7", name: "Night Owls" },
  { id: "8", name: "Rebel Alliance" },
];

const UpdateWinners = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState(completedTournaments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentTournament, setCurrentTournament] = useState<any>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [secondPlace, setSecondPlace] = useState<string | null>(null);
  const [thirdPlace, setThirdPlace] = useState<string | null>(null);
  const [multipleWinners, setMultipleWinners] = useState(true);

  // Filter tournaments based on search
  const filteredTournaments = tournaments.filter(tournament => 
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tournament.game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateClick = (tournament: any) => {
    setCurrentTournament(tournament);
    setWinner(tournament.winner);
    setSecondPlace(tournament.secondPlace);
    setThirdPlace(tournament.thirdPlace);
    setMultipleWinners(tournament.secondPlace !== null || tournament.thirdPlace !== null);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateWinners = () => {
    if (!winner) {
      toast({
        title: "Error",
        description: "Please select at least a winner",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate selections
    const selections = [winner, secondPlace, thirdPlace].filter(Boolean);
    if (new Set(selections).size !== selections.length) {
      toast({
        title: "Error",
        description: "Each place must have a different team",
        variant: "destructive"
      });
      return;
    }

    // Update the tournament in our state
    const updatedTournaments = tournaments.map(t => {
      if (t.id === currentTournament.id) {
        return {
          ...t,
          winner: winner,
          secondPlace: multipleWinners ? secondPlace : null,
          thirdPlace: multipleWinners ? thirdPlace : null,
        };
      }
      return t;
    });

    setTournaments(updatedTournaments);
    setIsUpdateDialogOpen(false);

    // Show success message
    toast({
      title: "Winners Updated",
      description: `Winners for ${currentTournament.name} have been updated successfully.`,
    });

    // Here you would also update in your database, distribute coins, etc.
    console.log("Updating winners for tournament:", currentTournament.id, {
      winner,
      secondPlace: multipleWinners ? secondPlace : null,
      thirdPlace: multipleWinners ? thirdPlace : null,
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
        <h1 className="text-2xl font-bold text-white">Update Tournament Winners</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <InputWithIcon
          placeholder="Search tournaments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-esports-dark border-esports-accent/20 text-white"
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-esports-accent/20 rounded-full p-4 flex-shrink-0">
                      <Trophy className="h-8 w-8 text-esports-accent" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                        <Badge variant="outline" className="bg-esports-accent/10 text-esports-accent border-esports-accent/20">
                          {tournament.game}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{tournament.date}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>{tournament.teams} Teams</span>
                        </div>
                        <div className="text-sm text-yellow-500">
                          <span>{tournament.prizePool} rdCoins</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        {tournament.winner ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <span className="text-sm text-esports-accent mr-2">Winner:</span>
                              <span className="text-white">{tournament.winner}</span>
                            </div>
                            {tournament.secondPlace && (
                              <div className="flex items-center">
                                <span className="text-sm text-esports-accent mr-2">2nd Place:</span>
                                <span className="text-white">{tournament.secondPlace}</span>
                              </div>
                            )}
                            {tournament.thirdPlace && (
                              <div className="flex items-center">
                                <span className="text-sm text-esports-accent mr-2">3rd Place:</span>
                                <span className="text-white">{tournament.thirdPlace}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-none">
                            Winners Not Set
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-4 md:mt-0">
                    <Button
                      onClick={() => handleUpdateClick(tournament)}
                      className="bg-esports-accent hover:bg-esports-accent/80 text-white"
                    >
                      {tournament.winner ? "Update Winners" : "Set Winners"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No completed tournaments match your search.</p>
          </div>
        )}
      </div>

      {/* Update Winners Dialog */}
      {currentTournament && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle>Update Tournament Winners</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set winners for {currentTournament.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="multipleWinners"
                  checked={multipleWinners}
                  onChange={(e) => setMultipleWinners(e.target.checked)}
                  className="rounded bg-esports-darker border-esports-accent/20"
                />
                <Label htmlFor="multipleWinners">Distribute prize among top 3 teams</Label>
              </div>

              <div>
                <Label htmlFor="winner">Winner (1st Place)</Label>
                <Select value={winner || ""} onValueChange={setWinner}>
                  <SelectTrigger id="winner" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                    <SelectValue placeholder="Select winner team" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    <SelectItem value="">Select a team</SelectItem>
                    {teamsData.map(team => (
                      <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {multipleWinners && (
                <>
                  <div>
                    <Label htmlFor="secondPlace">2nd Place</Label>
                    <Select value={secondPlace || ""} onValueChange={setSecondPlace}>
                      <SelectTrigger id="secondPlace" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                        <SelectValue placeholder="Select 2nd place team" />
                      </SelectTrigger>
                      <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                        <SelectItem value="">Select a team</SelectItem>
                        {teamsData.map(team => (
                          <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="thirdPlace">3rd Place</Label>
                    <Select value={thirdPlace || ""} onValueChange={setThirdPlace}>
                      <SelectTrigger id="thirdPlace" className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                        <SelectValue placeholder="Select 3rd place team" />
                      </SelectTrigger>
                      <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                        <SelectItem value="">Select a team</SelectItem>
                        {teamsData.map(team => (
                          <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => setIsUpdateDialogOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateWinners}
                className="bg-esports-accent hover:bg-esports-accent/80 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                Update Winners
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default UpdateWinners;
