
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsItem, fetchNews, subscribeNewsChanges } from "@/services/newsService";
import LoadingSpinner from "@/components/LoadingSpinner";

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeNewsChanges((fetchedNews) => {
      setNews(fetchedNews);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center p-8 bg-esports-dark rounded-lg border border-esports-accent/20">
          <p className="text-gray-400">No news available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="bg-esports-dark border-esports-accent/20 overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={item.image_url || "https://placehold.co/800x400/1977d4/FFF?text=News"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-200"
                />
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <Badge className="bg-esports-accent/20 text-esports-accent border-none">
                    {item.category || "News"}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-400">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
                <p className="text-gray-300 text-sm">{item.content}</p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="border-esports-accent/20 text-white hover:bg-esports-accent/10">
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default News;
