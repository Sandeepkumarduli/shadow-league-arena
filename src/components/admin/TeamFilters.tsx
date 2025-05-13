
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface TeamFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  gameFilter: string;
  onGameFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const TeamFilters = ({
  searchQuery,
  onSearchChange,
  gameFilter,
  onGameFilterChange,
  statusFilter,
  onStatusFilterChange
}: TeamFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <InputWithIcon
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-esports-dark border-esports-accent/20 text-white"
          icon={<Search className="h-4 w-4" />}
        />
      </div>
      <div>
        <Select
          value={gameFilter}
          onValueChange={onGameFilterChange}
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
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger className="bg-esports-dark border-esports-accent/20 text-white">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TeamFilters;
