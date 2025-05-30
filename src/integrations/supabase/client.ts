
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qdobufrnlnhioksxdssu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb2J1ZnJubG5oaW9rc3hkc3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzAwODMsImV4cCI6MjA2MjY0NjA4M30.CnhahVCakdQVZFdWElSTYyHi_Wbb3YhXuFMZMXeIdd4";

// Create Supabase client with improved configuration for real-time
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'lovable-app'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add a global error handler for debugging
const originalFrom = supabase.from.bind(supabase);
supabase.from = (table: string) => {
  const result = originalFrom(table);
  
  // Wrap the query methods to add error logging
  const originalQuery = result.select.bind(result);
  result.select = function(...args: any[]) {
    console.debug(`Querying table: ${table}`);
    return originalQuery(...args);
  };
  
  return result;
};

// Helper function to create a real-time channel subscription
export const createRealtimeChannel = (tableName: string, callback: Function) => {
  const channel = supabase
    .channel(`public:${tableName}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName
      },
      (payload) => {
        console.debug(`Realtime update on ${tableName}:`, payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.debug(`Realtime subscription status for ${tableName}:`, status);
    });

  return channel;
};

export default supabase;
