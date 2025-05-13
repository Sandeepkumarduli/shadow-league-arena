
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, Clock, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Team {
  id: string;
  name: string;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  start_date: string;
  max_teams: number;
  status: string;
  team?: string;
  team_id?: string;
  registration_status?: string;
  room_id?: string;
  room_password?: string;
}

const RegisteredTournaments = () => {
  const { user } = useAuth();

  // Use React Query for efficient data fetching
  const { data: userTeams = [], isLoading: isTeamsLoading } = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('owner_id', user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
  
  const { data: tournaments = [], isLoading: isTournamentsLoading } = useQuery({
    queryKey: ['registered-tournaments', userTeams],
    queryFn: async () => {
      if (!user || userTeams.length === 0) return [];
      
      const teamIds = userTeams.map((team: Team) => team.id);
      const registrations = [];
      
      for (const teamId of teamIds) {
        const { data, error } = await supabase
          .from('tournament_registrations')
          .select(`
            id,
            status,
            team_id,
            tournament:tournaments(
              id,
              name,
              game,
              start_date,
              max_teams,
              status,
              room_id,
              room_password
            )
          `)
          .eq('team_id', teamId);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          registrations.push(...data);
        }
      }
      
      const formattedTournaments = registrations.map((reg) => {
        const team = userTeams.find((t: Team) => t.id === reg.team_id);
        return {
          ...reg.tournament,
          team: team?.name || "Unknown Team",
          team_id: reg.team_id,
          registration_status: reg.status
        };
      });
      
      return formattedTournaments;
    },
    enabled: userTeams.length > 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-500';
      case 'live':
        return 'bg-green-500/20 text-green-500';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  const handleShowRoomDetails = (tournament: Tournament) => {
    if (!tournament.room_id || !tournament.room_password) {
      toast({
        title: "Room Details Not Available",
        description: "The organizer hasn't provided room details yet.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Room Details",
      description: (
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Room ID:</span> {tournament.room_id}
          </div>
          <div>
            <span className="font-semibold">Password:</span> {tournament.room_password}
          </div>
        </div>
      ),
    });
  };

  const isLoading = isTeamsLoading || isTournamentsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Registered Tournaments</h1>
          <p className="text-gray-400">View all tournaments you have registered for</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-esports-dark border border-esports-accent/20 rounded-lg overflow-hidden">
                <div className="p-4">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-7 w-full mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center p-8 bg-esports-dark rounded-lg border border-esports-accent/20">
            <h3 className="text-lg font-medium text-white mb-2">No Tournaments Found</h3>
            <p className="text-gray-400 mb-6">You haven't registered for any tournaments yet.</p>
            <Button asChild>
              <Link to="/tournaments">Browse Tournaments</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div 
                key={`${tournament.id}-${tournament.team_id}`} 
                className="bg-esports-dark border border-esports-accent/20 rounded-lg overflow-hidden"
              >
                <div className="p-4 border-b border-esports-accent/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium 
                      ${tournament.registration_status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {tournament.registration_status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                  <p className="text-esports-accent font-medium">{tournament.game}</p>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(tournament.start_date).toLocaleDateString()} 
                      {" at "} 
                      {new Date(tournament.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Team: {tournament.team}</span>
                  </div>
                  
                  {tournament.status === 'live' && tournament.registration_status === 'confirmed' && (
                    <Button 
                      onClick={() => handleShowRoomDetails(tournament)}
                      className="w-full bg-esports-accent hover:bg-esports-accent/80"
                    >
                      Show Room Details
                    </Button>
                  )}
                  
                  {tournament.status === 'upcoming' && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Starts in {Math.max(0, Math.ceil((new Date(tournament.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days</span>
                    </div>
                  )}
                  
                  {tournament.status === 'completed' && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Trophy className="h-4 w-4" />
                      <span>Tournament completed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RegisteredTournaments;
