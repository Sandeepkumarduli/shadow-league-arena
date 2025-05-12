
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationsPanelProps {
  onClose: () => void;
}

// Sample notifications data
const initialNotifications = [
  {
    id: "1",
    title: "Tournament Starting Soon",
    message: "BGMI Pro League Season 5 starts in 30 minutes!",
    time: "10 min ago",
    read: false,
  },
  {
    id: "2",
    title: "New Tournament Added",
    message: "Valorant Championship Series has been added",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    title: "Tournament Result",
    message: "Congratulations! You placed #3 in COD Mobile Battle Royale",
    time: "Yesterday",
    read: true,
  },
  {
    id: "4",
    title: "Team Invitation",
    message: "XYZ invited you to join their squad",
    time: "2 days ago",
    read: true,
  },
];

const NotificationsPanel = ({ onClose }: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleReadAll = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-esports-dark border border-esports-accent/30 rounded-md shadow-lg z-50">
      <div className="p-4 border-b border-esports-accent/20 flex items-center justify-between">
        <h3 className="text-white font-semibold">Notifications</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-gray-400">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-80">
        {notifications.length > 0 ? (
          <div className="p-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 mb-1 rounded-md ${notification.read ? 'bg-esports-dark' : 'bg-esports-accent/10'}`}
              >
                <div className="flex justify-between">
                  <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                  <span className="text-xs text-gray-400">{notification.time}</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <p>No notifications</p>
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-esports-accent/20 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-esports-dark border-esports-accent/30 text-gray-300 hover:bg-esports-accent/10"
          onClick={handleReadAll}
        >
          Read All
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 bg-esports-dark border-esports-accent/30 text-gray-300 hover:bg-esports-accent/10"
          onClick={handleClearAll}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
