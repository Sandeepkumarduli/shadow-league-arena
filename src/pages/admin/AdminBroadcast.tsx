
import { useState } from "react";
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

const AdminBroadcast = () => {
  const navigate = useNavigate();
  const [recipientType, setRecipientType] = useState("all");
  const [userIdentifier, setUserIdentifier] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [recentMessages, setRecentMessages] = useState([
    {
      id: "1",
      recipient: "All Users",
      type: "info",
      message: "Welcome to the new platform update! Check out the new features.",
      sentAt: "2023-05-10 14:30:22"
    },
    {
      id: "2",
      recipient: "BGMI Players",
      type: "warning",
      message: "BGMI servers will be down for maintenance on May 15th from 2 AM to 5 AM.",
      sentAt: "2023-05-09 10:15:45"
    },
    {
      id: "3",
      recipient: "FireHawk22",
      type: "urgent",
      message: "Your tournament registration for 'BGMI Pro League' needs attention.",
      sentAt: "2023-05-08 18:22:10"
    }
  ]);

  const handleSendMessage = () => {
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
    
    // In a real application, this would be an API call to send the message
    setTimeout(() => {
      const recipientDisplay = recipientType === "all" 
        ? "All Users" 
        : recipientType === "specific" 
          ? userIdentifier
          : "BGMI Players";
      
      const newMessage = {
        id: (recentMessages.length + 1).toString(),
        recipient: recipientDisplay,
        type: messageType,
        message,
        sentAt: new Date().toLocaleString()
      };
      
      setRecentMessages([newMessage, ...recentMessages]);
      
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${recipientDisplay}.`,
      });
      
      // Reset form
      setMessage("");
      if (recipientType === "specific") {
        setUserIdentifier("");
      }
      
      setIsSending(false);
    }, 1000);
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
                onValueChange={setRecipientType}
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
                <Input
                  id="userIdentifier"
                  placeholder="Enter username or email address"
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                  value={userIdentifier}
                  onChange={(e) => setUserIdentifier(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="messageType" className="text-white">Message Type</Label>
              <Select
                value={messageType}
                onValueChange={setMessageType}
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
            <div className="space-y-4">
              {recentMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className="p-3 bg-esports-darker rounded-md border-l-4 border-l-esports-accent"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      {msg.type === "info" && <Info className="h-4 w-4 text-blue-400 mr-2" />}
                      {msg.type === "warning" && <AlertCircle className="h-4 w-4 text-amber-400 mr-2" />}
                      {msg.type === "urgent" && <BellRing className="h-4 w-4 text-red-500 mr-2" />}
                      <Badge 
                        variant="outline" 
                        className={
                          msg.type === "info" 
                            ? "bg-blue-900/20 text-blue-400 border-none" 
                            : msg.type === "warning" 
                              ? "bg-amber-900/20 text-amber-400 border-none"
                              : "bg-red-900/20 text-red-500 border-none"
                        }
                      >
                        {msg.type.charAt(0).toUpperCase() + msg.type.slice(1)}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">{msg.sentAt}</span>
                  </div>
                  
                  <p className="text-white text-sm mb-2">{msg.message}</p>
                  
                  <div className="flex items-center text-xs text-gray-400">
                    <Users className="h-3 w-3 mr-1" />
                    <span>To: {msg.recipient}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBroadcast;
