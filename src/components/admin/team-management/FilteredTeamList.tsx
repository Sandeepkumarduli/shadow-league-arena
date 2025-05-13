
import { Team } from "@/types/team";
import LoadingSpinner from "@/components/LoadingSpinner";
import TeamCard from "@/components/admin/TeamCard";

interface FilteredTeamListProps {
  teams: Team[];
  loading: boolean;
  gameFilter: string;
  statusFilter: string;
  searchQuery: string;
  onViewDetails: (teamId: string) => void;
  onToggleBan: (teamId: string) => void;
  onDelete: (teamId: string) => void;
}

const FilteredTeamList = ({
  teams,
  loading,
  gameFilter,
  statusFilter,
  searchQuery,
  onViewDetails,
  onToggleBan,
  onDelete
}: FilteredTeamListProps) => {
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (filteredTeams.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No teams match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTeams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onViewDetails={onViewDetails}
          onToggleBan={onToggleBan}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default FilteredTeamList;
