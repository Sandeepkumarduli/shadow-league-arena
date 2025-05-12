
import { Button } from "@/components/ui/button";

const games = [
  {
    id: "1",
    name: "League of Legends",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    activeTournaments: 24,
  },
  {
    id: "2",
    name: "Valorant",
    image: "https://images.unsplash.com/photo-1604957570401-1f68b7661371?auto=format&fit=crop&q=80&w=2071&ixlib=rb-4.0.3",
    activeTournaments: 18,
  },
  {
    id: "3",
    name: "Call of Duty",
    image: "https://images.unsplash.com/photo-1621075160523-b936ad96132a?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
    activeTournaments: 15,
  },
  {
    id: "4",
    name: "Fortnite",
    image: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&q=80&w=1374&ixlib=rb-4.0.3",
    activeTournaments: 21,
  },
  {
    id: "5",
    name: "CS:GO",
    image: "https://images.unsplash.com/photo-1579168765467-3b235f938439?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3",
    activeTournaments: 16,
  },
];

const FeaturedGames = () => {
  return (
    <section className="py-20 bg-esports-dark relative">
      {/* Background Effects */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-esports-purple/5 rounded-full blur-3xl"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-esports-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-rajdhani mb-4">
            Popular <span className="text-esports-accent">Games</span>
          </h2>
          <p className="text-gray-300">
            Browse tournaments by your favorite games. From MOBAs to FPS, we've got competitions for all types of gamers.
          </p>
        </div>
        
        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {games.map((game) => (
            <div key={game.id} className="esports-card relative group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-esports-card to-transparent"></div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold font-rajdhani group-hover:text-esports-accent transition-colors">
                  {game.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {game.activeTournaments} active tournaments
                </p>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-esports-dark/80 backdrop-blur-sm">
                <Button className="bg-esports-accent hover:bg-esports-accent-hover text-white">
                  Browse Tournaments
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" className="border-esports-accent text-white hover:bg-esports-accent/10">
            View All Games
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGames;
