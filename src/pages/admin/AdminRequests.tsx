
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Shield, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Sample admin requests data
const adminRequestsData = [
  {
    id: "1",
    username: "FireHawk22",
    email: "firehawk22@example.com",
    reason: "I would like to help manage BGMI tournaments and create new events for the community. I have experience organizing esports events.",
    status: "pending",
    requestedOn: "2023-05-01",
  },
  {
    id: "2",
    username: "StormRider",
    email: "stormrider@example.com",
    reason: "I want to help grow the Valorant community on this platform by creating and managing tournaments.",
    status: "pending",
    requestedOn: "2023-05-05",
  },
  {
    id: "3",
    username: "ThunderBolt",
    email: "thunderbolt@example.com",
    reason: "I am a content creator with a large following and would like to organize tournaments for my audience.",
    status: "approved",
    requestedOn: "2023-04-20",
    processedOn: "2023-04-25"
  },
  {
    id: "4",
    username: "NightShadow",
    email: "nightshadow@example.com",
    reason: "I have experience as a tournament organizer in other platforms and would like to bring my expertise here.",
    status: "rejected",
    requestedOn: "2023-04-15",
    processedOn: "2023-04-18"
  }
];

const AdminRequests = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  // Filter requests based on status
  const filteredRequests = adminRequestsData.filter(request => 
    statusFilter === "all" || request.status === statusFilter
  );
  
  // Find selected request
  const requestDetails = selectedRequest 
    ? adminRequestsData.find(req => req.id === selectedRequest) 
    : null;

  const handleApproveRequest = (requestId: string) => {
    setSelectedRequest(requestId);
    setIsApproveDialogOpen(true);
  };
  
  const handleRejectRequest = (requestId: string) => {
    setSelectedRequest(requestId);
    setIsRejectDialogOpen(true);
  };
  
  const confirmApproval = () => {
    if (!selectedRequest) return;
    
    // In a real application, this would be an API call to approve the request
    toast({
      title: "Request Approved",
      description: "The admin access request has been approved.",
    });
    
    setIsApproveDialogOpen(false);
    // In a real app, you would update the state or refetch the data
  };
  
  const confirmRejection = () => {
    if (!selectedRequest) return;
    
    // In a real application, this would be an API call to reject the request
    toast({
      title: "Request Rejected",
      description: "The admin access request has been rejected.",
    });
    
    setIsRejectDialogOpen(false);
    // In a real app, you would update the state or refetch the data
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
        <h1 className="text-2xl font-bold text-white">Admin Requests</h1>
      </div>
      
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          className={statusFilter === "all" ? "bg-esports-accent text-white" : "border-esports-accent/20 text-white"}
          onClick={() => setStatusFilter("all")}
        >
          All Requests
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          className={statusFilter === "pending" ? "bg-amber-600 text-white" : "border-esports-accent/20 text-white"}
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === "approved" ? "default" : "outline"}
          className={statusFilter === "approved" ? "bg-green-600 text-white" : "border-esports-accent/20 text-white"}
          onClick={() => setStatusFilter("approved")}
        >
          Approved
        </Button>
        <Button
          variant={statusFilter === "rejected" ? "default" : "outline"}
          className={statusFilter === "rejected" ? "bg-red-900 text-white" : "border-esports-accent/20 text-white"}
          onClick={() => setStatusFilter("rejected")}
        >
          Rejected
        </Button>
      </div>
      
      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{request.username}</h3>
                      <Badge
                        variant="outline"
                        className={
                          request.status === "pending"
                            ? "bg-amber-600/20 text-amber-400 border-none"
                            : request.status === "approved"
                              ? "bg-green-600/20 text-green-400 border-none"
                              : "bg-red-900/20 text-red-500 border-none"
                        }
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-300 mb-2">
                      <User className="h-4 w-4 mr-2 text-esports-accent" />
                      <span>{request.email}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-300 mb-4">
                      <Calendar className="h-4 w-4 mr-2 text-esports-accent" />
                      <span>Requested on {request.requestedOn}</span>
                      {request.processedOn && (
                        <span className="ml-4">Processed on {request.processedOn}</span>
                      )}
                    </div>
                    
                    <div className="bg-esports-darker p-3 rounded-md">
                      <p className="text-white text-sm">{request.reason}</p>
                    </div>
                  </div>
                  
                  {request.status === "pending" && (
                    <div className="flex items-center mt-4 md:mt-0 md:ml-4 space-x-2">
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      
                      <Button
                        variant="destructive"
                        className="bg-red-900 hover:bg-red-800"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No requests match your filter.</p>
          </div>
        )}
      </div>
      
      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        {requestDetails && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle className="text-lg">Approve Admin Request</DialogTitle>
              <DialogDescription className="text-gray-400">
                You are about to grant admin access to {requestDetails.username}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-esports-darker p-4 rounded-md my-4">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 mr-2 text-esports-accent" />
                <span className="font-medium text-white">This will grant user access to:</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-300 ml-7">
                <li>• Create and manage tournaments</li>
                <li>• View and edit user data</li>
                <li>• Send broadcast messages</li>
                <li>• Edit news and website settings</li>
              </ul>
            </div>
            
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsApproveDialogOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={confirmApproval}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Request
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        {requestDetails && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle>Reject Admin Request</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to reject the admin access request from {requestDetails.username}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsRejectDialogOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmRejection}
                className="bg-red-900 hover:bg-red-800"
              >
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRequests;
