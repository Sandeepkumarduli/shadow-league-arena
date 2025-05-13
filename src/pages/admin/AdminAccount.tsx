
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import { Lock, LogOut, User } from "lucide-react";

export default function AdminAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      });
      
      // Reset password fields and close dialog
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordDialog(false);
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "There was a problem changing your password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message || "There was a problem logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1">
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 border-2 border-esports-accent/30">
                <AvatarImage src="" />
                <AvatarFallback className="bg-esports-accent/10 text-esports-accent text-2xl">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-white font-medium text-lg">
                {user?.email?.split('@')[0]}
              </h3>
              <p className="text-gray-400 mt-1">
                {user?.email}
              </p>
              <p className="text-gray-500 mt-2">
                Admin Account
              </p>
              
              <div className="mt-6 w-full">
                <Button
                  variant="outline"
                  className="w-full border-[#1977d4]/30 text-white hover:text-[#1977d4]"
                  onClick={() => navigate('/admin/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1">
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader>
              <CardTitle className="text-white">Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-2">Password</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Change your account password
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#1977d4]/30 text-white hover:text-[#1977d4]"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-2">Account Access</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Log out from your account
                </p>
                <Button
                  variant="outline"
                  className="w-full border-red-900/30 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 lg:col-span-1 md:col-span-2">
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader>
              <CardTitle className="text-white">Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Email Notifications</h4>
                    <p className="text-gray-400 text-sm">
                      Receive notifications about account activity
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-[#1977d4]/30 hover:border-[#1977d4]"
                  >
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">In-App Notifications</h4>
                    <p className="text-gray-400 text-sm">
                      Control your in-app notification settings
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-[#1977d4]/30 hover:border-[#1977d4]"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Change Password Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent className="bg-esports-dark border-esports-accent/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Change Password</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Enter your current password and a new password below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="currentPassword" className="text-white text-sm font-medium">
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 bg-esports-darker border-[#1977d4]/20 text-white"
                autoComplete="current-password"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="text-white text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 bg-esports-darker border-[#1977d4]/20 text-white"
                autoComplete="new-password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-esports-darker border-[#1977d4]/20 text-white"
                autoComplete="new-password"
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-white hover:bg-esports-darker" disabled={isChangingPassword}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleChangePassword();
              }}
              className="bg-[#1977d4] hover:bg-[#1977d4]/80"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-esports-dark border-esports-accent/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Log Out</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-white hover:bg-esports-darker">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

// Import Supabase client for password change functionality
import { supabase } from "@/integrations/supabase/client";
