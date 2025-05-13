
import { useState, useEffect } from "react";
import { UserPlus, Trash2, Check, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Admin {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
}

const AdminUsers = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, is_admin')
        .eq('is_admin', true);

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Failed to fetch admins",
        description: "There was an error fetching the admin list.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Make a user an admin
  const addAdmin = async () => {
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
      // First check if the user exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, is_admin')
        .eq('email', newAdminEmail.trim())
        .single();

      if (userError) {
        toast({
          title: "User not found",
          description: "No user exists with this email address.",
          variant: "destructive",
        });
        return;
      }

      if (userData.is_admin) {
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
        .eq('id', userData.id);

      if (updateError) throw updateError;

      toast({
        title: "Admin added",
        description: "User has been successfully granted admin privileges.",
      });
      
      setNewAdminEmail("");
      fetchAdmins(); // Refresh the admin list
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

  // Remove admin privileges
  const removeAdmin = async (adminId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: false })
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Admin removed",
        description: `${username} no longer has admin privileges.`,
      });
      
      fetchAdmins(); // Refresh the admin list
    } catch (error) {
      console.error("Error removing admin:", error);
      toast({
        title: "Failed to remove admin",
        description: "There was an error removing admin privileges.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Manage Admins</h1>
        
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader>
            <CardTitle className="text-white">Add New Admin</CardTitle>
            <CardDescription>Grant admin privileges to existing users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="User email address"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="bg-esports-darker border-[#1977d4]/30"
              />
              <Button 
                onClick={addAdmin} 
                disabled={isSubmitting}
                className="bg-[#1977d4] hover:bg-[#1977d4]/80"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isSubmitting ? "Adding..." : "Add Admin"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader>
            <CardTitle className="text-white">Current Admins</CardTitle>
            <CardDescription>Manage existing admin users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-400">Loading admins...</p>
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-400">No admins found. Add your first admin above.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-700">
                    <TableHead className="text-gray-400">Username</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id} className="border-b border-gray-700">
                      <TableCell className="text-white">{admin.username}</TableCell>
                      <TableCell className="text-white">{admin.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-500">Admin</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdmin(admin.id, admin.username)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove admin</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
