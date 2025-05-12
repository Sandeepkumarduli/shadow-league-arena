
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, Mail, Phone, Shield, Ban, LockKeyhole, Check, X, Coins, Plus, Trophy, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

// Sample users data
const usersData = [
  {
    id: "1",
    username: "FireHawk22",
    email: "firehawk22@example.com",
    phone: "+91 98765 43210",
    registeredOn: "2023-08-15",
    lastActive: "2023-05-10",
    tournamentCount: 15,
    winCount: 4,
    status: "active",
    rdCoins: 2500
  },
  {
    id: "2",
    username: "StormRider",
    email: "stormrider@example.com",
    phone: "+91 87654 32109",
    registeredOn: "2023-09-20",
    lastActive: "2023-05-11",
    tournamentCount: 8,
    winCount: 2,
    status: "active",
    rdCoins: 1800
  },
  {
    id: "3",
    username: "ShadowNinja",
    email: "shadowninja@example.com",
    phone: "+91 76543 21098",
    registeredOn: "2023-10-05",
    lastActive: "2023-05-01",
    tournamentCount: 12,
    winCount: 0,
    status: "banned",
    rdCoins: 800
  },
  {
    id: "4",
    username: "ThunderBolt",
    email: "thunderbolt@example.com",
    phone: "+91 65432 10987",
    registeredOn: "2023-11-12",
    lastActive: "2023-05-12",
    tournamentCount: 6,
    winCount: 1,
    status: "active",
    rdCoins: 1200
  },
  {
    id: "5",
    username: "Sandeep",
    email: "sandeep.wpwb@gmail.com",
    phone: "+91 12345 67890",
    registeredOn: "2023-07-01",
    lastActive: "2023-05-14",
    tournamentCount: 20,
    winCount: 8,
    status: "active",
    rdCoins: 5000
  }
];

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(usersData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userToView, setUserToView] = useState<string | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendCoinsOpen, setIsSendCoinsOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  
  // Form states
  const [coinsAmount, setCoinsAmount] = useState("");
  const [coinsReason, setCoinsReason] = useState("");
  
  // New user form states
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Filter users based on selections
  const filteredUsers = users.filter(user => {
    // Apply status filter
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    
    // Apply search query (username, email or phone)
    if (searchQuery && 
        !user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.phone.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  // Find the currently selected user
  const selectedUser = userToView ? users.find(user => user.id === userToView) : null;

  const handleViewUser = (userId: string) => {
    setUserToView(userId);
    setIsUserDetailsOpen(true);
  };
  
  const handleBanUser = (userId: string) => {
    setUserToView(userId);
    setIsBanDialogOpen(true);
  };
  
  const handleDeleteUser = (userId: string) => {
    setUserToView(userId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmBanUser = () => {
    if (!userToView) return;
    
    // Toggle user status
    const updatedUsers = users.map(user => {
      if (user.id === userToView) {
        const newStatus = user.status === "banned" ? "active" : "banned";
        
        toast({
          title: `User ${newStatus === "active" ? "Unbanned" : "Banned"}`,
          description: `The user has been successfully ${newStatus === "active" ? "unbanned" : "banned"}.`,
        });
        
        return {
          ...user,
          status: newStatus
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    setIsBanDialogOpen(false);
  };

  const confirmDeleteUser = () => {
    if (!userToView) return;
    
    // Filter out the user to delete
    const updatedUsers = users.filter(user => user.id !== userToView);
    
    setUsers(updatedUsers);
    
    toast({
      title: "User Deleted",
      description: "The user has been permanently deleted.",
    });
    
    setIsDeleteDialogOpen(false);
  };
  
  const handleResetPassword = (userId: string) => {
    setUserToView(userId);
    setIsResetPasswordOpen(true);
  };
  
  const confirmResetPassword = () => {
    if (!userToView) return;
    
    toast({
      title: "Password Reset",
      description: "A password reset email has been sent to the user.",
    });
    
    setIsResetPasswordOpen(false);
  };
  
  const handleSendCoins = (userId: string) => {
    setUserToView(userId);
    setCoinsAmount("");
    setCoinsReason("");
    setIsSendCoinsOpen(true);
  };
  
  const confirmSendCoins = () => {
    if (!userToView || !coinsAmount || parseInt(coinsAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount of coins.",
        variant: "destructive",
      });
      return;
    }
    
    // Update user coins
    const updatedUsers = users.map(user => {
      if (user.id === userToView) {
        return {
          ...user,
          rdCoins: user.rdCoins + parseInt(coinsAmount)
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    toast({
      title: "Coins Sent",
      description: `${coinsAmount} rdCoins have been sent to the user.`,
    });
    
    setIsSendCoinsOpen(false);
  };
  
  const handleCreateUser = () => {
    // Form validation
    if (!newUsername.trim() || !newEmail.trim() || !newPhone.trim() || !newPassword.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      username: newUsername,
      email: newEmail,
      phone: newPhone,
      registeredOn: new Date().toISOString().split('T')[0],
      lastActive: "Never",
      tournamentCount: 0,
      winCount: 0,
      status: "active",
      rdCoins: 0
    };
    
    setUsers([...users, newUser]);
    
    toast({
      title: "User Created",
      description: `User "${newUsername}" has been created successfully.`,
    });
    
    // Reset form and close dialog
    setNewUsername("");
    setNewEmail("");
    setNewPhone("");
    setNewPassword("");
    setIsCreateUserOpen(false);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center text-gray-400 hover:text-white mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        </div>
        
        <Button
          onClick={() => setIsCreateUserOpen(true)}
          className="bg-esports-accent hover:bg-esports-accent/80 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <InputWithIcon
            placeholder="Search by username, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-esports-dark border-esports-accent/20 text-white"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              className={statusFilter === "all" ? "bg-esports-accent text-white" : "border-esports-accent/20 text-white"}
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              className={statusFilter === "active" ? "bg-green-600 text-white" : "border-esports-accent/20 text-white"}
              onClick={() => setStatusFilter("active")}
            >
              <Check className="mr-1 h-4 w-4" />
              Active
            </Button>
            <Button
              variant={statusFilter === "banned" ? "default" : "outline"}
              className={statusFilter === "banned" ? "bg-red-900 text-white" : "border-esports-accent/20 text-white"}
              onClick={() => setStatusFilter("banned")}
            >
              <Ban className="mr-1 h-4 w-4" />
              Banned
            </Button>
          </div>
        </div>
      </div>
      
      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id} className="bg-esports-dark border-esports-accent/20">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-esports-accent/20 rounded-full p-4 flex-shrink-0">
                      <User className="h-8 w-8 text-esports-accent" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{user.username}</h3>
                        <Badge variant={user.status === "active" ? "default" : "destructive"} className={user.status === "active" ? "bg-green-600/20 text-green-400 border-none" : "bg-red-900/20 border-none"}>
                          {user.status === "active" ? "Active" : "Banned"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 mt-2">
                        <div className="flex items-center text-sm text-gray-300">
                          <Mail className="h-4 w-4 mr-2 text-esports-accent" />
                          <span>{user.email}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-300">
                          <Phone className="h-4 w-4 mr-2 text-esports-accent" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center text-sm text-gray-300 bg-esports-darker px-2 py-1 rounded-md">
                          <Trophy className="h-4 w-4 mr-1 text-esports-accent" />
                          <span>Tournaments: {user.tournamentCount}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-300 bg-esports-darker px-2 py-1 rounded-md">
                          <Shield className="h-4 w-4 mr-1 text-esports-accent" />
                          <span>Wins: {user.winCount}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-yellow-500 bg-esports-darker px-2 py-1 rounded-md">
                          <Coins className="h-4 w-4 mr-1" />
                          <span>{user.rdCoins} rdCoins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center mt-4 lg:mt-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
                      onClick={() => handleViewUser(user.id)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => handleSendCoins(user.id)}
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Send Coins
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      <LockKeyhole className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    
                    <Button
                      variant={user.status === "banned" ? "outline" : "destructive"}
                      size="sm"
                      className={user.status === "banned" 
                        ? "border-green-500/20 text-green-400 hover:bg-green-500/10" 
                        : "bg-red-900/20 hover:bg-red-900/40 text-red-500"}
                      onClick={() => handleBanUser(user.id)}
                    >
                      {user.status === "banned" ? <Check className="h-4 w-4 mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                      {user.status === "banned" ? "Unban" : "Ban"}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-900/20 hover:bg-red-900/40 text-red-500"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No users match your filters.</p>
          </div>
        )}
      </div>
      
      {/* Send Coins Dialog */}
      <Dialog open={isSendCoinsOpen} onOpenChange={setIsSendCoinsOpen}>
        {selectedUser && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                Send rdCoins to {selectedUser.username}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Current balance: {selectedUser.rdCoins} rdCoins
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-2">
              <div>
                <Label htmlFor="amount" className="text-white">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="Enter amount of rdCoins"
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                  value={coinsAmount}
                  onChange={(e) => setCoinsAmount(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="reason" className="text-white">Reason (optional)</Label>
                <Input
                  id="reason"
                  placeholder="Enter reason for sending coins"
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                  value={coinsReason}
                  onChange={(e) => setCoinsReason(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsSendCoinsOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={confirmSendCoins}
                className="bg-esports-accent hover:bg-esports-accent/80"
              >
                Send rdCoins
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Fill in the details to create a new user account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-white">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateUserOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleCreateUser}
              className="bg-esports-accent hover:bg-esports-accent/80"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        {selectedUser && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                {selectedUser.username}
                <Badge variant={selectedUser.status === "active" ? "default" : "destructive"} className={selectedUser.status === "active" ? "bg-green-600/20 text-green-400 border-none" : "bg-red-900/20 border-none"}>
                  {selectedUser.status === "active" ? "Active" : "Banned"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                User ID: {selectedUser.id} • Registered on {selectedUser.registeredOn}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <h4 className="text-lg font-semibold">Contact Information</h4>
                <div className="bg-esports-darker p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <Mail className="h-4 w-4 mr-2 text-esports-accent" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-esports-accent" />
                    <span className="text-sm">{selectedUser.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-semibold">Account Activity</h4>
                <div className="bg-esports-darker p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-400">Last Active</p>
                      <p className="text-sm">{selectedUser.lastActive}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">rdCoins Balance</p>
                      <p className="text-sm text-yellow-500">{selectedUser.rdCoins}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Tournaments</p>
                      <p className="text-sm">{selectedUser.tournamentCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Wins</p>
                      <p className="text-sm">{selectedUser.winCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUserDetailsOpen(false)}
                className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        {selectedUser && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription className="text-gray-400">
                This will send a password reset link to {selectedUser.email}. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsResetPasswordOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={confirmResetPassword}
                className="bg-esports-accent hover:bg-esports-accent/80"
              >
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        {selectedUser && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle>
                {selectedUser.status === "banned" ? "Unban User" : "Ban User"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedUser.status === "banned" 
                  ? `This will restore ${selectedUser.username}'s access to the platform.` 
                  : `This will prevent ${selectedUser.username} from accessing the platform.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsBanDialogOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant={selectedUser.status === "banned" ? "default" : "destructive"}
                onClick={confirmBanUser}
                className={selectedUser.status === "banned" 
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-900 hover:bg-red-800"}
              >
                {selectedUser.status === "banned" ? "Unban User" : "Ban User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        {selectedUser && (
          <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
            <DialogHeader>
              <DialogTitle className="text-red-500">Delete User</DialogTitle>
              <DialogDescription className="text-gray-400">
                This will permanently delete {selectedUser.username} and all associated data. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteUser}
                className="bg-red-900 hover:bg-red-800"
              >
                <Trash className="mr-2 h-4 w-4" />
                Permanently Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
