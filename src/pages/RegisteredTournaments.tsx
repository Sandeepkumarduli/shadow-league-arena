
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TournamentCard from "@/components/TournamentCard";
import TournamentFilters from "@/components/TournamentFilters";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Award, Coins, CalendarCheck, Users, Trophy, Gamepad } from "lucide-react";

// Sample tournaments data
const registeredTournaments = [
  {
    id: "1",
    title: "BGMI Pro League Season 5",
    game: "BGMI",
    gameType: "Squad" as const,
    date: "May 18, 2025 • 8:00 PM",
    entryFee: "500",
    prizePool: "3,000",
    participants: { current: 64, max: 100 },
    status: "upcoming" as const,
    isRegistered: true,
    roomId: "",
    password: "",
  },
  {
    id: "2",
    title: "BGMI Weekend Cup",
    game: "BGMI",
    gameType: "Duo" as const,
    date: "Live Now",
    entryFee: "500",
    prizePool: "1,200",
    participants: { current: 98, max: 100 },
    status: "live" as const,
    isRegistered: true,
    roomId: "BGM45678",
    password: "winner2025",
  },
  {
    id: "3",
    title: "Valorant Championship Series",
    game: "Valorant",
    gameType: "Squad" as const,
    date: "May 15, 2025 • 7:00 PM",
    entryFee: "1000",
    prizePool: "2,500",
    participants: { current: 32, max: 32 },
    status: "upcoming" as const,
    isRegistered: true,
    roomId: "",
    password: "",
  },
  {
    id: "4",
    title: "COD Mobile Battle Royale",
    game: "COD",
    gameType: "Solo" as const,
    date: "Completed on May 10",
    entryFee: "800",
    prizePool: "1,800",
    participants: { current: 50, max: 50 },
    status: "completed" as const,
    isRegistered: true,
    roomId: "",
    password: "",
    position: 3,
  },
  {
    id: "5",
    title: "BGMI Solo Showdown",
    game: "BGMI",
    gameType: "Solo" as const,
    date: "May 22, 2025 • 9:00 PM",
    entryFee: "200",
    prizePool: "800",
    participants: { current: 120, max: 150 },
    status: "upcoming" as const,
    isRegistered: true,
    roomId: "",
    password: "",
  },
];

// Generate more tournaments for pagination example
const allTournaments = [
  ...registeredTournaments,
  ...Array(20).fill(0).map((_, i) => ({
    id: `extra-${i + 1}`,
    title: `Tournament ${i + 6}`,
    game: "BGMI",
    gameType: ["Solo", "Duo", "Squad"][i % 3] as "Solo" | "Duo" | "Squad",
    date: `May ${20 + i}, 2025 • ${7 + (i % 12)}:00 PM`,
    entryFee: `${(i + 2) * 100}`,
    prizePool: `${(i + 5) * 300}`,
    participants: { current: 30 + i, max: 100 },
    status: ["upcoming", "live", "completed"][i % 3] as "upcoming" | "live" | "completed",
    isRegistered: true,
    roomId: i % 3 === 1 ? `ROOM${1000 + i}` : "",
    password: i % 3 === 1 ? `pass${i}` : "",
    position: i % 3 === 2 ? (i % 10) + 1 : undefined,
  }))
];

