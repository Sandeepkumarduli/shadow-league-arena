
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Globe, Palette, CreditCard, AlertCircle, Trash, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Switch,
} from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  
  // General settings
  const [siteName, setSiteName] = useState("NexusArena");
  const [siteDescription, setSiteDescription] = useState("The ultimate esports tournament platform");
  const [supportEmail, setSupportEmail] = useState("support@nexusarena.com");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Appearance settings
  const [primaryColor, setPrimaryColor] = useState("#1977d4");
  const [darkMode, setDarkMode] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
  
  // Payment settings
  const [stripeKey, setStripeKey] = useState("pk_test_***********************");
  const [razorpayKey, setRazorpayKey] = useState("rzp_test_***********************");
  const [minDeposit, setMinDeposit] = useState("100");
  const [maxDeposit, setMaxDeposit] = useState("10000");
  const [conversionRate, setConversionRate] = useState("1"); // 1 INR = 1 rdCoin
  
  // Notice settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("The site is currently undergoing scheduled maintenance. Please check back later.");
  const [announcementBanner, setAnnouncementBanner] = useState(true);
  const [announcementText, setAnnouncementText] = useState("🎉 New BGMI Tournament with 5,000 rdCoins prize pool starting next week!");
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target) {
          setLogoPreview(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings Saved",
        description: "Your changes have been successfully saved.",
      });
      
      setIsSaving(false);
    }, 1000);
  };
  
  const handleClearLogo = () => {
    setLogoPreview(null);
    
    toast({
      title: "Logo Cleared",
      description: "The logo has been removed.",
    });
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
          <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        </div>
        
        <Button 
          className="bg-esports-accent hover:bg-esports-accent/80 text-white"
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-esports-dark mx-auto mb-6 w-full justify-start">
          <TabsTrigger 
            value="general"
            className="data-[state=active]:bg-esports-accent data-[state=active]:text-white text-gray-300"
          >
            <Globe className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="appearance" 
            className="data-[state=active]:bg-esports-accent data-[state=active]:text-white text-gray-300"
          >
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger 
            value="payment" 
            className="data-[state=active]:bg-esports-accent data-[state=active]:text-white text-gray-300"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger 
            value="notices" 
            className="data-[state=active]:bg-esports-accent data-[state=active]:text-white text-gray-300"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Notices
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <div className="space-y-6">
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardHeader>
                <CardTitle className="text-white">General Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure basic information about your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-white">Site Name</Label>
                    <Input
                      id="siteName"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail" className="text-white">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    className="bg-esports-darker border-esports-accent/20 text-white resize-none h-20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-white">Site Logo</Label>
                  <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="bg-esports-darker border-esports-accent/20 text-white"
                      />
                    </div>
                    
                    {logoPreview && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-900/20 hover:bg-red-900/40 text-red-500 w-full md:w-auto"
                        onClick={handleClearLogo}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Clear Logo
                      </Button>
                    )}
                  </div>
                  
                  {logoPreview && (
                    <div className="mt-4 bg-esports-darker p-4 rounded-md flex items-center justify-center">
                      <img 
                        src={logoPreview} 
                        alt="Logo Preview" 
                        className="max-h-20"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardHeader>
                <CardTitle className="text-white">Appearance Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Customize how your site looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-white">Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-esports-darker border-esports-accent/20 text-white w-16 h-10 p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                    <div 
                      className="w-10 h-10 rounded-md"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10 pt-4">
                  <div className="flex items-center justify-between md:justify-start gap-2 md:flex-1">
                    <div className="flex flex-col">
                      <Label htmlFor="darkMode" className="text-white mb-1">Dark Mode</Label>
                      <span className="text-xs text-gray-400">Enable dark theme by default</span>
                    </div>
                    <Switch 
                      id="darkMode"
                      checked={darkMode} 
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-start gap-2 md:flex-1">
                    <div className="flex flex-col">
                      <Label htmlFor="enableAnimations" className="text-white mb-1">Enable Animations</Label>
                      <span className="text-xs text-gray-400">Use animations throughout the site</span>
                    </div>
                    <Switch 
                      id="enableAnimations"
                      checked={enableAnimations} 
                      onCheckedChange={setEnableAnimations}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payment">
          <div className="space-y-6">
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardHeader>
                <CardTitle className="text-white">Payment Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure payment gateways and coin system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-1 flex justify-between items-center">
                      <Label htmlFor="stripeKey" className="text-white">Stripe API Key</Label>
                      <Badge className="bg-green-600/20 text-green-400 border-none">Active</Badge>
                    </div>
                    <Input
                      id="stripeKey"
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      type="password"
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                  </div>
                  
                  <div>
                    <div className="mb-1 flex justify-between items-center">
                      <Label htmlFor="razorpayKey" className="text-white">Razorpay API Key</Label>
                      <Badge className="bg-green-600/20 text-green-400 border-none">Active</Badge>
                    </div>
                    <Input
                      id="razorpayKey"
                      value={razorpayKey}
                      onChange={(e) => setRazorpayKey(e.target.value)}
                      type="password"
                      className="bg-esports-darker border-esports-accent/20 text-white"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-white font-medium mb-4">rdCoin Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minDeposit" className="text-white">Minimum Deposit (INR)</Label>
                      <Input
                        id="minDeposit"
                        value={minDeposit}
                        onChange={(e) => setMinDeposit(e.target.value)}
                        type="number"
                        className="bg-esports-darker border-esports-accent/20 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxDeposit" className="text-white">Maximum Deposit (INR)</Label>
                      <Input
                        id="maxDeposit"
                        value={maxDeposit}
                        onChange={(e) => setMaxDeposit(e.target.value)}
                        type="number"
                        className="bg-esports-darker border-esports-accent/20 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="conversionRate" className="text-white">Conversion Rate (1 INR = X rdCoins)</Label>
                      <Input
                        id="conversionRate"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(e.target.value)}
                        type="number"
                        className="bg-esports-darker border-esports-accent/20 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notice Settings */}
        <TabsContent value="notices">
          <div className="space-y-6">
            <Card className="bg-esports-dark border-esports-accent/20">
              <CardHeader>
                <CardTitle className="text-white">Notice Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Configure site-wide notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10">
                  <div className="flex items-center justify-between md:justify-start gap-2 flex-1">
                    <div className="flex flex-col">
                      <Label htmlFor="maintenanceMode" className="text-white mb-1">Maintenance Mode</Label>
                      <span className="text-xs text-gray-400">Make the site inaccessible to normal users</span>
                    </div>
                    <Switch 
                      id="maintenanceMode"
                      checked={maintenanceMode} 
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage" className="text-white">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className="bg-esports-darker border-esports-accent/20 text-white resize-none h-20"
                    disabled={!maintenanceMode}
                  />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="announcementBanner" className="text-white">Announcement Banner</Label>
                    <Switch 
                      id="announcementBanner"
                      checked={announcementBanner} 
                      onCheckedChange={setAnnouncementBanner}
                    />
                  </div>
                  
                  <Input
                    id="announcementText"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="bg-esports-darker border-esports-accent/20 text-white"
                    placeholder="Enter announcement text"
                    disabled={!announcementBanner}
                  />
                  
                  {announcementBanner && (
                    <div className="mt-4 bg-esports-accent/20 border border-esports-accent/30 p-3 rounded-md text-center">
                      <p className="text-white">{announcementText}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
