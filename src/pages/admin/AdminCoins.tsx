
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Coins, Send, Download, FileDown, FileText, User, Calendar, Plus, Minus } from "lucide-react";
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

// Sample transaction data
const transactionsData = [
  {
    id: "1",
    username: "FireHawk22",
    type: "credit",
    amount: 1000,
    description: "Tournament prize winning",
    date: "2023-05-10 14:30:22"
  },
  {
    id: "2",
    username: "ThunderBolt",
    type: "debit",
    amount: 500,
    description: "Tournament entry fee",
    date: "2023-05-09 10:15:45"
  },
  {
    id: "3",
    username: "StormRider",
    type: "credit",
    amount: 2000,
    description: "Added via Razorpay",
    date: "2023-05-08 18:22:10"
  },
  {
    id: "4",
    username: "ShadowNinja",
    type: "debit",
    amount: 800,
    description: "Withdrawal requested",
    date: "2023-05-07 09:45:36"
  },
  {
    id: "5",
    username: "ViperStrike",
    type: "credit",
    amount: 1500,
    description: "Admin adjustment",
    date: "2023-05-06 16:12:55"
  }
];

// Sample users data for selection
const usersList = [
  { id: "1", username: "FireHawk22" },
  { id: "2", username: "StormRider" },
  { id: "3", username: "ShadowNinja" },
  { id: "4", username: "ThunderBolt" },
  { id: "5", username: "ViperStrike" },
  { id: "6", username: "RazorGamer" },
  { id: "7", username: "NinjaWarrior" },
  { id: "8", username: "PhoenixSlayer" }
];

const AdminCoins = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(transactionsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isAddToBankDialogOpen, setIsAddToBankDialogOpen] = useState(false);
  
  // Admin wallet balance
  const [adminBalance, setAdminBalance] = useState(50000);
  
  // Form states
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">("credit");
  
  // Add to bank form state
  const [addAmount, setAddAmount] = useState("");
  const [addSource, setAddSource] = useState("admin_deposit");
  
  // Filter transactions based on search and type
  const filteredTransactions = transactions.filter(transaction => {
    // Apply type filter
    if (typeFilter !== "all" && transaction.type !== typeFilter) return false;
    
    // Apply search query on username
    if (searchQuery && !transaction.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
  
  const handleAdjustBalance = () => {
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
    if (isTransferDialogOpen && parseInt(amount) > adminBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Admin wallet does not have enough coins for this transfer.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new transaction
    const newTransaction = {
      id: (transactions.length + 1).toString(),
      username,
      type: adjustmentType,
      amount: parseInt(amount),
      description: description || `Admin ${adjustmentType === "credit" ? "added" : "deducted"} coins`,
      date: new Date().toLocaleString()
    };
    
    // Update transactions
    setTransactions([newTransaction, ...transactions]);
    
    // Update admin balance if it's a transfer
    if (isTransferDialogOpen) {
      if (adjustmentType === "credit") {
        setAdminBalance(adminBalance - parseInt(amount));
      } else {
        setAdminBalance(adminBalance + parseInt(amount));
      }
    }
    
    // Show success message
    toast({
      title: "Balance Adjusted",
      description: `${adjustmentType === "credit" ? "Added" : "Deducted"} ${amount} rdCoins ${adjustmentType === "credit" ? "to" : "from"} ${username}.`,
    });
    
    // Reset form and close dialog
    resetForm();
    setIsAdjustDialogOpen(false);
    setIsTransferDialogOpen(false);
  };
  
  const handleAddToBank = () => {
    if (!addAmount || parseInt(addAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    // Update admin balance
    setAdminBalance(adminBalance + parseInt(addAmount));
    
    // Create a new transaction record
    const newTransaction = {
      id: (transactions.length + 1).toString(),
      username: "AdminWallet",
      type: "credit",
      amount: parseInt(addAmount),
      description: `Admin bank deposit: ${addSource}`,
      date: new Date().toLocaleString()
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    toast({
      title: "Bank Balance Updated",
      description: `Added ${addAmount} rdCoins to the admin wallet.`,
    });
    
    setAddAmount("");
    setAddSource("admin_deposit");
    setIsAddToBankDialogOpen(false);
  };
  
  const resetForm = () => {
    setUsername("");
    setAmount("");
    setDescription("");
    setAdjustmentType("credit");
  };
  
  const handleExportReport = () => {
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
            <div className="text-3xl font-bold text-yellow-500">
              {adminBalance.toLocaleString()} <span className="text-base">rdCoins</span>
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
          </CardContent>
        </Card>
        
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Today's Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-esports-accent">
              {transactions.length}
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
          </CardContent>
        </Card>
        
        <Card className="bg-esports-dark border-esports-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-esports-accent">
              {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-gray-400 text-sm mt-1">
              rdCoins transacted
            </p>
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
          {filteredTransactions.length > 0 ? (
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
                        {transaction.username}
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
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-gray-300 hidden md:table-cell">
                        {transaction.date}
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
                  {usersList.map(user => (
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
                <span className="text-yellow-500 font-bold">{adminBalance} rdCoins</span>
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
                  {usersList.map(user => (
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
                max={adminBalance.toString()}
                placeholder="Enter amount"
                className="bg-esports-darker border-esports-accent/20 text-white"
                value={amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!val || val <= adminBalance) {
                    setAmount(e.target.value);
                  }
                }}
              />
              {parseInt(amount) > adminBalance && (
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
              disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > adminBalance}
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
                <span className="text-yellow-500 font-bold">{adminBalance} rdCoins</span>
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
