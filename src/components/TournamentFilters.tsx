
import { useState } from "react";
import { Filter, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface TournamentFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  gameFilter: string;
  onGameChange: (value: string) => void;
  gameTypeFilter?: string;
  setGameTypeFilter?: (value: string) => void;
  dateFilter?: Date | null;
  setDateFilter?: (value: Date | null) => void;
  showCompletedFilter?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: React.ChangeEvent<HTMLInputElement>) => void;
  gameTypes?: string[];
  setStatusFilter?: (value: string) => void;
  setGameFilter?: (value: string) => void;
}

// Game type options
const gameTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Solo", label: "Solo" },
  { value: "Duo", label: "Duo" },
  { value: "Squad", label: "Squad" },
];

const TournamentFilters = ({ 
  statusFilter, 
  onStatusChange,
  setStatusFilter, 
  gameFilter, 
  onGameChange,
  setGameFilter,
  gameTypeFilter = "all",
  setGameTypeFilter,
  dateFilter = null,
  setDateFilter,
  showCompletedFilter = true,
  searchQuery,
  onSearchChange,
  gameTypes
}: TournamentFiltersProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Use the appropriate set function based on what's provided
  const handleStatusChange = setStatusFilter || onStatusChange;
  const handleGameChange = setGameFilter || onGameChange;

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
        
        <Select value={statusFilter} onValueChange={handleStatusChange}>
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
        
        <Select value={gameFilter} onValueChange={handleGameChange}>
          <SelectTrigger className="w-[220px] bg-esports-dark border-esports-accent/30 text-gray-300">
            <SelectValue placeholder="Game" />
          </SelectTrigger>
          <SelectContent className="bg-esports-dark border-esports-accent/30">
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="BGMI">BGMI</SelectItem>
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
        
        {setDateFilter && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-[180px] justify-start gap-2 bg-esports-dark border-esports-accent/30 text-gray-300"
              >
                <Calendar className="h-4 w-4 text-esports-accent" />
                {dateFilter ? format(dateFilter, "MMM dd, yyyy") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-esports-dark border-esports-accent/30">
              <CalendarComponent
                mode="single"
                selected={dateFilter || undefined}
                onSelect={setDateFilter}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              {dateFilter && (
                <div className="p-2 border-t border-esports-accent/20 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-300 hover:bg-esports-accent/10"
                    onClick={() => setDateFilter(null)}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-esports-accent hover:bg-esports-accent-hover"
                    onClick={() => {}}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
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
          <Select value={statusFilter} onValueChange={handleStatusChange}>
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
          <Select value={gameFilter} onValueChange={handleGameChange}>
            <SelectTrigger className="w-full bg-esports-dark border-esports-accent/30 text-gray-300">
              <SelectValue placeholder="Game" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/30">
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="BGMI">BGMI</SelectItem>
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
        
        {setDateFilter && (
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 bg-esports-dark border-esports-accent/30 text-gray-300"
                >
                  <Calendar className="h-4 w-4 text-esports-accent" />
                  {dateFilter ? format(dateFilter, "MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-esports-dark border-esports-accent/30">
                <CalendarComponent
                  mode="single"
                  selected={dateFilter || undefined}
                  onSelect={setDateFilter}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
                {dateFilter && (
                  <div className="p-2 border-t border-esports-accent/20 flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-300 hover:bg-esports-accent/10"
                      onClick={() => setDateFilter(null)}
                    >
                      Clear
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-esports-accent hover:bg-esports-accent-hover"
                      onClick={() => {}}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TournamentFilters;
