
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Menu, X, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-esports-darker/80 backdrop-blur-md border-b border-esports-accent/20">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-esports-accent" />
            <span className="text-xl font-bold font-rajdhani text-white tracking-wider">
              NEXUS<span className="text-esports-accent">ARENA</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/tournaments" className="text-white hover:text-esports-accent transition-colors">
              Tournaments
            </Link>
            <a href="#" className="text-white hover:text-esports-accent transition-colors">
              Games
            </a>
            <a href="#" className="text-white hover:text-esports-accent transition-colors">
              Leaderboards
            </a>
            <a href="#" className="text-white hover:text-esports-accent transition-colors">
              How It Works
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-esports-dark hover:text-esports-accent">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button className="bg-esports-accent hover:bg-esports-accent-hover text-white clip-path-angle px-6">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-esports-dark mt-4 rounded-lg border border-esports-accent/20 animate-fade-in">
            <div className="flex flex-col gap-4 px-4">
              <Link to="/tournaments" className="text-white hover:text-esports-accent py-2 transition-colors">
                Tournaments
              </Link>
              <a href="#" className="text-white hover:text-esports-accent py-2 transition-colors">
                Games
              </a>
              <a href="#" className="text-white hover:text-esports-accent py-2 transition-colors">
                Leaderboards
              </a>
              <a href="#" className="text-white hover:text-esports-accent py-2 transition-colors">
                How It Works
              </a>
              <div className="flex flex-col gap-2 pt-2 border-t border-esports-accent/20">
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-white justify-start hover:bg-esports-dark hover:text-esports-accent w-full">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button className="bg-esports-accent hover:bg-esports-accent-hover text-white w-full">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
