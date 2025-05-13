
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Info, AlertCircle, BellRing, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BroadcastMessage, 
  fetchBroadcastMessages,
  subscribeBroadcastChanges,
  sendBroadcastMessage
} from "@/services/broadcastService";
import { fetchCurrentUser } from "@/services/authService";
import { fetchUsers } from "@/services/userService";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminBroadcast = () => {
  const navigate = useNavigate();
  const [recipientType, setRecipientType] = useState<"all" | "game" | "specific">("all");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [messageType, setMessageType] = useState<"info" | "warning" | "urgent">("info");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [recentMessages, setRecentMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ id: string; username: string; email: string }[]>([]);
  
  useEffect(() => {
    // Subscribe to broadcast messages
    const unsubscribe = subscribeBroadcastChanges((messages) => {
      setRecentMessages(messages);
      setLoading(false);
    });
    
    // Fetch users for recipient selection
    fetchUsers().then(fetchedUsers => {
      setUsers(fetchedUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email
      })));
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }
    
    if (recipientType === "specific" && !userIdentifier.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username or email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // Get current user (admin)
      const currentUser = await fetchCurrentUser();
      if (!currentUser) throw new Error("Not authorized");
      
      await sendBroadcastMessage({
        recipient_type: recipientType,
        recipient_identifier: recipientType === "specific" ? userIdentifier : undefined,
        message_type: messageType,
        message,
        sent_by: currentUser.id
      });
      
      // Reset form
      setMessage("");
      if (recipientType === "specific") {
        setUserIdentifier("");
      }
    } catch (error) {
      console.error("Error sending broadcast message:", error);
      toast({
        title: "Error",
        description: "Failed to send broadcast message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
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
        <h1 className="text-2xl font-bold text-white">Broadcast Messages</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Message */}
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader>
            <CardTitle className="text-white">Compose Message</CardTitle>
            <CardDescription className="text-gray-400">Send notifications to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipient" className="text-white">Recipient</Label>
              <Select
                value={recipientType}
                onValueChange={(value) => setRecipientType(value as "all" | "game" | "specific")}
              >
                <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="game">BGMI Players</SelectItem>
                  <SelectItem value="specific">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {recipientType === "specific" && (
              <div>
                <Label htmlFor="userIdentifier" className="text-white">Username or Email</Label>
                <Select 
                  value={userIdentifier} 
                  onValueChange={setUserIdentifier}
                >
                  <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.username}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="messageType" className="text-white">Message Type</Label>
              <Select
                value={messageType}
                onValueChange={(value) => setMessageType(value as "info" | "warning" | "urgent")}
              >
                <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white mt-1">
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message" className="text-white">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="bg-esports-darker border-esports-accent/20 text-white resize-none h-32 mt-1"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="bg-esports-accent hover:bg-esports-accent/80 text-white w-full"
              onClick={handleSendMessage}
              disabled={isSending}
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Recent Messages */}
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Messages</CardTitle>
            <CardDescription className="text-gray-400">History of messages sent</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map(msg => {
                  // Format recipient display
                  let recipientDisplay = "All Users";
                  if (msg.recipient_type === "specific") {
                    recipientDisplay = msg.recipient_identifier || "Specific User";
                  } else if (msg.recipient_type === "game") {
                    recipientDisplay = "BGMI Players";
                  }
                  
                  return (
                    <div 
                      key={msg.id} 
                      className="p-3 bg-esports-darker rounded-md border-l-4 border-l-esports-accent"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {msg.message_type === "info" && <Info className="h-4 w-4 text-blue-400 mr-2" />}
                          {msg.message_type === "warning" && <AlertCircle className="h-4 w-4 text-amber-400 mr-2" />}
                          {msg.message_type === "urgent" && <BellRing className="h-4 w-4 text-red-500 mr-2" />}
                          <Badge 
                            variant="outline" 
                            className={
                              msg.message_type === "info" 
                                ? "bg-blue-900/20 text-blue-400 border-none" 
                                : msg.message_type === "warning" 
                                  ? "bg-amber-900/20 text-amber-400 border-none"
                                  : "bg-red-900/20 text-red-500 border-none"
                            }
                          >
                            {msg.message_type.charAt(0).toUpperCase() + msg.message_type.slice(1)}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.sent_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-white text-sm mb-2">{msg.message}</p>
                      
                      <div className="flex items-center text-xs text-gray-400">
                        <Users className="h-3 w-3 mr-1" />
                        <span>To: {recipientDisplay}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No messages have been sent yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBroadcast;
