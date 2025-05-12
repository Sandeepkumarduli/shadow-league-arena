
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  category?: string;
}

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to load news. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-esports-accent"></div>
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
