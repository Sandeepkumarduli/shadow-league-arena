
import { supabase, createRealtimeChannel } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// NewsItem interface
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category?: string;
}

// Fetch news items
export const fetchNews = async (): Promise<NewsItem[]> => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as NewsItem[];
  } catch (error) {
    console.error('Error fetching news:', error);
    toast({
      title: "Failed to fetch news",
      description: "There was an error loading news. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Subscribe to news changes
export const subscribeNewsChanges = (callback: (news: NewsItem[]) => void) => {
  // Initial fetch
  fetchNews().then(callback);
  
  // Set up real-time subscription
  const channel = createRealtimeChannel('news', () => {
    fetchNews().then(callback);
  });
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Add new news item
export const createNewsItem = async (newsData: Omit<NewsItem, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .insert([newsData])
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error creating news item:', error);
    toast({
      title: "Failed to create news",
      description: "There was an error creating the news item. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Update news item
export const updateNewsItem = async (id: string, newsData: Partial<NewsItem>) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .update(newsData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error updating news item:', error);
    toast({
      title: "Failed to update news",
      description: "There was an error updating the news item. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};

// Delete news item
export const deleteNewsItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting news item:', error);
    toast({
      title: "Failed to delete news",
      description: "There was an error deleting the news item. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