const RegisteredTournaments = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [gameTypeFilter, setGameTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tournamentDetails, setTournamentDetails] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Handler for manual data refresh
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "Tournament data has been updated",
      });
    }, 1000);
  };

  // Filter tournaments based on selections
  const filteredTournaments = allTournaments.filter((tournament) => {
    if (statusFilter !== "all" && tournament.status !== statusFilter) return false;
    if (gameFilter !== "all" && tournament.game !== gameFilter) return false;
    if (gameTypeFilter !== "all" && tournament.gameType !== gameTypeFilter) return false;
    
    // Date filter (simplified for example purposes)
    if (dateFilter) {
      // Implement date filtering logic here
      // For demo purposes, we'll just return true
      return true;
    }
    
    return true;
  });

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredTournaments.length / ITEMS_PER_PAGE);
  const paginatedTournaments = filteredTournaments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleJoinLive = (tournamentId: string) => {
    // Get the tournament
    const tournament = allTournaments.find(t => t.id === tournamentId);
    
    if (tournament && tournament.status === "live") {
      if (tournament.roomId && tournament.password) {
        toast({
          title: "Joining Tournament",
          description: `Room ID: ${tournament.roomId}, Password: ${tournament.password}`,
        });
      } else {
        toast({
          title: "Room details not available",
          description: "The admin has not provided room details yet.",
          variant: "destructive",
        });
      }
    }
  };

  const handleShowDetails = (tournamentId: string) => {
    const tournament = allTournaments.find(t => t.id === tournamentId);
    
    if (tournament) {
      // Only show details for completed or upcoming tournaments
      if (tournament.status === "completed" || tournament.status === "upcoming") {
        setTournamentDetails(tournament);
        setDetailsOpen(true);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Registered Tournaments</h1>
            <p className="text-gray-400">View tournaments you have registered for</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-300 bg-esports-dark border-esports-accent/30 flex items-center gap-2"
            onClick={handleRefresh}
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <TournamentFilters 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          gameFilter={gameFilter}
          setGameFilter={setGameFilter}
          gameTypeFilter={gameTypeFilter}
          setGameTypeFilter={setGameTypeFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        {/* Tournament Cards */}
        {isLoading ? (
          <LoadingSpinner />
        ) : paginatedTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                id={tournament.id}
                title={tournament.title}
                game={tournament.game}
                gameType={tournament.gameType}
                date={tournament.date}
                entryFee={tournament.entryFee}
                prizePool={tournament.prizePool}
                participants={tournament.participants}
                status={tournament.status}
                isRegistered={tournament.isRegistered}
                roomId={tournament.roomId}
                password={tournament.password}
                position={tournament.position}
                onJoin={() => handleJoinLive(tournament.id)}
                onDetails={() => handleShowDetails(tournament.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">No tournaments match your filters.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredTournaments.length > ITEMS_PER_PAGE && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Show first, last, and pages around current page
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Tournament Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-esports-dark border-esports-accent/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                {tournamentDetails?.title}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                {tournamentDetails?.game} • {tournamentDetails?.gameType}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-esports-accent/10 p-4 rounded-md">
                {tournamentDetails?.status === "completed" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-esports-accent mr-2" />
                        <span className="text-white font-medium">Results</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={parseInt(String(tournamentDetails?.position)) <= 3 ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                      >
                        Position #{tournamentDetails?.position}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-esports-accent/20">
                      <div>
                        <p className="text-sm text-gray-400">Entry Fee</p>
                        <p className="text-white flex items-center">
                          <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                          {tournamentDetails?.entryFee} rdCoins
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Winnings</p>
                        <p className="text-white flex items-center">
                          {parseInt(String(tournamentDetails?.position)) <= 3 ? (
                            <>
                              <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                              {parseInt(String(tournamentDetails?.position)) === 1 
                                ? parseInt(tournamentDetails?.prizePool) * 0.5 
                                : parseInt(String(tournamentDetails?.position)) === 2
                                ? parseInt(tournamentDetails?.prizePool) * 0.3
                                : parseInt(tournamentDetails?.prizePool) * 0.1} rdCoins
                            </>
                          ) : (
                            <span className="text-gray-400">0 rdCoins</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center pt-2">
                      {parseInt(String(tournamentDetails?.position)) <= 3 ? (
                        <p className="text-green-400 font-medium">Congratulations on your win!</p>
                      ) : (
                        <p className="text-gray-400">Better luck next time!</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CalendarCheck className="h-5 w-5 text-esports-accent mr-2" />
                      <span className="text-white font-medium">Match Information</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-esports-accent/20">
                      <div>
                        <p className="text-sm text-gray-400">Date & Time</p>
                        <p className="text-white">{tournamentDetails?.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Entry Fee</p>
                        <p className="text-white flex items-center">
                          <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                          {tournamentDetails?.entryFee} rdCoins
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Prize Pool</p>
                        <p className="text-white flex items-center">
                          <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                          {tournamentDetails?.prizePool} rdCoins
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Registration Status</p>
                        <p className="text-green-400">Confirmed</p>
                      </div>
                    </div>
                    
                    <div className="text-center pt-2">
                      <p className="text-gray-300">Room details will be shared 15 minutes before the tournament starts.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => setDetailsOpen(false)}
                className="w-full bg-esports-accent hover:bg-esports-accent-hover"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Simple refresh icon component to avoid importing from lucide-react
const RefreshIcon = ({ className }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 2v6h-6"></path>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
      <path d="M3 22v-6h6"></path>
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
    </svg>
  );
};

export default RegisteredTournaments;
