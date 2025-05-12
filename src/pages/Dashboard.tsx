
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Clock, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";

interface Tournament {
  id: string;
  name: string;
  game: string;
  start_date: string;
  status: string;
  max_teams: number;
}

interface TeamData {
  id: string;
  name: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [userTeams, setUserTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // Fetch upcoming tournaments
        const { data: tournaments, error: tournamentError } = await supabase
          .from('tournaments')
          .select('*')
          .eq('status', 'upcoming')
          .order('start_date', { ascending: true })
          .limit(5);
        
        if (tournamentError) {
          console.error("Error fetching tournaments:", tournamentError);
        } else {
          setUpcomingTournaments(tournaments || []);
        }
        
        // Fetch user's teams
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('id, name')
          .eq('owner_id', user.id);
        
        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
        } else {
          setUserTeams(teams || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Empty activity data - would be populated from real data in a production app
  const activityData = [];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
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
          {/* Welcome Message */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Welcome, {user?.user_metadata?.username || 'Player'}</h1>
            <p className="text-gray-400">Manage your tournaments and teams all in one place</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">My Teams</p>
                  <h3 className="text-2xl font-bold text-white">{userTeams.length}</h3>
                </div>
                <div className="h-10 w-10 bg-esports-accent/20 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-esports-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tournaments Played</p>
                  <h3 className="text-2xl font-bold text-white">0</h3>
                </div>
                <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Upcoming Tournaments</p>
                  <h3 className="text-2xl font-bold text-white">{upcomingTournaments.length}</h3>
                </div>
                <div className="h-10 w-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tournaments Won</p>
                  <h3 className="text-2xl font-bold text-white">0</h3>
                </div>
                <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Upcoming Tournaments */}
              <Card className="bg-esports-dark border-esports-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Upcoming Tournaments</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-6 text-gray-500">Loading tournaments...</div>
                  ) : upcomingTournaments.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingTournaments.map((tournament) => (
                        <div
                          key={tournament.id}
                          className="flex items-center justify-between bg-esports-darker rounded-md p-3 hover:bg-esports-accent/10 cursor-pointer transition-colors"
                          onClick={() => navigate(`/tournaments`)}
                        >
                          <div className="flex items-center">
                            <div className="bg-esports-accent/20 rounded-full p-2 mr-4">
                              <Trophy className="h-5 w-5 text-esports-accent" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{tournament.name}</h4>
                              <p className="text-xs text-gray-400">{tournament.game}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 text-esports-accent mr-1" />
                              <span className="text-xs text-gray-400">{formatDate(tournament.start_date)}</span>
                            </div>
                            <div className="text-xs bg-yellow-700/20 text-yellow-400 px-2 py-0.5 rounded mt-1">
                              {tournament.max_teams} Teams Max
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">No upcoming tournaments found</div>
                  )}
                </CardContent>
              </Card>
              
              {/* Activity Chart */}
              <Card className="bg-esports-dark border-esports-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Activity Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {activityData.length > 0 ? (
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af' }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9ca3af' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a1c23', border: 'none' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {activityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill="#1977d4" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                      <p>No activity data to display yet</p>
                      <p className="text-sm mt-2">Join tournaments to see your activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* My Teams */}
              <Card className="bg-esports-dark border-esports-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">My Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-6 text-gray-500">Loading teams...</div>
                  ) : userTeams.length > 0 ? (
                    <div className="space-y-2">
                      {userTeams.map((team) => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between bg-esports-darker rounded-md p-3 hover:bg-esports-accent/10 cursor-pointer transition-colors"
                          onClick={() => navigate('/my-teams')}
                        >
                          <div className="flex items-center">
                            <div className="bg-green-500/20 rounded-full p-2 mr-4">
                              <Users className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{team.name}</h4>
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-gray-500" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No teams created yet</p>
                      <p className="text-sm mt-2">Visit My Teams to create one</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Quick Links */}
              <Card className="bg-esports-dark border-esports-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      className="flex flex-col items-center justify-center bg-esports-darker rounded-md p-4 hover:bg-esports-accent/10 cursor-pointer transition-colors"
                      onClick={() => navigate('/tournaments')}
                    >
                      <div className="bg-esports-accent/20 rounded-full p-2 mb-2">
                        <Trophy className="h-5 w-5 text-esports-accent" />
                      </div>
                      <span className="text-sm text-white">Browse Tournaments</span>
                    </div>
                    
                    <div 
                      className="flex flex-col items-center justify-center bg-esports-darker rounded-md p-4 hover:bg-esports-accent/10 cursor-pointer transition-colors"
                      onClick={() => navigate('/my-teams')}
                    >
                      <div className="bg-green-500/20 rounded-full p-2 mb-2">
                        <Users className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="text-sm text-white">Create Team</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
