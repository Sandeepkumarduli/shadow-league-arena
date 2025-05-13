
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Search, 
  PlusCircle, 
  CalendarCheck, 
  Users, 
  Trophy,
  Calendar,
  Filter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { fetchTournaments, deleteTournament, updateTournament } from "@/services/tournamentService";
import { Tournament } from "@/types/tournament";
import LoadingSpinner from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";

const AdminTournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  const [tournamentToDelete, setTournamentToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [distributeToTopThree, setDistributeToTopThree] = useState(false);

  // Fetch tournaments from database
  const loadTournaments = async () => {
    setLoading(true);
    try {
      const data = await fetchTournaments();
      setTournaments(data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast({
        title: "Failed to load tournaments",
        description: "There was a problem fetching tournament data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTournaments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:tournaments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          loadTournaments();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filter tournaments based on selections
  const filteredTournaments = tournaments.filter(tournament => {
    // Apply game filter
    if (gameFilter !== "all" && tournament.game !== gameFilter) return false;
    
    // Apply status filter
    if (statusFilter !== "all" && tournament.status !== statusFilter) return false;
    
    // Apply search query
    if (searchQuery && !tournament.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Apply date filter
    if (dateFilter && tournament.start_date) {
      const tournamentDate = new Date(tournament.start_date);
      if (
        tournamentDate.getDate() !== dateFilter.getDate() ||
        tournamentDate.getMonth() !== dateFilter.getMonth() ||
        tournamentDate.getFullYear() !== dateFilter.getFullYear()
      ) {
        return false;
      }
    }
    
    return true;
  });

  const handleCreateTournament = () => {
    navigate("/admin/create-tournament");
  };
  
  const handleEditTournament = (tournamentId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (tournament) {
      setSelectedTournament({...tournament});
      setDistributeToTopThree(tournament.secondPlace !== undefined || tournament.thirdPlace !== undefined);
      setIsEditDialogOpen(true);
    }
  };
  
  const handleSaveEdit = async () => {
    if (!selectedTournament) return;
    
    try {
      await updateTournament(selectedTournament);
      
      toast({
        title: "Tournament Updated",
        description: `Tournament "${selectedTournament.name}" has been updated.`,
      });
      
      setIsEditDialogOpen(false);
      loadTournaments();
    } catch (error) {
      console.error("Error updating tournament:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating the tournament.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteTournament = (tournamentId: string) => {
    setTournamentToDelete(tournamentId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!tournamentToDelete) return;
    
    try {
      await deleteTournament(tournamentToDelete);
      
      toast({
        title: "Tournament Deleted",
        description: "The tournament has been successfully deleted.",
      });
      
      setTournaments(tournaments.filter(tournament => tournament.id !== tournamentToDelete));
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast({
        title: "Delete Failed",
        description: "There was a problem deleting the tournament.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setTournamentToDelete(null);
    }
  };
  
  const handleInputChange = (field: string, value: any) => {
    if (!selectedTournament) return;
    
    setSelectedTournament({
      ...selectedTournament,
      [field]: value
    });
  };

  // Function to format the date for display
  const formatDisplayDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return date; // Return original if invalid
      }
      
      const now = new Date();
      const tournamentDate = new Date(date);
      
      // Check if tournament is live (today)
      if (tournamentDate.toDateString() === now.toDateString()) {
        return "Live Now";
      }
      
      // Check if tournament is completed (past)
      if (tournamentDate < now) {
        return `Completed on ${format(tournamentDate, "MMM d")}`;
      }
      
      // Future tournament
      return format(dateObj, "MMM d, yyyy • h:mm a");
    } catch (error) {
      return date;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Manage Tournaments</h1>
        </div>
        
        <Button 
          onClick={handleCreateTournament}
          className="bg-esports-accent hover:bg-esports-accent/80 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Tournament
        </Button>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <InputWithIcon
            placeholder="Search tournaments..."
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
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-esports-accent/20 bg-esports-dark text-white",
                  !dateFilter && "text-gray-400"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : "Filter by Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-esports-dark border-esports-accent/20">
              <CalendarComponent
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
                className="bg-esports-dark text-white"
              />
              {dateFilter && (
                <div className="p-3 border-t border-esports-accent/20">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setDateFilter(undefined)}
                    className="w-full text-white"
                  >
                    Clear Date Filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Tournament List */}
      <div className="space-y-4">
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                        {tournament.game}
                      </Badge>
                      <Badge variant="outline" className={`
                        ${tournament.status === 'live' ? 'bg-esports-green/20 text-esports-green' : tournament.status === 'upcoming' ? 'bg-amber-400/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'} 
                        border-none
                      `}>
                        {tournament.status === "live" && <span className="mr-1.5 w-2 h-2 bg-esports-green rounded-full inline-block animate-pulse"></span>}
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={`
                        ${!tournament.entry_fee || tournament.entry_fee === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'} 
                        border-none
                      `}>
                        {!tournament.entry_fee || tournament.entry_fee === 0 ? "Free Entry" : `${tournament.entry_fee} rdCoins`}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold font-rajdhani mb-4 text-white">
                      {tournament.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <CalendarCheck className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>{formatDisplayDate(tournament.start_date)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300">
                        <Users className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>0 / {tournament.max_teams} slots</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300">
                        <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Prize pool: {tournament.prize_pool} rdCoins</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
                      onClick={() => handleEditTournament(tournament.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-900/20 hover:bg-red-900/40 text-red-500"
                      onClick={() => handleDeleteTournament(tournament.id)}
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
            <p className="text-gray-400">No tournaments match your filters.</p>
          </div>
        )}
      </div>
      
      {/* Edit Tournament Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedTournament && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20 max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Tournament</DialogTitle>
              <DialogDescription className="text-gray-400">
                Make changes to the tournament details below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-white">Tournament Title</Label>
                <Input
                  id="title"
                  value={selectedTournament.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="game" className="text-white">Game</Label>
                <Select
                  value={selectedTournament.game}
                  onValueChange={(value) => handleInputChange("game", value)}
                >
                  <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white mt-1">
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
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select
                  value={selectedTournament.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date" className="text-white">Start Date</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={selectedTournament.start_date ? new Date(selectedTournament.start_date).toISOString().slice(0, 16) : ""}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="entryFeeType" className="text-white">Entry Fee (rdCoins)</Label>
                <Input
                  id="entryFee"
                  type="number"
                  value={selectedTournament.entry_fee || 0}
                  onChange={(e) => handleInputChange("entry_fee", parseInt(e.target.value) || 0)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="prizePool" className="text-white">Prize Pool (rdCoins)</Label>
                <Input
                  id="prizePool"
                  type="number"
                  value={selectedTournament.prize_pool || 0}
                  onChange={(e) => handleInputChange("prize_pool", parseInt(e.target.value) || 0)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="maxSlots" className="text-white">Max Slots</Label>
                <Input
                  id="maxSlots"
                  type="number"
                  value={selectedTournament.max_teams}
                  onChange={(e) => handleInputChange("max_teams", parseInt(e.target.value) || 0)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="distributeToTopThree" 
                    checked={distributeToTopThree}
                    onCheckedChange={(checked) => {
                      setDistributeToTopThree(checked === true);
                      if (checked) {
                        // Set default values for prize distribution
                        const total = selectedTournament.prize_pool || 0;
                        handleInputChange("firstPlace", Math.round(total * 0.5));
                        handleInputChange("secondPlace", Math.round(total * 0.3));
                        handleInputChange("thirdPlace", Math.round(total * 0.2));
                      } else {
                        // If unchecked, remove second and third place prizes
                        handleInputChange("secondPlace", undefined);
                        handleInputChange("thirdPlace", undefined);
                        handleInputChange("firstPlace", selectedTournament.prize_pool);
                      }
                    }}
                  />
                  <Label 
                    htmlFor="distributeToTopThree"
                    className="text-white font-medium"
                  >
                    Distribute prize among top 3 teams
                  </Label>
                </div>
                <p className="mt-1 text-sm text-gray-400 ml-6">
                  If unchecked, all prize money goes to the winner
                </p>
              </div>
              
              {distributeToTopThree && (
                <div className="col-span-1 md:col-span-2">
                  <Card className="bg-esports-darker border-esports-accent/20 p-4">
                    <h3 className="text-white font-semibold mb-4">Prize Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="firstPlacePrize" className="text-white">1st Place (rdCoins)</Label>
                        <Input
                          id="firstPlacePrize"
                          type="number"
                          value={selectedTournament.firstPlace || ""}
                          onChange={(e) => handleInputChange("firstPlace", parseInt(e.target.value) || 0)}
                          className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="secondPlacePrize" className="text-white">2nd Place (rdCoins)</Label>
                        <Input
                          id="secondPlacePrize"
                          type="number"
                          value={selectedTournament.secondPlace || ""}
                          onChange={(e) => handleInputChange("secondPlace", parseInt(e.target.value) || 0)}
                          className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="thirdPlacePrize" className="text-white">3rd Place (rdCoins)</Label>
                        <Input
                          id="thirdPlacePrize"
                          type="number"
                          value={selectedTournament.thirdPlace || ""}
                          onChange={(e) => handleInputChange("thirdPlace", parseInt(e.target.value) || 0)}
                          className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSaveEdit}
                className="bg-esports-accent hover:bg-esports-accent/80"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this tournament? This action cannot be undone.
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
              Delete Tournament
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminTournaments;
