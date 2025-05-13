
import { useState, useEffect } from "react";
import { PlusCircle, MinusCircle, Search, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdminLayout from "@/components/AdminLayout";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import RefreshButton from "@/components/RefreshButton";
import { toast } from "@/components/ui/use-toast";
import { fetchUsers, User } from "@/services/userService";
import { GiveCoinsDialog } from "@/components/admin/GiveCoinsDialog";
import { DeductCoinsDialog } from "@/components/admin/DeductCoinsDialog";
import { fetchAdminWallet } from "@/services/adminWalletService";
import { supabase } from "@/integrations/supabase/client";

const AdminCoins = () => {
  const [adminBalance, setAdminBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGiveDialogOpen, setIsGiveDialogOpen] = useState<boolean>(false);
  const [isDeductDialogOpen, setIsDeductDialogOpen] = useState<boolean>(false);

  const fetchAdminWalletBalance = async () => {
    setIsLoading(true);
    try {
      const wallet = await fetchAdminWallet();
      if (wallet) {
        setAdminBalance(wallet.balance);
      } else {
        setAdminBalance(0);
      }
    } catch (error) {
      console.error("Error fetching admin wallet:", error);
      toast({
        title: "Failed to fetch admin wallet",
        description: "There was an error loading the admin wallet. Please try again.",
        variant: "destructive",
      });
      setAdminBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserList = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Failed to fetch users",
        description: "There was an error loading the user list. Please try again.",
        variant: "destructive",
      });
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminWalletBalance();
    fetchUserList();

    // Set up real-time subscription for admin wallet
    const adminWalletChannel = supabase
      .channel('admin_wallet')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_wallet' },
        (payload) => {
          console.log('Admin wallet updated, refreshing balance', payload);
          fetchAdminWalletBalance();
        }
      )
      .subscribe();

    // Set up real-time subscription for user balance changes
    const userBalanceChannel = supabase
      .channel('user_balance')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('User balance updated, refreshing user list', payload);
          fetchUserList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adminWalletChannel);
      supabase.removeChannel(userBalanceChannel);
    };
  }, []);

  useEffect(() => {
    const results = users.filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchQuery, users]);

  const handleGiveCoinsClick = (user: User) => {
    setSelectedUser(user);
    setIsGiveDialogOpen(true);
  };

  const handleDeductCoinsClick = (user: User) => {
    setSelectedUser(user);
    setIsDeductDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Coins</h1>
        <RefreshButton onRefresh={async () => {
          await fetchAdminWalletBalance();
          await fetchUserList();
        }} />
      </div>

      <Card className="bg-esports-dark border-esports-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Admin Wallet Balance</h2>
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              <span className="text-2xl font-bold text-esports-accent">{adminBalance} rdCoins</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 mt-4">
        <InputWithIcon
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-esports-dark border-esports-accent/20 text-white"
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="bg-esports-dark border-esports-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">{user.username}</div>
                <div className="text-gray-400">{user.email}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-esports-accent font-bold">{user.balance} rdCoins</div>
                  <div className="text-sm text-gray-500">Current Balance</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-green-500 hover:bg-green-500/10 border-esports-accent/20"
                    onClick={() => handleGiveCoinsClick(user)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-500 hover:bg-red-500/10 border-esports-accent/20"
                    onClick={() => handleDeductCoinsClick(user)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedUser && (
        <>
          <GiveCoinsDialog
            isOpen={isGiveDialogOpen}
            onOpenChange={setIsGiveDialogOpen}
            userId={selectedUser.id}
            username={selectedUser.username}
            onTransactionComplete={() => {
              fetchAdminWalletBalance();
              fetchUserList();
            }}
          />
          <DeductCoinsDialog
            isOpen={isDeductDialogOpen}
            onOpenChange={setIsDeductDialogOpen}
            userId={selectedUser.id}
            username={selectedUser.username}
            onTransactionComplete={() => {
              fetchAdminWalletBalance();
              fetchUserList();
            }}
          />
        </>
      )}
    </AdminLayout>
  );
};

export default AdminCoins;
