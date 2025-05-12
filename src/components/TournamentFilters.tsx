
import { useState } from "react";
import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TournamentFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  gameFilter: string;
  setGameFilter: (value: string) => void;
  gameTypeFilter?: string;
  setGameTypeFilter?: (value: string) => void;
  showCompletedFilter?: boolean;
}

// Game options with coming soon status
const gameOptions = [
  { value: "all", label: "All Games" },
  { value: "BGMI", label: "BGMI", available: true },
  { value: "COD", label: "COD", available: true },
  { value: "Valorant", label: "Valorant", available: true },
  { value: "Free Fire", label: "Free Fire", available: false },
  { value: "Fortnite", label: "Fortnite", available: false },
  { value: "League of Legends", label: "League of Legends", available: false },
];

// Game type options
const gameTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Solo", label: "Solo" },
  { value: "Duo", label: "Duo" },
  { value: "Squad", label: "Squad" },
];

const TournamentFilters = ({ 
  statusFilter, 
  setStatusFilter, 
  gameFilter, 
  setGameFilter,
  gameTypeFilter = "all",
  setGameTypeFilter,
  showCompletedFilter = true
}: TournamentFiltersProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <Collapsible
      open={isFiltersOpen}
      onOpenChange={setIsFiltersOpen}
      className="lg:block mb-6"
    >
      <div className="hidden lg:flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-esports-accent" />
          <span className="text-white font-medium">Filters:</span>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-esports-dark border-esports-accent/30 text-gray-300">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-esports-dark border-esports-accent/30">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            {showCompletedFilter && <SelectItem value="completed">Completed</SelectItem>}
          </SelectContent>
        </Select>
        
        <Select value={gameFilter} onValueChange={setGameFilter}>
          <SelectTrigger className="w-[180px] bg-esports-dark border-esports-accent/30 text-gray-300">
            <SelectValue placeholder="Game" />
          </SelectTrigger>
          <SelectContent className="bg-esports-dark border-esports-accent/30">
            {gameOptions.map((game) => (
              <SelectItem key={game.value} value={game.value} disabled={!game.available}>
                <div className="flex items-center justify-between w-full">
                  <span>{game.label}</span>
                  {!game.available && <span className="text-xs text-esports-accent ml-2">(Coming Soon)</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {setGameTypeFilter && (
          <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
            <SelectTrigger className="w-[180px] bg-esports-dark border-esports-accent/30 text-gray-300">
              <SelectValue placeholder="Game Type" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/30">
              {gameTypeOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Mobile filters */}
      <div className="lg:hidden flex justify-end mb-4">
        <CollapsibleTrigger className="px-3 py-1.5 text-sm bg-esports-dark border border-esports-accent/30 rounded-md text-gray-300 flex items-center gap-2">
          <Filter className="h-4 w-4 text-esports-accent" />
          Filters
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="lg:hidden space-y-4 mb-6 bg-esports-dark/60 p-4 rounded-lg border border-esports-accent/20">
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-esports-dark border-esports-accent/30 text-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/30">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              {showCompletedFilter && <SelectItem value="completed">Completed</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Game</label>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full bg-esports-dark border-esports-accent/30 text-gray-300">
              <SelectValue placeholder="Game" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/30">
              {gameOptions.map((game) => (
                <SelectItem key={game.value} value={game.value} disabled={!game.available}>
                  <div className="flex items-center justify-between w-full">
                    <span>{game.label}</span>
                    {!game.available && <span className="text-xs text-esports-accent ml-2">(Soon)</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {setGameTypeFilter && (
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Game Type</label>
            <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
              <SelectTrigger className="w-full bg-esports-dark border-esports-accent/30 text-gray-300">
                <SelectValue placeholder="Game Type" />
              </SelectTrigger>
              <SelectContent className="bg-esports-dark border-esports-accent/30">
                {gameTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TournamentFilters;
