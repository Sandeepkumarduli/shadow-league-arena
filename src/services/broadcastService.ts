
import { supabase, createRealtimeChannel } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// BroadcastMessage interface
export interface BroadcastMessage {
  id: string;
  recipient_type: 'all' | 'game' | 'specific';
  recipient_identifier?: string;
  message_type: 'info' | 'warning' | 'urgent';
  message: string;
  sent_by: string;
  sent_at: string;
}

// Fetch broadcast messages
export const fetchBroadcastMessages = async (): Promise<BroadcastMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('broadcast_messages')
      .select('*')
      .order('sent_at', { ascending: false });
    
    if (error) throw error;
    
    return data as BroadcastMessage[];
  } catch (error) {
    console.error('Error fetching broadcast messages:', error);
    toast({
      title: "Failed to fetch messages",
      description: "There was an error loading broadcast messages. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Subscribe to broadcast changes
export const subscribeBroadcastChanges = (callback: (messages: BroadcastMessage[]) => void) => {
  // Initial fetch
  fetchBroadcastMessages().then(callback);
  
  // Set up real-time subscription
  const channel = createRealtimeChannel('broadcast_messages', () => {
    fetchBroadcastMessages().then(callback);
  });
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Send a broadcast message
export const sendBroadcastMessage = async (messageData: Omit<BroadcastMessage, 'id' | 'sent_at'>) => {
  try {
    const { data, error } = await supabase
      .from('broadcast_messages')
      .insert([messageData])
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error('Error sending broadcast message:', error);
    toast({
      title: "Failed to send message",
      description: "There was an error sending the broadcast message. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
