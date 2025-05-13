
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

// Form schema with validation
const profileSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must have at least 10 digits"),
  bgmiId: z.string().min(1, "BGMI ID is required"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // If any password field is filled, then all password fields are required
  if (data.currentPassword || data.newPassword || data.confirmPassword) {
    return !!data.currentPassword && !!data.newPassword && !!data.confirmPassword;
  }
  return true;
}, {
  message: "All password fields must be filled to change password",
  path: ["currentPassword"],
}).refine((data) => {
  // If new password is provided, it must match confirm password
  if (data.newPassword && data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Define a type for user data from the database
interface UserData {
  username: string;
  email: string;
  phone: string;
  bgmiId: string | null;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    phone: "",
    bgmiId: "",
  });
  
  const { user } = useAuth();

  // Default values for the form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phoneNumber: "",
      bgmiId: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        console.log("Fetching user data for ID:", user.id);
        
        const { data, error } = await supabase
          .from('users')
          .select('username, email, phone, bgmiid')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: "Error",
            description: "Failed to load user data. Please try again later.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        if (!data) {
          console.error('No user data found');
          toast({
            title: "Error",
            description: "User data not found.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        console.log("User data fetched:", data);
        
        // Ensure we have valid data and map bgmiid to bgmiId for consistency in our code
        const userDataObj: UserData = {
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          bgmiId: data.bgmiid || "", // Note the lowercase 'id' here
        };
        
        setUserData(userDataObj);
        
        // Update form with fetched data
        form.setValue("phoneNumber", userDataObj.phone);
        form.setValue("bgmiId", userDataObj.bgmiId || "");

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again later.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Updating profile with data:", data);
      
      // Update user phone and bgmiId in the database - use lowercase bgmiid for the DB
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone: data.phoneNumber,
          bgmiid: data.bgmiId // Note the lowercase 'id' here
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }
      
      // Handle password change if requested
      if (data.currentPassword && data.newPassword) {
        console.log("Attempting to update password");
        
        // First verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email || "",
          password: data.currentPassword
        });
        
        if (signInError) {
          console.error("Current password verification failed:", signInError);
          toast({
            title: "Error",
            description: "Current password is incorrect.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        // Update password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.newPassword,
        });
        
        if (passwordError) {
          console.error("Password update error:", passwordError);
          throw passwordError;
        }
        
        console.log("Password updated successfully");
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
      
      // If password fields are filled, clear them after successful update
      if (data.currentPassword) {
        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
        form.setValue("confirmPassword", "");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        <div className="max-w-2xl">
          {/* Display username and email as view-only fields */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white border-b border-esports-accent/20 pb-2">
              Account Information (View Only)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Username</label>
                {isLoading ? (
                  <Skeleton className="h-9 w-full bg-esports-dark/50" />
                ) : (
                  <div className="p-2 bg-esports-dark/50 border border-esports-accent/20 rounded-md text-gray-300">
                    {userData.username}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-1">Email</label>
                {isLoading ? (
                  <Skeleton className="h-9 w-full bg-esports-dark/50" />
                ) : (
                  <div className="p-2 bg-esports-dark/50 border border-esports-accent/20 rounded-md text-gray-300">
                    {userData.email}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-esports-accent/20 pb-2">
                  Game Information
                </h3>
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Phone Number *</FormLabel>
                      <FormControl>
                        {isLoading ? (
                          <Skeleton className="h-9 w-full bg-esports-dark/50" />
                        ) : (
                          <Input 
                            placeholder="Enter your phone number" 
                            {...field} 
                            className="bg-esports-dark border-esports-accent/30 text-white"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bgmiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">BGMI ID *</FormLabel>
                      <FormControl>
                        {isLoading ? (
                          <Skeleton className="h-9 w-full bg-esports-dark/50" />
                        ) : (
                          <Input 
                            placeholder="Enter your BGMI ID" 
                            {...field} 
                            className="bg-esports-dark border-esports-accent/30 text-white"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-esports-accent/20 pb-2">
                  Change Password (Optional)
                </h3>
                
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Current Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter current password" 
                          {...field} 
                          className="bg-esports-dark border-esports-accent/30 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter new password" 
                          {...field} 
                          className="bg-esports-dark border-esports-accent/30 text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400 text-xs">
                        Password must be at least 8 characters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm new password" 
                          {...field} 
                          className="bg-esports-dark border-esports-accent/30 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="bg-esports-accent hover:bg-esports-accent-hover text-white w-full sm:w-auto"
                  disabled={isLoading || isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
