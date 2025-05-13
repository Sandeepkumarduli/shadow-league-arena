
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Shield, Eye, EyeOff, Key, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminAccount = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  const [passwordErrors, setPasswordErrors] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Fetch account info
  const fetchAccountInfo = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast({
        title: "Failed to load account info",
        description: "There was an error loading your account information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
    
    // Set up realtime subscription for wallet changes
    if (user?.id) {
      const walletChannel = supabase
        .channel('wallet_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Wallet updated:', payload);
            // Update the balance when it changes
            if (payload.new && payload.new.balance !== undefined) {
              setBalance(payload.new.balance);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(walletChannel);
      };
    }
  }, [user?.id]);

  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when typing
    setPasswordErrors(prev => ({
      ...prev,
      [field]: ""
    }));
  };

  const validatePasswords = () => {
    let isValid = true;
    const newErrors = { ...passwordErrors };
    
    // Validate current password
    if (!passwords.current.trim()) {
      newErrors.current = "Current password is required";
      isValid = false;
    }
    
    // Validate new password
    if (!passwords.new.trim()) {
      newErrors.new = "New password is required";
      isValid = false;
    } else if (passwords.new.length < 6) {
      newErrors.new = "Password must be at least 6 characters";
      isValid = false;
    }
    
    // Validate password confirmation
    if (!passwords.confirm.trim()) {
      newErrors.confirm = "Please confirm your new password";
      isValid = false;
    } else if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Passwords do not match";
      isValid = false;
    }
    
    setPasswordErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;
    
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      
      // Clear the form
      setPasswords({
        current: "",
        new: "",
        confirm: ""
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Password Change Failed",
        description: error?.message || "There was an error changing your password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
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
          <h1 className="text-2xl font-bold text-white">My Account</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardHeader>
                <CardTitle className="text-white">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Type:</span>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-esports-accent" />
                    <span className="text-esports-accent">Admin</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-esports-accent font-bold">{balance} rdCoins</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardHeader>
                <CardTitle className="text-white">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="warning" className="bg-amber-900/20 border-amber-400/20">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <AlertTitle className="text-amber-400">Security Notice</AlertTitle>
                  <AlertDescription className="text-amber-300/80">
                    Choose a strong password that you don't use elsewhere.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => handlePasswordChange("current", e.target.value)}
                      className="bg-esports-darker border-esports-accent/20 text-white pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.current && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.current}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="newPassword" className="text-white">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => handlePasswordChange("new", e.target.value)}
                      className="bg-esports-darker border-esports-accent/20 text-white pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.new && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.new}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                      className="bg-esports-darker border-esports-accent/20 text-white pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirm && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.confirm}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="bg-esports-accent hover:bg-esports-accent/80 flex items-center"
                >
                  <Key className="mr-2 h-4 w-4" />
                  {isChangingPassword ? "Changing Password..." : "Change Password"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAccount;
