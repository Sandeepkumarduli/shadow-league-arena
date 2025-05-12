
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, ArrowUp, ArrowDown, CalendarDays, FileText, Edit, HelpCircle, BanknoteIcon, CalendarCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
  reference_id: string | null;
  status: string;
}

interface BankDetails {
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

const Earnings = () => {
  const { user } = useAuth();
  const [redeemAmount, setRedeemAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: "",
    ifsc: "",
    upiId: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [newBankDetails, setNewBankDetails] = useState<BankDetails>({
    accountNumber: "",
    ifsc: "",
    upiId: ""
  });

  // Fetch transaction data and wallet balance
  const fetchTransactionData = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      // Fetch wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      if (walletError) throw walletError;
      
      setTransactions(transactionsData || []);
      setTotalCoins(walletData?.balance || 0);
      
      // In a real application, you'd fetch bank details from a user_profiles table
      // For now, using localStorage as a temporary storage
      const storedBankDetails = localStorage.getItem('bankDetails');
      if (storedBankDetails) {
        const parsedDetails = JSON.parse(storedBankDetails);
        setBankDetails(parsedDetails);
        setNewBankDetails(parsedDetails);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
  }, [user]);

  const handleRedeem = async () => {
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
    
    try {
      // Create a new redeem transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user?.id,
            amount: -amount,
            type: 'redeem',
            description: 'Redemption request',
            status: 'pending'
          }
        ]);
      
      if (transactionError) throw transactionError;
      
      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: totalCoins - amount })
        .eq('user_id', user?.id);
      
      if (walletError) throw walletError;
      
      toast({
        title: "Redeem Request Submitted",
        description: `${amount} rdCoins will be processed for redemption.`,
      });
      
      setRedeemAmount("");
      fetchTransactionData();
    } catch (error) {
      console.error("Error processing redemption:", error);
      toast({
        title: "Error",
        description: "Failed to process redemption. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
    
    // In a real application, you'd update bank details in a user_profiles table
    // For now, using localStorage as a temporary storage
    try {
      localStorage.setItem('bankDetails', JSON.stringify(newBankDetails));
      setBankDetails({
        accountNumber: newBankDetails.accountNumber,
        ifsc: newBankDetails.ifsc,
        upiId: newBankDetails.upiId
      });
      
      toast({
        title: "Bank Details Updated",
        description: "Your payment details have been updated successfully!",
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: "Failed to update bank details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

        {isLoadingData ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-esports-accent"></div>
          </div>
        ) : (
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
                    
                    {transactions.length === 0 ? (
                      <div className="bg-esports-darker rounded-md p-6 text-center text-gray-400">
                        No transactions found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactions.map((transaction) => (
                          <div 
                            key={transaction.id} 
                            className="bg-esports-darker rounded-md p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 flex items-center justify-center rounded-full 
                                ${transaction.type === 'win' ? 'bg-green-500/20' : 
                                  transaction.type === 'add' ? 'bg-blue-500/20' : 'bg-yellow-500/20'}`}
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
                                {transaction.description && (
                                  <p className="text-sm text-gray-400">{transaction.description}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`font-semibold 
                                ${transaction.type === 'win' ? 'text-green-500' : 
                                  transaction.type === 'add' ? 'text-blue-500' : 'text-yellow-500'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount} rdCoins
                              </div>
                              <div className="text-xs flex items-center justify-end gap-1 text-gray-400">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                          <p className="text-white">{bankDetails.accountNumber || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">IFSC Code</p>
                          <p className="text-white">{bankDetails.ifsc || "Not set"}</p>
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
                        <p className="text-white">{bankDetails.upiId || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Earnings;
