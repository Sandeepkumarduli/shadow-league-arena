
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Coins, Send, Download, FileDown, User, Calendar, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminWallet,
  Transaction,
  fetchAdminWallet,
  fetchTransactions,
  subscribeAdminWallet,
  subscribeTransactions,
  addFundsToAdminWallet,
  adjustUserBalance
} from "@/services/adminWalletService";
import { User, fetchUsers } from "@/services/userService";
import LoadingSpinner from "@/components/LoadingSpinner";

const AdminCoins = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isAddToBankDialogOpen, setIsAddToBankDialogOpen] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingWallet, setLoadingWallet] = useState(true);
  
  // Admin wallet balance
  const [adminWallet, setAdminWallet] = useState<AdminWallet | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form states
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">("credit");
  
  // Add to bank form state
  const [addAmount, setAddAmount] = useState("");
  const [addSource, setAddSource] = useState("admin_deposit");

  // Load data
  useEffect(() => {
    // Fetch users
    fetchUsers().then(setUsers);
    
    // Subscribe to admin wallet changes
    const unsubscribeWallet = subscribeAdminWallet((wallet) => {
      setAdminWallet(wallet);
      setLoadingWallet(false);
    });
    
    // Subscribe to transaction changes
    const unsubscribeTransactions = subscribeTransactions((fetchedTransactions) => {
      setTransactions(fetchedTransactions);
      setLoadingTransactions(false);
    });
    
    return () => {
      unsubscribeWallet();
      unsubscribeTransactions();
    };
  }, []);
  
  // Filter transactions based on search and type
  const filteredTransactions = transactions.filter(transaction => {
    // Apply type filter
    if (typeFilter !== "all" && transaction.type !== typeFilter) return false;
    
    // Apply search query on username
    if (searchQuery && transaction.user?.username && !transaction.user.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  const handleAdjustBalance = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username.",
        variant: "destructive",
      });
      return;
    }
    
    if (!amount || parseInt(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if admin has enough balance for transfer
    if (isTransferDialogOpen && adjustmentType === "credit" && adminWallet && parseInt(amount) > adminWallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: "Admin wallet does not have enough coins for this transfer.",
        variant: "destructive",
      });
      return;
    }
    
    const userId = users.find(user => user.username === username)?.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return;
    }
    
    // Call the appropriate function based on dialog type
    const success = await adjustUserBalance(
      userId, 
      parseInt(amount), 
      adjustmentType, 
      description,
      isTransferDialogOpen // fromAdminWallet flag
    );
    
    if (success) {
      // Reset form and close dialog
      resetForm();
      setIsAdjustDialogOpen(false);
      setIsTransferDialogOpen(false);
    }
  };
  
  const handleAddToBank = async () => {
    if (!addAmount || parseInt(addAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await addFundsToAdminWallet(parseInt(addAmount), addSource);
    
    if (success) {
      setAddAmount("");
      setAddSource("admin_deposit");
      setIsAddToBankDialogOpen(false);
    }
  };
  
  const resetForm = () => {
    setUsername("");
    setAmount("");
    setDescription("");
    setAdjustmentType("credit");
  };
  
  const handleExportReport = () => {
    // Generate CSV content
    const headers = ["Username", "Type", "Amount", "Description", "Date"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => [
        t.user?.username || "System",
        t.type,
        t.amount,
        `"${t.description || ""}"`,
        new Date(t.created_at).toLocaleString()
      ].join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report Exported",
      description: "The transactions report has been exported successfully.",
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
          <h1 className="text-2xl font-bold text-white">Coin Balance Management</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
            onClick={handleExportReport}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          
          <Button
            onClick={() => {
              setAdjustmentType("credit");
              setIsAdjustDialogOpen(true);
            }}
            className="bg-esports-accent hover:bg-esports-accent/80 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adjust Balance
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center">
              <Coins className="mr-2 h-5 w-5 text-yellow-500" />
              Admin Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWallet ? (
              <div className="flex justify-center py-2">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-yellow-500">
                  {adminWallet?.balance.toLocaleString() || 0} <span className="text-base">rdCoins</span>
                </div>
                <div className="mt-2 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-esports-accent/20 text-white hover:bg-esports-accent/10"
                    onClick={() => {
                      setAdjustmentType("credit");
                      setIsTransferDialogOpen(true);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Transfer to User
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                    onClick={() => setIsAddToBankDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Funds
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Today's Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="flex justify-center py-2">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-esports-accent">
                  {transactions.filter(t => {
                    const today = new Date();
                    const transactionDate = new Date(t.created_at);
                    return today.toDateString() === transactionDate.toDateString();
                  }).length}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center">
                    <Badge className="bg-green-600/20 text-green-400 border-none">
                      <Plus className="mr-1 h-3 w-3" /> 
                      {transactions.filter(t => t.type === "credit").length}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <Badge className="bg-red-900/20 text-red-500 border-none">
                      <Minus className="mr-1 h-3 w-3" />
                      {transactions.filter(t => t.type === "debit").length}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="flex justify-center py-2">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-esports-accent">
                  {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  rdCoins transacted
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <InputWithIcon
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-esports-dark border-esports-accent/20 text-white"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div>
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="bg-esports-dark border-esports-accent/20 text-white">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="credit">Credits Only</SelectItem>
              <SelectItem value="debit">Debits Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Transactions Table */}
      <Card className="bg-esports-dark border-esports-accent/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="rounded-md border border-esports-accent/20 overflow-hidden">
              <Table>
                <TableHeader className="bg-esports-darker">
                  <TableRow className="hover:bg-transparent border-esports-accent/20">
                    <TableHead className="text-white">Username</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Amount</TableHead>
                    <TableHead className="text-white hidden md:table-cell">Description</TableHead>
                    <TableHead className="text-white hidden md:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-esports-darker border-esports-accent/20">
                      <TableCell className="font-medium text-white">
                        {transaction.user?.username || "System"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={transaction.type === "credit" 
                            ? "bg-green-600/20 text-green-400 border-none" 
                            : "bg-red-900/20 text-red-500 border-none"}
                        >
                          {transaction.type === "credit" ? <Plus className="mr-1 h-3 w-3" /> : <Minus className="mr-1 h-3 w-3" />}
                          {transaction.type === "credit" ? "Credit" : "Debit"}
                        </Badge>
                      </TableCell>
                      <TableCell className={transaction.type === "credit" ? "text-green-400" : "text-red-500"}>
                        {transaction.type === "credit" ? "+" : "-"}{transaction.amount}
                      </TableCell>
                      <TableCell className="text-gray-300 hidden md:table-cell">
                        {transaction.description || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-300 hidden md:table-cell">
                        {new Date(transaction.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No transactions match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Adjust Balance Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Adjust User Balance</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add or deduct rdCoins from a user's account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                Username
              </Label>
              <Select value={username} onValueChange={setUsername}>
                <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white">
                  <SelectValue placeholder="Select username" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.username}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="adjustmentType" className="block text-sm font-medium text-white mb-1">
                Adjustment Type
              </Label>
              <Select
                value={adjustmentType}
                onValueChange={(value: "credit" | "debit") => setAdjustmentType(value)}
              >
                <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  <SelectItem value="credit">Credit (Add Coins)</SelectItem>
                  <SelectItem value="debit">Debit (Remove Coins)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount" className="block text-sm font-medium text-white mb-1">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="Enter amount"
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                Description (Optional)
              </Label>
              <Input
                id="description"
                placeholder="Enter reason for adjustment"
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                setIsAdjustDialogOpen(false);
              }}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant={adjustmentType === "credit" ? "default" : "destructive"}
              onClick={handleAdjustBalance}
              className={adjustmentType === "credit" ? "bg-green-600 hover:bg-green-700" : "bg-red-900 hover:bg-red-800"}
            >
              {adjustmentType === "credit" ? "Add Coins" : "Deduct Coins"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transfer from Admin Wallet Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Transfer from Admin Wallet</DialogTitle>
            <DialogDescription className="text-gray-400">
              Transfer rdCoins from the admin wallet to a user's account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="bg-esports-darker p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Admin Wallet Balance:</span>
                <span className="text-yellow-500 font-bold">{adminWallet?.balance.toLocaleString() || 0} rdCoins</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                Recipient Username
              </Label>
              <Select value={username} onValueChange={setUsername}>
                <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white">
                  <SelectValue placeholder="Select username" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.username}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount" className="block text-sm font-medium text-white mb-1">
                Amount to Transfer
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max={adminWallet?.balance.toString()}
                placeholder="Enter amount"
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!val || (adminWallet && val <= adminWallet.balance)) {
                    setAmount(e.target.value);
                  }
                }}
              />
              {parseInt(amount) > (adminWallet?.balance || 0) && (
                <p className="text-red-500 text-xs mt-1">
                  Amount exceeds available balance.
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                Description (Optional)
              </Label>
              <Input
                id="description"
                placeholder="Enter reason for transfer"
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                setIsTransferDialogOpen(false);
              }}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleAdjustBalance}
              disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > (adminWallet?.balance || 0)}
              className="bg-esports-accent hover:bg-esports-accent/80"
            >
              Transfer Coins
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add to Bank Dialog */}
      <Dialog open={isAddToBankDialogOpen} onOpenChange={setIsAddToBankDialogOpen}>
        <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
          <DialogHeader>
            <DialogTitle>Add Funds to Admin Wallet</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add rdCoins to the admin wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="bg-esports-darker p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Current Admin Balance:</span>
                <span className="text-yellow-500 font-bold">{adminWallet?.balance.toLocaleString() || 0} rdCoins</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="addAmount" className="block text-sm font-medium text-white mb-1">
                Amount to Add
              </Label>
              <Input
                id="addAmount"
                type="number"
                min="1"
                placeholder="Enter amount"
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="addSource" className="block text-sm font-medium text-white mb-1">
                Source
              </Label>
              <Select
                value={addSource}
                onValueChange={setAddSource}
              >
                <SelectTrigger className="bg-esports-darker border-esports-accent/20 text-white">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-esports-dark border-esports-accent/20 text-white">
                  <SelectItem value="admin_deposit">Admin Deposit</SelectItem>
                  <SelectItem value="payment_gateway">Payment Gateway</SelectItem>
                  <SelectItem value="sponsorship">Sponsorship</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAddToBankDialogOpen(false)}
              className="text-white"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleAddToBank}
              disabled={!addAmount || parseInt(addAmount) <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Add to Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoins;
