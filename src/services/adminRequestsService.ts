
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logActivity } from "./activityLogService";

// AdminRequest interface
export interface AdminRequest {
  id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  user?: {
    username: string;
    email: string;
  }
}

// Fetch admin requests with optional filters
export const fetchAdminRequests = async (statusFilter: string = 'all'): Promise<AdminRequest[]> => {
  try {
    let query = supabase
      .from('admin_requests')
      .select('*, user:users(username, email)')
      .order('created_at', { ascending: false });
    
    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data as unknown as AdminRequest[];
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    toast({
      title: "Failed to fetch admin requests",
      description: "There was an error loading admin requests. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Subscribe to admin request changes
export const subscribeAdminRequests = (callback: (requests: AdminRequest[]) => void, statusFilter: string = 'all') => {
  // Initial fetch
  fetchAdminRequests(statusFilter).then(callback);
  
  // Set up real-time subscription
  const channel = supabase
    .channel('public:admin_requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'admin_requests'
      },
      () => {
        fetchAdminRequests(statusFilter).then(callback);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};

// Approve admin request
export const approveAdminRequest = async (requestId: string) => {
  const { data: adminData } = await supabase.auth.getUser();
  const adminId = adminData.user?.id;
  
  try {
    // Get the request first to get the user_id
    const { data: requestData, error: requestError } = await supabase
      .from('admin_requests')
      .select('*, user:users(username)')
      .eq('id', requestId)
      .single();
      
    if (requestError) throw requestError;
    
    const request = requestData as unknown as AdminRequest;
    
    // Update request status
    const { error: updateError } = await supabase
      .from('admin_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId
      })
      .eq('id', requestId);
      
    if (updateError) throw updateError;
    
    // Update user to make them admin
    const { error: userError } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('id', request.user_id);
      
    if (userError) throw userError;
    
    // Log the activity
    await logActivity({
      type: 'user',
      action: 'admin_grant',
      details: `Approved admin request for user ${request.user?.username}`,
      userId: adminId,
      metadata: { requestId, userId: request.user_id }
    });
    
    toast({
      title: "Request Approved",
      description: "The admin access request has been approved.",
    });
    
    return true;
  } catch (error) {
    console.error('Error approving admin request:', error);
    toast({
      title: "Failed to approve request",
      description: "There was an error approving the admin request. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Reject admin request
export const rejectAdminRequest = async (requestId: string) => {
  const { data: adminData } = await supabase.auth.getUser();
  const adminId = adminData.user?.id;
  
  try {
    // Get the request first to get the user_id
    const { data: requestData, error: requestError } = await supabase
      .from('admin_requests')
      .select('*, user:users(username)')
      .eq('id', requestId)
      .single();
      
    if (requestError) throw requestError;
    
    const request = requestData as unknown as AdminRequest;
    
    // Update request status
    const { error } = await supabase
      .from('admin_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId
      })
      .eq('id', requestId);
      
    if (error) throw error;
    
    // Log the activity
    await logActivity({
      type: 'user',
      action: 'admin_reject',
      details: `Rejected admin request for user ${request.user?.username}`,
      userId: adminId,
      metadata: { requestId, userId: request.user_id }
    });
    
    toast({
      title: "Request Rejected",
      description: "The admin access request has been rejected.",
    });
    
    return true;
  } catch (error) {
    console.error('Error rejecting admin request:', error);
    toast({
      title: "Failed to reject request",
      description: "There was an error rejecting the admin request. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
