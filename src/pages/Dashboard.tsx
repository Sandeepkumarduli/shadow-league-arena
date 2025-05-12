
import DashboardLayout from "@/components/DashboardLayout";
import TournamentCard from "@/components/TournamentCard";
import { Button } from "@/components/ui/button";

// Sample tournaments data (reused from Index.tsx)
const tournaments = [
  {
    id: "1",
    title: "Valorant Masters Championship",
    game: "Valorant",
    gameImage: "",
    date: "Jun 15, 2025 • 6:00 PM",
    entryFee: "$15",
    prizePool: "$5,000",
    participants: { current: 54, max: 64 },
    status: "upcoming" as const,
  },
  {
    id: "2",
    title: "League of Legends Pro Series - Summer Split",
    game: "League of Legends",
    gameImage: "",
    date: "Live Now",
    entryFee: "$20",
    prizePool: "$8,000",
    participants: { current: 32, max: 32 },
    status: "live" as const,
  }
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back, Player</h1>
          <p className="text-gray-400">Your gaming journey continues today</p>
        </div>
        
        {/* Upcoming tournaments section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Upcoming Tournaments</h2>
            <Button variant="outline" className="border-esports-accent text-white hover:bg-esports-accent/10">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} {...tournament} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
