
import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Edit, 
  Trash2, 
  PlusCircle, 
  Search, 
  ArrowLeft, 
  Check, 
  X, 
  Calendar, 
  Flag
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Tournament } from "@/types/tournament";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import RefreshButton from "@/components/RefreshButton";

export default function AdminTournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Form data for editing tournament
  const [formData, setFormData] = useState({
    name: "",
    game: "",
    description: "",
    max_teams: 0,
    prize_pool: 0,
    entry_fee: 0,
    start_date: "",
    end_date: "",
    status: "",
  });

  // Fetch tournaments
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      let query = supabase.from("tournaments").select("*");
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTournaments(data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      toast({
        title: "Failed to load tournaments",
        description: "There was an error loading the tournament data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:tournaments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          console.log("Tournaments table updated, refreshing data");
          fetchTournaments();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter tournaments
  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.game.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus =
      statusFilter === "all" || tournament.status === statusFilter;
      
    const matchesGame =
      gameFilter === "all" || tournament.game.toLowerCase() === gameFilter.toLowerCase();
      
    return matchesSearch && matchesStatus && matchesGame;
  });

  // Get unique game names for filter
  const uniqueGames = Array.from(
    new Set(tournaments.map((tournament) => tournament.game))
  );

  // Handle edit tournament
  const handleEditClick = (tournament: Tournament) => {
    setCurrentTournament(tournament);
    setFormData({
      name: tournament.name,
      game: tournament.game,
      description: tournament.description || "",
      max_teams: tournament.max_teams,
      prize_pool: tournament.prize_pool,
      entry_fee: tournament.entry_fee || 0,
      start_date: tournament.start_date,
      end_date: tournament.end_date || "",
      status: tournament.status,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete tournament click
  const handleDeleteClick = (tournament: Tournament) => {
    setCurrentTournament(tournament);
    setIsDeleteDialogOpen(true);
  };

  // Handle status change click
  const handleStatusClick = (tournament: Tournament) => {
    setCurrentTournament(tournament);
    setNewStatus(tournament.status);
    setIsStatusDialogOpen(true);
  };

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "max_teams" || name === "prize_pool" || name === "entry_fee" ? parseInt(value) : value,
    }));
  };

  // Save tournament changes
  const handleSaveTournament = async () => {
    if (!currentTournament) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("tournaments")
        .update({
          name: formData.name,
          game: formData.game,
          description: formData.description,
          max_teams: formData.max_teams,
          prize_pool: formData.prize_pool,
          entry_fee: formData.entry_fee,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentTournament.id);
        
      if (error) throw error;
      
      toast({
        title: "Tournament Updated",
        description: `${formData.name} has been updated successfully.`,
      });
      
      setIsEditDialogOpen(false);
      fetchTournaments();
    } catch (error) {
      console.error("Error updating tournament:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the tournament.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete tournament
  const handleDeleteTournament = async () => {
    if (!currentTournament) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", currentTournament.id);
        
      if (error) throw error;
      
      toast({
        title: "Tournament Deleted",
        description: `${currentTournament.name} has been deleted successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      fetchTournaments();
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the tournament.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update tournament status
  const handleUpdateStatus = async () => {
    if (!currentTournament || newStatus === currentTournament.status) return;
    
    setIsSubmitting(true);
    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      
      // If changing to completed, set end_date to now if not already set
      if (newStatus === "completed" && !currentTournament.end_date) {
        updates.end_date = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from("tournaments")
        .update(updates)
        .eq("id", currentTournament.id);
        
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `${currentTournament.name} is now ${newStatus}.`,
      });
      
      setIsStatusDialogOpen(false);
      fetchTournaments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the tournament status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "bg-blue-500/20 text-blue-500";
      case "live":
        return "bg-green-500/20 text-green-500";
      case "completed":
        return "bg-gray-500/20 text-gray-500";
      case "cancelled":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
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
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
        </div>
        <div className="flex gap-2">
          <RefreshButton onRefresh={fetchTournaments} />
          <Button
            onClick={() => navigate("/admin/create-tournament")}
            className="bg-esports-accent hover:bg-esports-accent/80 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tournament
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-esports-dark border-esports-accent/20 mb-6">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-white">Filter Tournaments</CardTitle>
          <CardDescription>Narrow down results by search, status, or game</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-gray-300">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or game..."
                  className="pl-10 bg-esports-darker border-esports-accent/20 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  id="status" 
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="game" className="text-gray-300">Game</Label>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger 
                  id="game" 
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                >
                  <SelectValue placeholder="Filter by game" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  <SelectItem value="all">All Games</SelectItem>
                  {uniqueGames.map((game) => (
                    <SelectItem key={game} value={game}>
                      {game}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournaments Table */}
      <Card className="bg-esports-dark border-esports-accent/20">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredTournaments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-700">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Game</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Prize Pool</TableHead>
                    <TableHead className="text-gray-400">Teams</TableHead>
                    <TableHead className="text-gray-400">Start Date</TableHead>
                    <TableHead className="text-gray-400">End Date</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTournaments.map((tournament) => (
                    <TableRow key={tournament.id} className="border-b border-gray-700">
                      <TableCell className="font-medium text-white">
                        {tournament.name}
                      </TableCell>
                      <TableCell>{tournament.game}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(tournament.status)} font-normal cursor-pointer`}
                          onClick={() => handleStatusClick(tournament)}
                        >
                          {tournament.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tournament.prize_pool} rdCoins</TableCell>
                      <TableCell>{tournament.max_teams}</TableCell>
                      <TableCell>{formatDate(tournament.start_date)}</TableCell>
                      <TableCell>{formatDate(tournament.end_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(tournament)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit tournament</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(tournament)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete tournament</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No tournaments found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Tournament Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20 max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update tournament details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Tournament Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-esports-darker border-esports-accent/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="game" className="text-white">Game</Label>
                <Input
                  id="game"
                  name="game"
                  value={formData.game}
                  onChange={handleInputChange}
                  className="bg-esports-darker border-esports-accent/20 text-white"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-esports-darker border-esports-accent/20 text-white min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_teams" className="text-white">Maximum Teams</Label>
                <Input
                  id="max_teams"
                  name="max_teams"
                  type="number"
                  min="1"
                  value={formData.max_teams}
                  onChange={handleInputChange}
                  className="bg-esports-darker border-esports-accent/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prize_pool" className="text-white">Prize Pool (rdCoins)</Label>
                <Input
                  id="prize_pool"
                  name="prize_pool"
                  type="number"
                  min="0"
                  value={formData.prize_pool}
                  onChange={handleInputChange}
                  className="bg-esports-darker border-esports-accent/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="entry_fee" className="text-white">Entry Fee (rdCoins)</Label>
                <Input
                  id="entry_fee"
                  name="entry_fee"
                  type="number"
                  min="0"
                  value={formData.entry_fee}
                  onChange={handleInputChange}
                  className="bg-esports-darker border-esports-accent/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger 
                    id="status" 
                    className="bg-esports-darker border-esports-accent/20 text-white"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-white">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date ? formData.start_date.slice(0, 16) : ""}
                  onChange={handleInputChange}
                  className="bg-esports-darker border-esports-accent/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-white">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date ? formData.end_date.slice(0, 16) : ""}
                  onChange={handleInputChange}
                  className="bg-esports-darker border-esports-accent/20 text-white"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTournament}
              className="bg-esports-accent hover:bg-esports-accent/80"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the tournament{" "}
              <span className="font-semibold text-white">
                {currentTournament?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-transparent text-white hover:bg-esports-darker"
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteTournament();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Update Tournament Status</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the status of {currentTournament?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="newStatus" className="text-white">Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger 
                id="newStatus" 
                className="bg-esports-darker border-esports-accent/20 text-white mt-1"
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                <SelectItem value="upcoming">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Upcoming</span>
                  </div>
                </SelectItem>
                <SelectItem value="live">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Live</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gray-500" />
                    <span>Completed</span>
                  </div>
                </SelectItem>
                <SelectItem value="cancelled">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    <span>Cancelled</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {newStatus === "completed" && !currentTournament?.winner && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full border-[#1977d4]/30 text-white hover:text-[#1977d4]"
                  onClick={() => {
                    setIsStatusDialogOpen(false);
                    navigate(`/admin/update-winners?tournament=${currentTournament?.id}`);
                  }}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Set Tournament Winners
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsStatusDialogOpen(false)}
              className="text-white"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              className="bg-esports-accent hover:bg-esports-accent/80"
              disabled={isSubmitting || newStatus === currentTournament?.status}
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
