
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash, Search, PlusCircle, CalendarCheck, Users, Trophy } from "lucide-react";
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

// Sample tournaments data
const tournaments = [
  {
    id: "1",
    title: "BGMI Pro League Season 5",
    game: "BGMI",
    gameType: "Squad",
    date: "May 18, 2025 • 8:00 PM",
    entryFee: "500",
    prizePool: "3,000",
    participants: {
      current: 64,
      max: 100
    },
    status: "upcoming"
  },
  {
    id: "2",
    title: "BGMI Weekend Cup",
    game: "BGMI",
    gameType: "Duo",
    date: "Live Now",
    entryFee: "500",
    prizePool: "1,200",
    participants: {
      current: 98,
      max: 100
    },
    status: "live",
    roomId: "BGM45678",
    password: "winner2025"
  },
  {
    id: "3",
    title: "Valorant Championship Series",
    game: "Valorant",
    gameType: "Squad",
    date: "May 15, 2025 • 7:00 PM",
    entryFee: "1000",
    prizePool: "2,500",
    participants: {
      current: 32,
      max: 32
    },
    status: "upcoming"
  },
  {
    id: "4",
    title: "COD Mobile Battle Royale",
    game: "COD",
    gameType: "Solo",
    date: "Completed on May 10",
    entryFee: "800",
    prizePool: "1,800",
    participants: {
      current: 50,
      max: 50
    },
    status: "completed"
  }
];

const AdminTournaments = () => {
  const navigate = useNavigate();
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tournamentToDelete, setTournamentToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Filter tournaments based on selections
  const filteredTournaments = tournaments.filter(tournament => {
    // Apply game filter
    if (gameFilter !== "all" && tournament.game !== gameFilter) return false;
    
    // Apply status filter
    if (statusFilter !== "all" && tournament.status !== statusFilter) return false;
    
    // Apply search query
    if (searchQuery && !tournament.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  const handleCreateTournament = () => {
    navigate("/admin/create-tournament");
  };
  
  const handleEditTournament = (tournamentId: string) => {
    // In a real application, this would navigate to an edit page with the tournament ID
    toast({
      title: "Edit Tournament",
      description: `Editing tournament ID: ${tournamentId}`,
    });
  };
  
  const handleDeleteTournament = (tournamentId: string) => {
    setTournamentToDelete(tournamentId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (!tournamentToDelete) return;
    
    // In a real application, this would be an API call to delete the tournament
    toast({
      title: "Tournament Deleted",
      description: "The tournament has been successfully deleted.",
    });
    
    setIsDeleteDialogOpen(false);
    setTournamentToDelete(null);
    // In a real app, you would update the state or refetch the data
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                      <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                        {tournament.gameType}
                      </Badge>
                      <Badge variant="outline" className={`
                        ${tournament.status === 'live' ? 'bg-esports-green/20 text-esports-green' : tournament.status === 'upcoming' ? 'bg-amber-400/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'} 
                        border-none
                      `}>
                        {tournament.status === "live" && <span className="mr-1.5 w-2 h-2 bg-esports-green rounded-full inline-block animate-pulse"></span>}
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold font-rajdhani mb-4 text-white">
                      {tournament.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <CalendarCheck className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>{tournament.date}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300">
                        <Users className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>{tournament.participants.current} / {tournament.participants.max} slots</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300">
                        <Trophy className="h-4 w-4 mr-2 text-esports-accent" />
                        <span>Prize pool: {tournament.prizePool} rdCoins</span>
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
