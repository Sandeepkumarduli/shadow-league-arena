
import { Award, Gamepad, Trophy, Users } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: <Gamepad className="h-8 w-8" />,
    title: "Choose Your Game",
    description:
      "Browse tournaments for your favorite games and find the perfect competition for your skill level.",
  },
  {
    id: 2,
    icon: <Users className="h-8 w-8" />,
    title: "Register & Join",
    description:
      "Create an account, register for tournaments, and connect with other players to form teams if needed.",
  },
  {
    id: 3,
    icon: <Award className="h-8 w-8" />,
    title: "Compete & Play",
    description:
      "Check in on time, follow the tournament schedule, and give your best performance in matches.",
  },
  {
    id: 4,
    icon: <Trophy className="h-8 w-8" />,
    title: "Win Prizes",
    description:
      "Top performers win prizes including cash, gaming gear, and exclusive in-game items.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 relative">
      {/* Background Effects */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-esports-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-rajdhani mb-4">
            How <span className="text-esports-accent">It Works</span>
          </h2>
          <p className="text-gray-300">
            Getting started with NexusArena is easy. Follow these simple steps to join tournaments and start competing for prizes.
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div 
              key={step.id}
              className="relative bg-esports-dark border border-esports-accent/20 rounded-lg p-6 text-center group hover:border-esports-accent transition-colors"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-esports-dark rounded-full border border-esports-accent flex items-center justify-center font-bold text-esports-accent">
                {step.id}
              </div>
              
              {/* Icon */}
              <div className="mb-6 text-esports-accent inline-flex p-4 bg-esports-accent/10 rounded-full group-hover:bg-esports-accent/20 transition-colors">
                {step.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold font-rajdhani mb-3">
                {step.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
