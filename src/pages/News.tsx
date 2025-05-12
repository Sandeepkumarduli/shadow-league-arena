
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Sample news data
const newsData = [
  {
    id: "1",
    title: "BGMI Pro League Season 5 Registrations Open",
    description: "Register now for the biggest BGMI tournament of the year with a prize pool of 3,000 rdCoins.",
    image: "https://placehold.co/800x400/1977d4/FFF?text=BGMI+Pro+League",
    date: "May 12, 2025",
    category: "Tournament"
  },
  {
    id: "2",
    title: "New Teams Feature: Create Your Squad",
    description: "Form your dream team and compete together in tournaments. New squad management features now available.",
    image: "https://placehold.co/800x400/1977d4/FFF?text=Teams+Feature",
    date: "May 10, 2025",
    category: "Feature"
  },
  {
    id: "3",
    title: "Valorant Championship Results",
    description: "Congratulations to 'Valorant Vipers' for winning the Valorant Championship with an impressive performance.",
    image: "https://placehold.co/800x400/1977d4/FFF?text=Valorant+Championship",
    date: "May 8, 2025",
    category: "Results"
  },
  {
    id: "4",
    title: "Weekend Tournament Schedule",
    description: "Check out the lineup of exciting tournaments happening this weekend across multiple game titles.",
    image: "https://placehold.co/800x400/1977d4/FFF?text=Weekend+Schedule",
    date: "May 7, 2025",
    category: "Schedule"
  }
];

const News = () => {
  const navigate = useNavigate();
  const [news] = useState(newsData);

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center text-gray-400 hover:text-white mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">News & Announcements</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((item) => (
          <Card key={item.id} className="bg-esports-dark border-esports-accent/20 overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-200"
              />
            </div>
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-3">
                <Badge className="bg-esports-accent/20 text-esports-accent border-none">
                  {item.category}
                </Badge>
                <div className="flex items-center text-xs text-gray-400">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  <span>{item.date}</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
              <p className="text-gray-300 text-sm">{item.description}</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="border-esports-accent/20 text-white hover:bg-esports-accent/10">
                  Read More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default News;
