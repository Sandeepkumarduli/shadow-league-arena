
import { Button } from "@/components/ui/button";
import { Gamepad, Trophy, Users } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern opacity-10 z-0"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-esports-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-esports-cyan/10 rounded-full blur-3xl -translate-x-1/2 z-0"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Hero Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-esports-accent/20 px-4 py-1.5 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-esports-accent animate-pulse"></div>
              <span className="text-sm font-medium text-esports-accent">Season 3 Tournaments Live</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-rajdhani leading-tight mb-6">
              Compete. <span className="text-esports-accent glow-text">Dominate</span>. Win Big in Esports Tournaments
            </h1>
            
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of gamers competing in daily tournaments across your favorite titles. 
              Showcase your skills and win exclusive prizes in the ultimate esports community.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="bg-esports-accent hover:bg-esports-accent-hover text-white px-8 py-6 rounded-md">
                Browse Tournaments
              </Button>
              <Button variant="outline" className="border-esports-accent text-white hover:bg-esports-accent/10 px-8 py-6 rounded-md">
                How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              <div className="flex items-center gap-3">
                <div className="bg-esports-accent/20 p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-esports-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">240+</p>
                  <p className="text-sm text-gray-400">Active Tournaments</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-esports-cyan/20 p-2 rounded-lg">
                  <Gamepad className="h-5 w-5 text-esports-cyan" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">14</p>
                  <p className="text-sm text-gray-400">Supported Games</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-esports-green/20 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-esports-green" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">50K+</p>
                  <p className="text-sm text-gray-400">Active Players</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative w-full md:w-1/2 h-96 flex items-center justify-center">
            <div className="absolute w-72 h-72 bg-esports-accent/20 rounded-full blur-lg animate-pulse-glow"></div>
            <img 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3" 
              alt="Esports Tournament" 
              className="relative z-10 w-full h-full object-cover rounded-lg border border-esports-accent/30 shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
