
import React, { useState, useEffect } from "react";
import { Bell, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: string;
  is_read: boolean;
}

interface NotificationsPanelProps {
  onClose: () => void;
}

const NotificationsPanel = ({ onClose }: NotificationsPanelProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching notifications:", error);
          return;
        }

        setNotifications(data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }

      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .in('id', notifications.map(n => n.id));

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return;
      }

      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationBadgeClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'tournament':
        return 'bg-purple-700/20 text-purple-400 border-none';
      case 'system':
        return 'bg-blue-700/20 text-blue-400 border-none';
      case 'warning':
        return 'bg-amber-700/20 text-amber-400 border-none';
      case 'error':
        return 'bg-red-700/20 text-red-400 border-none';
      default:
        return 'bg-green-700/20 text-green-400 border-none';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-esports-dark border border-esports-accent/20 shadow-lg rounded-md z-50">
      <div className="flex items-center justify-between p-4 border-b border-esports-accent/20">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-esports-accent mr-2" />
          <h3 className="font-medium text-white">Notifications</h3>
          {notifications.filter(n => !n.is_read).length > 0 && (
            <Badge variant="outline" className="ml-2 bg-esports-accent/20 text-esports-accent border-none">
              {notifications.filter(n => !n.is_read).length} New
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs text-gray-300 hover:text-white px-2 py-1"
          >
            Mark all read
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-esports-accent/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 border-b border-esports-accent/10 hover:bg-esports-accent/5 transition-colors cursor-pointer ${!notification.is_read ? 'bg-esports-accent/5' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                  {!notification.is_read && (
                    <span className="w-2 h-2 bg-esports-accent rounded-full ml-2"></span>
                  )}
                </div>
                <Badge variant="outline" className={`text-xs ${getNotificationBadgeClass(notification.type)}`}>
                  {notification.type}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mb-2">{notification.message}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400">
            <p>No notifications to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
