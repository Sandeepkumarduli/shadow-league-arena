
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { fetchCurrentUser } from "@/services/authService";
import { User } from "@/services/userService";

const AdminProfile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    bgmiid: "",
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!authUser) return;
      
      try {
        const userData = await fetchCurrentUser();
        if (userData) {
          setUser(userData);
          setFormData({
            username: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            bgmiid: userData.bgmiid || "",
          });
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        toast({
          title: "Failed to load profile",
          description: "There was an error loading your profile information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !authUser) return;
    
    setIsSaving(true);
    
    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from("users")
        .update({
          username: formData.username,
          phone: formData.phone,
          bgmiid: formData.bgmiid,
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      // Update email if changed (requires authentication)
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        
        if (emailError) throw emailError;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[500px]">
          <Loader2 className="h-8 w-8 text-[#1977d4] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information Card */}
        <div className="md:col-span-2">
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bgmiid" className="text-white">BGMI ID (Optional)</Label>
                    <Input
                      id="bgmiid"
                      name="bgmiid"
                      value={formData.bgmiid || ""}
                      onChange={handleChange}
                      className="bg-esports-darker border-esports-accent/20 text-white"
                      placeholder="Enter your BGMI ID"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    className="bg-[#1977d4] hover:bg-[#1977d4]/80"
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Avatar Card */}
        <div>
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader>
              <CardTitle className="text-white">Profile Picture</CardTitle>
              <CardDescription>Update your profile image</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-2 border-esports-accent/30">
                <AvatarImage src="" />
                <AvatarFallback className="bg-esports-accent/10 text-esports-accent text-4xl">
                  {user?.username?.charAt(0).toUpperCase() || authUser?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-6 space-y-4 w-full">
                <Button
                  variant="outline"
                  className="w-full border-[#1977d4]/30 text-white hover:text-[#1977d4]"
                >
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-500/20 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  Remove Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
