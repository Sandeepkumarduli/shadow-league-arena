
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface InitializeDatabaseProps {
  onComplete: () => void;
}

const InitializeDatabase = ({ onComplete }: InitializeDatabaseProps) => {
  const [initializing, setInitializing] = useState(false);

  const initializeDatabase = async () => {
    if (initializing) return;
    setInitializing(true);

    try {
      // Check if we have data in admin_wallet table
      const { data: adminWallets } = await supabase.from('admin_wallet').select('*');
      
      if (!adminWallets || adminWallets.length === 0) {
        // Insert initial admin wallet record
        await supabase.from('admin_wallet').insert([
          { balance: 50000 }
        ]);
      }

      // Check if we have tournaments
      const { data: tournaments } = await supabase.from('tournaments').select('*');
      
      if (!tournaments || tournaments.length === 0) {
        // Add sample tournaments
        await supabase.from('tournaments').insert([
          {
            name: 'BGMI Pro League Season 1',
            game: 'BGMI',
            description: 'The biggest mobile gaming tournament of the season',
            max_teams: 32,
            prize_pool: 5000,
            entry_fee: 200,
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'upcoming'
          },
          {
            name: 'Valorant Weekly Cup',
            game: 'Valorant',
            description: 'Weekly tournament for Valorant players',
            max_teams: 16,
            prize_pool: 2000,
            entry_fee: 100,
            start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'upcoming'
          },
          {
            name: 'Free Fire Championship',
            game: 'Free Fire',
            description: 'Monthly championship with elimination rounds',
            max_teams: 20,
            prize_pool: 3000,
            entry_fee: 150,
            start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'live'
          },
          {
            name: 'CS:GO Amateur League',
            game: 'CS:GO',
            description: 'Tournament for amateur CS:GO teams',
            max_teams: 24,
            prize_pool: 1500,
            entry_fee: 0,
            start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          }
        ]);
      }
      
      // Check if we have news items
      const { data: news } = await supabase.from('news').select('*');
      
      if (!news || news.length === 0) {
        // Add sample news items
        await supabase.from('news').insert([
          {
            title: 'BGMI Pro League Season 1 Announced',
            content: 'Join the biggest mobile gaming tournament with a prize pool of 5,000 rdCoins. Registration opens next week!',
            category: 'Tournament',
            image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          },
          {
            title: 'New Valorant Tournament Format',
            content: 'We're introducing a new bracket system for Valorant tournaments with double elimination rounds.',
            category: 'Update',
            image_url: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          },
          {
            title: 'Platform Maintenance Notice',
            content: 'The platform will be undergoing maintenance on May 20th from 2 AM to 5 AM. Some features may be unavailable during this time.',
            category: 'Announcement',
            image_url: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          }
        ]);
      }
      
      // Check if we have activity logs
      const { data: logs } = await supabase.from('activity_logs').select('*');
      
      if (!logs || logs.length === 0) {
        // Add sample activity logs
        await supabase.from('activity_logs').insert([
          {
            type: 'tournament',
            action: 'create',
            details: 'Tournament "BGMI Pro League Season 1" was created',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'user',
            action: 'ban',
            details: 'User "FireHawk22" was banned for inappropriate behavior',
            created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'coins',
            action: 'distribute',
            details: '500 rdCoins distributed to winners of "BGMI Weekly Cup"',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'tournament',
            action: 'update',
            details: 'Tournament "Free Fire Weekly" was updated',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'user',
            action: 'unban',
            details: 'User "ThunderBolt" was unbanned',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }
      
      toast({
        title: "Database Initialized",
        description: "Sample data has been added to the database."
      });
      
    } catch (error) {
      console.error("Error initializing database:", error);
      toast({
        title: "Error",
        description: "Failed to initialize database.",
        variant: "destructive"
      });
    } finally {
      setInitializing(false);
      onComplete();
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  return null;
};

export default InitializeDatabase;
