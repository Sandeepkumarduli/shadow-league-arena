
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    bgmiid: "",
  });

  const fetchProfileData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, email, phone, bgmiid')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfileData({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          bgmiid: data.bgmiid || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Failed to load profile",
        description: "There was an error loading your profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: profileData.username,
          phone: profileData.phone,
          bgmiid: profileData.bgmiid,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: "There was an error updating your profile information.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardHeader>
                <CardTitle className="text-white">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-6">
                <div className="mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-esports-accent text-2xl font-bold">
                      {profileData.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">{profileData.username}</h3>
                  <p className="text-gray-400">{profileData.email}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Check className="h-4 w-4 text-esports-accent" />
                    <span className="text-esports-accent text-sm">Admin</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    readOnly
                    disabled
                    className="bg-esports-darker border-esports-accent/20 text-gray-400 mt-1 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bgmiid" className="text-white">BGMI ID</Label>
                  <Input
                    id="bgmiid"
                    value={profileData.bgmiid}
                    onChange={(e) => handleInputChange("bgmiid", e.target.value)}
                    className="bg-esports-darker border-esports-accent/20 text-white mt-1"
                    placeholder="Enter your BGMI ID (optional)"
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="bg-esports-accent hover:bg-esports-accent/80"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
