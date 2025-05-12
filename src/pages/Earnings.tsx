
import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, ArrowUp, ArrowDown, CalendarDays, FileText, Edit, HelpCircle, BanknoteIcon, CalendarCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Mock transaction data
const transactions = [
  { 
    id: "1", 
    type: "win", 
    amount: 50, 
    tournament: "BGMI Weekend Cup", 
    date: "2025-05-10" 
  },
  { 
    id: "2", 
    type: "win", 
    amount: 100, 
    tournament: "Valorant Championship", 
    date: "2025-05-05" 
  },
  { 
    id: "3", 
    type: "redeem", 
    amount: 75, 
    tournament: null, 
    date: "2025-05-01" 
  },
  { 
    id: "4", 
    type: "win", 
    amount: 30, 
    tournament: "COD Mobile Solo", 
    date: "2025-04-28" 
  },
  { 
    id: "5", 
    type: "redeem", 
    amount: 50, 
    tournament: null, 
    date: "2025-04-25" 
  },
  { 
    id: "6", 
    type: "add", 
    amount: 200, 
    tournament: null, 
    date: "2025-04-20" 
  },
  { 
    id: "7", 
    type: "add", 
    amount: 100, 
    tournament: null, 
    date: "2025-04-15" 
  },
];

const Earnings = () => {
  const [redeemAmount, setRedeemAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "XXXX XXXX 1234",
    ifsc: "SBIN0001234",
    upiId: "user@upi"
  });
  const [editMode, setEditMode] = useState(false);
  const [newBankDetails, setNewBankDetails] = useState({
    accountNumber: "",
    ifsc: "",
    upiId: ""
  });

  // Calculate total earnings
  const totalCoins = transactions.reduce((acc, transaction) => {
    if (transaction.type === "win" || transaction.type === "add") {
      return acc + transaction.amount;
    } else if (transaction.type === "redeem") {
      return acc - transaction.amount;
    }
    return acc;
  }, 0);

  const handleRedeem = () => {
    const amount = parseInt(redeemAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to redeem",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > totalCoins) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${totalCoins} rdCoins available to redeem`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Redeem Request Submitted",
        description: `${amount} rdCoins will be processed for redemption.`,
      });
      setRedeemAmount("");
    }, 1500);
  };

  const handleUpdateBankDetails = () => {
    if (!newBankDetails.accountNumber || !newBankDetails.ifsc || !newBankDetails.upiId) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setBankDetails({
        accountNumber: newBankDetails.accountNumber,
        ifsc: newBankDetails.ifsc,
        upiId: newBankDetails.upiId
      });
      setIsLoading(false);
      setEditMode(false);
      toast({
        title: "Bank Details Updated",
        description: "Your payment details have been updated successfully!",
      });
    }, 1500);
  };

  const handleReportIssue = () => {
    toast({
      title: "Support Ticket Created",
      description: "Our team will get back to you within 24 hours",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings</h1>
          <p className="text-gray-400">Manage your rdCoins and earnings</p>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="bg-esports-dark border border-esports-accent/20 mb-6">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-esports-accent data-[state=active]:text-white">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="payment-details" className="data-[state=active]:bg-esports-accent data-[state=active]:text-white">
              Payment Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Transactions */}
              <div className="md:col-span-2">
                <div className="bg-esports-dark rounded-lg border border-esports-accent/20 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-esports-accent" />
                    <h2 className="text-lg font-medium text-white">Transaction History</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="bg-esports-darker rounded-md p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full 
                            ${transaction.type === 'win' ? 'bg-green-500/20' : transaction.type === 'add' ? 'bg-blue-500/20' : 'bg-yellow-500/20'}`}
                          >
                            {transaction.type === 'win' ? (
                              <ArrowUp className={`h-4 w-4 text-green-500`} />
                            ) : transaction.type === 'add' ? (
                              <BanknoteIcon className={`h-4 w-4 text-blue-500`} />
                            ) : (
                              <ArrowDown className={`h-4 w-4 text-yellow-500`} />
                            )}
                          </div>
                          
                          <div>
                            <p className="text-white font-medium">
                              {transaction.type === 'win' 
                                ? 'Tournament Win' 
                                : transaction.type === 'add' 
                                  ? 'Added Coins' 
                                  : 'Redeemed Coins'}
                            </p>
                            {transaction.tournament && (
                              <p className="text-sm text-gray-400">{transaction.tournament}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-semibold 
                            ${transaction.type === 'win' ? 'text-green-500' : 
                              transaction.type === 'add' ? 'text-blue-500' : 'text-yellow-500'}`}>
                            {transaction.type === 'win' || transaction.type === 'add' ? '+' : '-'}{transaction.amount} rdCoins
                          </div>
                          <div className="text-xs flex items-center justify-end gap-1 text-gray-400">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right column - Balance and Redeem */}
              <div className="space-y-6">
                {/* Balance Card */}
                <div className="bg-esports-dark rounded-lg border border-yellow-500/30 p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-white mb-2">Current Balance</h2>
                    <div className="bg-esports-darker rounded-md p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <span className="text-gray-400">rdCoins</span>
                      </div>
                      <span className="text-yellow-500 text-xl font-bold">{totalCoins}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      1 rdCoin = 1 Rupee
                    </p>
                  </div>
                </div>
                
                {/* Redeem Form */}
                <div className="bg-esports-dark rounded-lg border border-esports-accent/20 p-6">
                  <h2 className="text-lg font-medium text-white mb-4">Redeem rdCoins</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Amount to Redeem
                      </label>
                      <Input 
                        type="number"
                        placeholder="Enter amount"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        className="bg-esports-darker border-esports-accent/30 text-white"
                      />
                    </div>
                    <Button 
                      onClick={handleRedeem}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Redeem Now"}
                    </Button>
                    <p className="text-xs text-gray-400">
                      Redemption requests are processed within 24-48 hours.
                    </p>
                  </div>
                </div>

                {/* Add Money to Wallet */}
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                  asChild
                >
                  <Link to="/add-coins">
                    <BanknoteIcon className="h-4 w-4" />
                    Add Money to Wallet
                  </Link>
                </Button>

                {/* Report Issue */}
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center justify-center gap-2"
                  onClick={handleReportIssue}
                >
                  <HelpCircle className="h-4 w-4" />
                  Report an Issue
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payment-details">
            <div className="bg-esports-dark rounded-lg border border-esports-accent/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BanknoteIcon className="h-5 w-5 text-esports-accent" />
                  <h2 className="text-lg font-medium text-white">Bank & UPI Details</h2>
                </div>
                {!editMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-esports-accent/20 text-esports-accent hover:bg-esports-accent/10"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Details
                  </Button>
                )}
              </div>
              
              {editMode ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-400">Account Number</Label>
                      <Input
                        type="text"
                        placeholder="Enter account number"
                        value={newBankDetails.accountNumber}
                        onChange={(e) => setNewBankDetails({...newBankDetails, accountNumber: e.target.value})}
                        className="bg-esports-darker border-esports-accent/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400">IFSC Code</Label>
                      <Input
                        type="text"
                        placeholder="Enter IFSC code"
                        value={newBankDetails.ifsc}
                        onChange={(e) => setNewBankDetails({...newBankDetails, ifsc: e.target.value})}
                        className="bg-esports-darker border-esports-accent/30 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-400">UPI ID</Label>
                      <Input
                        type="text"
                        placeholder="Enter UPI ID"
                        value={newBankDetails.upiId}
                        onChange={(e) => setNewBankDetails({...newBankDetails, upiId: e.target.value})}
                        className="bg-esports-darker border-esports-accent/30 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdateBankDetails}
                      className="flex-1 bg-esports-accent hover:bg-esports-accent-hover"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setEditMode(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-esports-darker rounded-md p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-400">Bank Account Details</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="bg-esports-dark text-gray-300 border-esports-accent/30 w-80">
                          <p className="text-sm">Your bank account is used for rdCoin redemptions above 1000 rdCoins.</p>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Account Number</p>
                        <p className="text-white">{bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">IFSC Code</p>
                        <p className="text-white">{bankDetails.ifsc}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-esports-darker rounded-md p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-400">UPI Details</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="bg-esports-dark text-gray-300 border-esports-accent/30 w-80">
                          <p className="text-sm">Your UPI ID is used for quick rdCoin redemptions under 1000 rdCoins.</p>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">UPI ID</p>
                      <p className="text-white">{bankDetails.upiId}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Earnings;
