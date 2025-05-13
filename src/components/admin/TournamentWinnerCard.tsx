
import React from 'react';
import { Trophy, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tournament } from "@/types/tournament";

interface TournamentWinnerCardProps {
  tournament: Tournament;
  onUpdateClick: (tournament: Tournament) => void;
}

const TournamentWinnerCard = ({ tournament, onUpdateClick }: TournamentWinnerCardProps) => {
  return (
    <Card className="bg-esports-dark border-esports-accent/20">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-esports-accent/20 rounded-full p-4 flex-shrink-0">
              <Trophy className="h-8 w-8 text-esports-accent" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                <Badge variant="outline" className="bg-esports-accent/10 text-esports-accent border-esports-accent/20">
                  {tournament.game}
                </Badge>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{tournament.date}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span>{tournament.max_teams} Teams</span>
                </div>
                <div className="text-sm text-yellow-500">
                  <span>{tournament.prize_pool} rdCoins</span>
                </div>
              </div>
              
              <div className="mt-3">
                {tournament.winner ? (
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="text-sm text-esports-accent mr-2">Winner:</span>
                      <span className="text-white">{tournament.winner}</span>
                    </div>
                    {tournament.secondPlace && (
                      <div className="flex items-center">
                        <span className="text-sm text-esports-accent mr-2">2nd Place:</span>
                        <span className="text-white">{tournament.secondPlace}</span>
                      </div>
                    )}
                    {tournament.thirdPlace && (
                      <div className="flex items-center">
                        <span className="text-sm text-esports-accent mr-2">3rd Place:</span>
                        <span className="text-white">{tournament.thirdPlace}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-none">
                    Winners Not Set
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0">
            <Button
              onClick={() => onUpdateClick(tournament)}
              className="bg-esports-accent hover:bg-esports-accent/80 text-white"
            >
              {tournament.winner ? "Update Winners" : "Set Winners"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentWinnerCard;
