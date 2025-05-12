
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { User, Coins, Users, Trophy, Edit, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const MyAccount = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState("John Doe");
  const [isEditingGames, setIsEditingGames] = useState(false);
  const [gameInput, setGameInput] = useState('');
  const [interestGames, setInterestGames] = useState(["BGMI", "Valorant", "Call of Duty"]);

  // Mock user data - in a real app, this would come from context or API
  const userData = {
    name: name,
    username: "ProGamer123",
    email: "progamer@example.com",
    phone: "1234567890",
    profileImage: "", // URL would be here
    interestGames: interestGames,
    teams: ["Phoenix Squad", "Valorant Vipers"],
    registeredTournaments: 15,
    completedTournaments: 8,
    wins: 3,
    rdCoins: 500,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (1MB = 1048576 bytes)
      if (selectedFile.size > 1048576) {
        toast({
          title: "File too large",
          description: "Profile picture must be less than 1MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully!",
      });
      setFile(null);
    }, 1500);
  };

  const handleAddCoins = () => {
    navigate("/add-coins");
  };

  const handleRedeem = () => {
    // Open redeem modal - in a real app, this would show a modal
    toast({
      title: "Redeem Feature",
      description: "Redeem functionality will be available soon!",
    });
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    toast({
      title: "Name Updated",
      description: "Your name has been updated successfully!",
    });
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameInput && !interestGames.includes(gameInput)) {
      setInterestGames([...interestGames, gameInput]);
      setGameInput('');
      toast({
        title: "Game Added",
        description: `"${gameInput}" added to your interested games!`,
      });
    }
  };

  const handleRemoveGame = (game: string) => {
    setInterestGames(interestGames.filter(g => g !== game));
    toast({
      title: "Game Removed",
      description: `"${game}" removed from your interested games!`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center text-gray-400 hover:text-white mr-4"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">My Account</h1>
            <p className="text-gray-400">View and manage your account details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Profile Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-esports-dark rounded-lg border border-[#1977d4]/20 p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-24 w-24 border-2 border-[#1977d4]">
                    <AvatarImage src={userData.profileImage} alt={userData.name} />
                    <AvatarFallback className="bg-[#1977d4]/20 text-[#1977d4] text-xl">
                      {userData.name.split(' ').map(name => name[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input 
                      id="picture" 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="picture" 
                      className="cursor-pointer text-sm text-[#1977d4] hover:text-[#1977d4]/80"
                    >
                      Change Picture
                    </label>
                  </div>
                  {file && (
                    <div className="flex gap-2">
                      <span className="text-xs text-gray-400 truncate max-w-[150px]">{file.name}</span>
                      <Button 
                        onClick={handleUpload} 
                        size="sm" 
                        className="text-xs h-6 px-2 bg-[#1977d4] hover:bg-[#1977d4]/80"
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    {isEditingName ? (
                      <div className="space-y-2 w-full">
                        <label className="block text-sm font-medium text-gray-400">Name</label>
                        <div className="flex gap-2">
                          <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="bg-esports-darker border-[#1977d4]/30"
                          />
                          <Button 
                            onClick={handleSaveName}
                            size="sm"
                            className="bg-[#1977d4] hover:bg-[#1977d4]/80"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-white text-center md:text-left">{userData.name}</h2>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 text-xs text-[#1977d4] hover:text-[#1977d4]/80 hover:bg-[#1977d4]/10 p-1 h-auto"
                          onClick={() => setIsEditingName(true)}
                        >
                          <Edit className="h-3 w-3" />
                          Edit Name
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Username</label>
                      <p className="text-white">{userData.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Email</label>
                      <p className="text-white">{userData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Phone</label>
                      <p className="text-white">{userData.phone}</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-400">Interested Games</label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 text-xs text-[#1977d4] hover:text-[#1977d4]/80 hover:bg-[#1977d4]/10 p-1 h-auto"
                          onClick={() => setIsEditingGames(!isEditingGames)}
                        >
                          <Edit className="h-3 w-3" />
                          {isEditingGames ? "Done" : "Edit Games"}
                        </Button>
                      </div>
                      
                      {isEditingGames ? (
                        <div className="mt-2 space-y-3">
                          <form onSubmit={handleAddGame} className="flex gap-2">
                            <Input 
                              placeholder="Add a game" 
                              value={gameInput} 
                              onChange={(e) => setGameInput(e.target.value)}
                              className="flex-1 bg-esports-darker border-[#1977d4]/30 text-sm"
                            />
                            <Button 
                              type="submit" 
                              size="sm"
                              className="bg-[#1977d4] hover:bg-[#1977d4]/80"
                            >
                              Add
                            </Button>
                          </form>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {interestGames.map((game) => (
                              <Badge 
                                key={game} 
                                className="bg-[#1977d4]/20 text-[#1977d4] hover:bg-[#1977d4]/30 cursor-pointer flex items-center gap-1"
                                onClick={() => handleRemoveGame(game)}
                              >
                                {game}
                                {isEditingGames && <span className="ml-1">×</span>}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {userData.interestGames.map((game) => (
                            <span key={game} className="inline-block bg-[#1977d4]/20 text-[#1977d4] text-xs px-2 py-1 rounded">
                              {game}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams Card */}
            <div className="bg-esports-dark rounded-lg border border-[#1977d4]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#1977d4]" />
                  <h2 className="text-lg font-medium text-white">My Teams</h2>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="border-[#1977d4]/20 text-[#1977d4] hover:bg-[#1977d4]/10"
                >
                  <Link to="/my-teams">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Teams
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-3">
                {userData.teams.map((team) => (
                  <div key={team} className="bg-[#1977d4]/10 p-3 rounded-md">
                    <p className="text-white">{team}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Stats and rdCoins */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-esports-dark rounded-lg border border-[#1977d4]/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-[#1977d4]" />
                <h2 className="text-lg font-medium text-white">Stats</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Registered Tournaments</span>
                  <span className="text-white font-medium">{userData.registeredTournaments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed Tournaments</span>
                  <span className="text-white font-medium">{userData.completedTournaments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Wins</span>
                  <span className="text-white font-medium">{userData.wins}</span>
                </div>
              </div>
            </div>
            
            {/* rdCoins Card */}
            <div className="bg-esports-dark rounded-lg border border-yellow-500/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-medium text-white">rdCoins Wallet</h2>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400">Current Balance</span>
                <div className="flex items-center text-yellow-500">
                  <Coins className="h-4 w-4 mr-1" />
                  <span className="font-bold">{userData.rdCoins}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleAddCoins}
                  asChild
                  className="flex-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30"
                >
                  <Link to="/add-coins">Add Coins</Link>
                </Button>
                <Button 
                  asChild
                  className="flex-1 bg-[#1977d4] hover:bg-[#1977d4]/80"
                >
                  <Link to="/earnings">Redeem</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyAccount;
