
import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarCheck, ChevronDown, Filter, Gamepad, Trophy, Users, Award, CheckCircle } from "lucide-react";
import TournamentFilters from "@/components/TournamentFilters";

// Sample tournaments data
const registeredTournaments = [{
  id: "1",
  title: "BGMI Pro League Season 5",
  game: "BGMI",
  gameType: "Squad" as const,
  date: "May 18, 2025 • 8:00 PM",
  entryFee: "500",
  prizePool: "3,000",
  participants: {
    current: 64,
    max: 100
  },
  status: "upcoming" as const,
  roomId: "",
  password: ""
}, {
  id: "2",
  title: "BGMI Weekend Cup",
  game: "BGMI",
  gameType: "Duo" as const,
  date: "Live Now",
  entryFee: "500",
  prizePool: "1,200",
  participants: {
    current: 98,
    max: 100
  },
  status: "live" as const,
  roomId: "BGM45678",
  password: "winner2025"
}, {
  id: "3",
  title: "Valorant Championship Series",
  game: "Valorant",
  gameType: "Squad" as const,
  date: "May 15, 2025 • 7:00 PM",
  entryFee: "1000",
  prizePool: "2,500",
  participants: {
    current: 32,
    max: 32
  },
  status: "upcoming" as const,
  roomId: "",
  password: ""
}, {
  id: "4",
  title: "COD Mobile Battle Royale",
  game: "COD",
  gameType: "Solo" as const,
  date: "Completed on May 10",
  entryFee: "800",
  prizePool: "1,800",
  participants: {
    current: 50,
    max: 50
  },
  status: "completed" as const,
  roomId: "",
  password: "",
  position: 3
}];

// Sample teams data
const myTeams = [{
  id: "1",
  name: "Phoenix Rising",
  game: "BGMI",
  members: 4,
  tournaments: 12,
  wins: 3
}, {
  id: "2",
  name: "Valorant Vipers",
  game: "Valorant",
  members: 5,
  tournaments: 8,
  wins: 2
}];

// User stats
const userStats = {
  registeredTournaments: 20,
  completedTournaments: 15,
  totalTournaments: 35,
  wins: 4
};
const Dashboard = () => {
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter tournaments based on selections and limit to 10 most recent
  const filteredTournaments = registeredTournaments
    .filter(tournament => {
      if (gameFilter !== "all" && tournament.game !== gameFilter) return false;
      if (statusFilter !== "all" && tournament.status !== statusFilter) return false;
      return true;
    })
    .slice(0, 10); // Limit to 10 tournaments
    
  return <DashboardLayout>
      <div className="space-y-8">
        {/* User Profile Section */}
        <div className="bg-esports-dark rounded-xl p-6">
          <div className="flex items-center gap-5">
            <div className="bg-esports-accent/20 rounded-full p-4">
              <Users className="h-8 w-8 text-esports-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SniperElite48</h1>
              <div className="flex items-center mt-1">
                <span className="text-gray-400">Game ID:</span>
                <span className="text-white ml-2">BGMI5628974</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <CalendarCheck className="h-5 w-5 mr-2 text-esports-accent" />
                <CardTitle className="text-white text-lg">Registered</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-esports-accent">{userStats.registeredTournaments}</div>
              <p className="text-gray-400 text-sm mt-1">Tournaments</p>
            </CardContent>
          </Card>
          
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-esports-accent" />
                <CardTitle className="text-white text-lg">Completed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-esports-accent">{userStats.completedTournaments}</div>
              <p className="text-gray-400 text-sm mt-1">Tournaments</p>
            </CardContent>
          </Card>
          
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Gamepad className="h-5 w-5 mr-2 text-esports-accent" />
                <CardTitle className="text-white text-lg">Total</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-esports-accent">{userStats.totalTournaments}</div>
              <p className="text-gray-400 text-sm mt-1">Tournaments</p>
            </CardContent>
          </Card>
          
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-esports-accent" />
                <CardTitle className="text-white text-lg">Wins</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-esports-accent">{userStats.wins}</div>
              <p className="text-gray-400 text-sm mt-1">Tournaments</p>
            </CardContent>
          </Card>
        </div>

        {/* My Teams Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">My Teams</h2>
            <Button variant="outline" className="border-esports-accent text-white hover:bg-esports-accent/10" asChild>
              <Link to="/my-teams">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTeams.map(team => <Card key={team.id} className="bg-esports-dark border-esports-accent/20">
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                      {team.game}
                    </Badge>
                  </div>
                  <CardTitle className="text-white mt-2">{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-esports-accent font-bold">{team.members}</div>
                      <div className="text-gray-400 text-xs">Members</div>
                    </div>
                    <div>
                      <div className="text-esports-accent font-bold">{team.tournaments}</div>
                      <div className="text-gray-400 text-xs">Tournaments</div>
                    </div>
                    <div>
                      <div className="text-esports-accent font-bold">{team.wins}</div>
                      <div className="text-gray-400 text-xs">Wins</div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Registered Tournaments Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Registered Tournaments</h2>
            <Button variant="outline" className="border-esports-accent text-white hover:bg-esports-accent/10" asChild>
              <Link to="/registered-tournaments">View All</Link>
            </Button>
          </div>

          {/* Filters */}
          <TournamentFilters statusFilter={statusFilter} setStatusFilter={setStatusFilter} gameFilter={gameFilter} setGameFilter={setGameFilter} />

          {/* Tournament Cards */}
          <div className="space-y-4">
            {filteredTournaments.map(tournament => <Card key={tournament.id} className="bg-esports-dark border-esports-accent/20">
                <div className="p-5">
                  {/* Tournament Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                        {tournament.game}
                      </Badge>
                      <Badge variant="outline" className="bg-esports-dark/80 text-white border-esports-accent/30">
                        {tournament.gameType}
                      </Badge>
                    </div>
                    
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
                  
                  {/* Tournament Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
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
                    
                    {/* Room Details (only for live tournaments) */}
                    {tournament.status === 'live' && <div className="bg-esports-accent/10 p-3 rounded-md">
                        <div className="text-esports-accent font-medium mb-2">Room Details</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs text-gray-400">Room ID</div>
                            <div className="text-white font-mono">{tournament.roomId}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Password</div>
                            <div className="text-white font-mono">{tournament.password}</div>
                          </div>
                        </div>
                      </div>}
                    
                    {/* Completed Tournament Result */}
                    {tournament.status === 'completed' && tournament.position && <div className="bg-esports-accent/10 p-3 rounded-md">
                        <div className="text-esports-accent font-medium mb-2">Results</div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-esports-accent" />
                          <span className="text-white">Position: #{tournament.position}</span>
                        </div>
                      </div>}
                  </div>
                </div>
              </Card>)}
              
              {filteredTournaments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No tournaments match your filters.</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>;
};
export default Dashboard;
