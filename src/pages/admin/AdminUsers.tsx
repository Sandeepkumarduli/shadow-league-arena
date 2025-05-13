
import { useState, useEffect } from "react";
import { User, Trash2, Check, Edit, UserPlus, UserMinus, Shield } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RefreshButton from "@/components/RefreshButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Search } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
  balance: number;
  bgmiid?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);

  // Fetch all users
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      // First get users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Then fetch their wallet balances
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('user_id, balance');
        
      if (walletsError) throw walletsError;
      
      // Create a map of user_id to balance
      const balanceMap = (wallets || []).reduce(
        (map, wallet) => ({ ...map, [wallet.user_id]: wallet.balance || 0 }), 
        {} as Record<string, number>
      );
      
      // Combine user data with balance
      const usersWithBalance = users ? users.map(user => ({
        ...user,
        balance: balanceMap[user.id] || 0
      })) : [];
      
      console.log("Fetched users:", usersWithBalance);
      setUsers(usersWithBalance || []);
      setFilteredUsers(usersWithBalance || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Failed to fetch users",
        description: "There was an error loading the user list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    
    // Set up real-time subscription with improved error handling
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          console.log("Users table updated, refreshing users list");
          fetchAllUsers();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const results = users.filter((user) => {
      return (
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredUsers(results);
  }, [searchQuery, users]);

  // Make a user an admin
  const handleMakeAdmin = async (user: User) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Admin permissions granted",
        description: `${user.username} is now an admin.`,
      });
      fetchAllUsers();
    } catch (error) {
      console.error("Error making admin:", error);
      toast({
        title: "Failed to update permissions",
        description: "There was an error granting admin permissions.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove admin privileges
  const handleRemoveAdmin = async (user: User) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: false })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Admin permissions revoked",
        description: `${user.username} is no longer an admin.`,
      });
      fetchAllUsers();
    } catch (error) {
      console.error("Error removing admin:", error);
      toast({
        title: "Failed to update permissions",
        description: "There was an error removing admin permissions.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit user
  const handleEditUser = (user: User) => {
    setSelectedUser({...user});
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: selectedUser.username,
          email: selectedUser.email,
          phone: selectedUser.phone,
          bgmiid: selectedUser.bgmiid,
        })
        .eq('id', selectedUser.id);
        
      if (error) throw error;
      
      toast({
        title: "User Updated",
        description: `User ${selectedUser.username} has been updated.`,
      });
      setIsEditDialogOpen(false);
      fetchAllUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the user.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      // Delete user (this will cascade delete related records due to foreign key constraints)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);
        
      if (error) throw error;
      
      toast({
        title: "User Deleted",
        description: `User ${selectedUser.username} has been deleted.`,
      });
      
      setIsDeleteDialogOpen(false);
      fetchAllUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the user.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new admin by email
  const addAdminByEmail = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, is_admin, username')
        .eq('email', newAdminEmail.trim())
        .single();

      if (error || !data) {
        toast({
          title: "User not found",
          description: "No user exists with this email address.",
          variant: "destructive",
        });
        return;
      }

      if (data.is_admin) {
        toast({
          title: "Already an admin",
          description: "This user is already an administrator.",
          variant: "default",
        });
        return;
      }

      // Update the user to make them an admin
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', data.id);
        
      if (updateError) throw updateError;

      toast({
        title: "Admin added",
        description: `${data.username} has been granted admin privileges.`,
      });
      
      setNewAdminEmail("");
      setIsAddAdminDialogOpen(false);
      fetchAllUsers();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        title: "Failed to add admin",
        description: "There was an error granting admin privileges.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!selectedUser) return;
    
    setSelectedUser({
      ...selectedUser,
      [field]: value
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsAddAdminDialogOpen(true)}
              className="bg-esports-accent hover:bg-esports-accent/80"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
            <RefreshButton onRefresh={fetchAllUsers} />
          </div>
        </div>
        
        <div className="mb-6">
          <InputWithIcon
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-esports-dark border-esports-accent/20 text-white"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader>
            <CardTitle className="text-white">All Users</CardTitle>
            <CardDescription>Manage all users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400">No users found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-700">
                    <TableHead className="text-gray-400">Username</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Phone</TableHead>
                    <TableHead className="text-gray-400">Balance</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-b border-gray-700">
                      <TableCell className="text-white">{user.username}</TableCell>
                      <TableCell className="text-white">{user.email}</TableCell>
                      <TableCell className="text-white">{user.phone}</TableCell>
                      <TableCell className="text-white">{user.balance} rdCoins</TableCell>
                      <TableCell>
                        {user.is_admin ? (
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-esports-accent mr-1" />
                            <span className="text-esports-accent">Admin</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-400">User</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit user</span>
                          </Button>
                          
                          {user.is_admin ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAdmin(user)}
                              className="text-yellow-500 hover:text-yellow-700 hover:bg-yellow-900/20"
                              disabled={isSubmitting}
                            >
                              <UserMinus className="h-4 w-4" />
                              <span className="sr-only">Remove admin</span>
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMakeAdmin(user)}
                              className="text-esports-accent hover:text-esports-accent/80 hover:bg-esports-accent/10"
                              disabled={isSubmitting}
                            >
                              <UserPlus className="h-4 w-4" />
                              <span className="sr-only">Make admin</span>
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete user</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Admin Dialog */}
      <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the email address of the user you want to grant admin privileges to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="adminEmail" className="text-white">Email Address</Label>
            <Input
              id="adminEmail"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="user@example.com"
              className="bg-esports-darker border-esports-accent/20 text-white mt-2"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAddAdminDialogOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={addAdminByEmail} 
              disabled={isSubmitting || !newAdminEmail.trim()}
              className="bg-esports-accent hover:bg-esports-accent/80"
            >
              {isSubmitting ? "Adding..." : "Add Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Make changes to user information below.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={selectedUser.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  value={selectedUser.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-white">Phone</Label>
                <Input
                  id="phone"
                  value={selectedUser.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="bgmiid" className="text-white">BGMI ID</Label>
                <Input
                  id="bgmiid"
                  value={selectedUser.bgmiid || ""}
                  onChange={(e) => handleInputChange("bgmiid", e.target.value)}
                  className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="bg-esports-accent hover:bg-esports-accent/80"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedUser?.username}? This action cannot be undone and will delete all associated data.
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
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
