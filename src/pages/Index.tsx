
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TournamentCard from "@/components/TournamentCard";
import FeaturedGames from "@/components/FeaturedGames";
import HowItWorks from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

// Sample tournaments data - only showing upcoming tournaments for public users
const tournaments = [
  {
    id: "1",
    title: "Valorant Masters Championship",
    game: "Valorant",
    gameType: "Squad" as const,
    gameImage: "https://images.unsplash.com/photo-1604957570401-1f68b7661371?auto=format&fit=crop&q=80&w=2071&ixlib=rb-4.0.3",
    date: "Jun 15, 2025 • 6:00 PM",
    entryFee: "15",
    prizePool: "5,000",
    participants: { current: 54, max: 64 },
    status: "upcoming" as const,
  },
  {
    id: "3",
    title: "Call of Duty: Warzone Solo Challenge",
    game: "Call of Duty",
    gameType: "Solo" as const,
    gameImage: "https://images.unsplash.com/photo-1621075160523-b936ad96132a?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
    date: "Jun 18, 2025 • 7:00 PM",
    entryFee: "Free",
    prizePool: "2,500",
    participants: { current: 87, max: 100 },
    status: "upcoming" as const,
  },
  {
    id: "4",
    title: "Fortnite Weekend Showdown",
    game: "Fortnite",
    gameType: "Duo" as const,
    gameImage: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3",
    date: "Jun 20, 2025 • 3:00 PM",
    entryFee: "10",
    prizePool: "3,000",
    participants: { current: 45, max: 50 },
    status: "upcoming" as const,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-esports-darker">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Tournaments Section - Only showing upcoming tournaments */}
      <section className="py-20 relative">
        {/* Background Effects */}
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-esports-accent/5 rounded-full blur-3xl -translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-rajdhani">
                Upcoming <span className="text-esports-accent">Tournaments</span>
              </h2>
              <p className="text-gray-400 mt-2">
                Register now to secure your spot in our most popular competitions
              </p>
            </div>
            <Link to="/login">
              <Button variant="outline" className="border-esports-accent text-white hover:bg-esports-accent/10 sm:self-end">
                View All Tournaments
              </Button>
            </Link>
          </div>
          
          {/* Tournaments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard 
                key={tournament.id} 
                {...tournament} 
                onJoin={() => {}} 
                onDetails={() => {}}
              />
            ))}
          </div>
          
          {/* Login to Register Notice */}
          <div className="mt-10 p-6 bg-esports-dark/80 border border-esports-accent/20 rounded-lg text-center">
            <h3 className="text-xl font-bold text-white mb-3">Want to participate in tournaments?</h3>
            <p className="text-gray-300 mb-6">Sign up or login to register for upcoming tournaments and start competing!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login">
                <Button className="bg-esports-accent hover:bg-esports-accent-hover text-white px-8">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="border-esports-accent text-white hover:bg-esports-accent/10 px-8">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Games Section */}
      <FeaturedGames />
      
      {/* How It Works Section */}
      <HowItWorks />
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-esports-dark to-esports-darker relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-esports-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-esports-cyan/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-rajdhani mb-6">
              Ready to <span className="text-esports-accent glow-text">Compete</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of gamers already competing on NexusArena. Sign up today and start your journey to esports glory.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button className="bg-esports-accent hover:bg-esports-accent-hover text-white px-8 py-6 rounded-md">
                  Sign Up Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-esports-accent text-white hover:bg-esports-accent/10 px-8 py-6 rounded-md">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-esports-darker border-t border-esports-accent/20 py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <a href="/" className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-esports-accent" />
                <span className="text-lg font-bold font-rajdhani text-white">
                  NEXUS<span className="text-esports-accent">ARENA</span>
                </span>
              </a>
              <p className="text-sm text-gray-400 mt-2">
                The ultimate esports tournament platform
              </p>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-esports-accent transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-esports-accent transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-esports-accent transition-colors">
                Support
              </a>
              <a href="#" className="text-gray-400 hover:text-esports-accent transition-colors">
                Contact
              </a>
            </div>
          </div>
          
          <div className="border-t border-esports-accent/20 mt-6 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} NexusArena. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
