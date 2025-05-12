
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Trophy, Gamepad, Coins } from "lucide-react";

// Sample analytics data
const analyticsData = {
  totalUsers: 1245,
  totalTournaments: 78,
  activeMatches: 12,
  totalEarnings: 34500
};

// Sample chart data
const usageData = [
  { name: "Jan", tournaments: 4, users: 120, earnings: 1200 },
  { name: "Feb", tournaments: 6, users: 160, earnings: 1800 },
  { name: "Mar", tournaments: 8, users: 250, earnings: 3400 },
  { name: "Apr", tournaments: 10, users: 320, earnings: 4500 },
  { name: "May", tournaments: 12, users: 380, earnings: 5600 },
  { name: "Jun", tournaments: 15, users: 480, earnings: 7800 }
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-esports-accent" />
                <CardTitle className="text-white text-lg">Total Users</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-esports-accent">
                {analyticsData.totalUsers.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm mt-1">Registered accounts</p>
            </CardContent>
          </Card>
          
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-esports-accent" />
                <CardTitle className="text-white text-lg">Tournaments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-esports-accent">
                {analyticsData.totalTournaments.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm mt-1">Total created</p>
            </CardContent>
          </Card>
          
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Gamepad className="h-5 w-5 mr-2 text-esports-accent" />
                <CardTitle className="text-white text-lg">Active Matches</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-esports-accent">
                {analyticsData.activeMatches.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm mt-1">Currently live</p>
            </CardContent>
          </Card>
          
          <Card className="bg-esports-dark border-esports-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Coins className="h-5 w-5 mr-2 text-esports-accent" />
                <CardTitle className="text-white text-lg">Total Earnings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-esports-accent">
                {analyticsData.totalEarnings.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm mt-1">rdCoins</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Usage Chart */}
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader>
            <CardTitle className="text-white">Platform Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={usageData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1e1e2a", 
                      borderColor: "#1977d4", 
                      color: "white" 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="tournaments" name="Tournaments" fill="#1977d4" />
                  <Bar dataKey="users" name="New Users" fill="#38bdf8" />
                  <Bar dataKey="earnings" name="Earnings (rdCoins)" fill="#fb923c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
