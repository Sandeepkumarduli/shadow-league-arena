
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, ArrowUp, ArrowDown, CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
];

const Earnings = () => {
  const [redeemAmount, setRedeemAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total earnings
  const totalCoins = transactions.reduce((acc, transaction) => {
    if (transaction.type === "win") {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings</h1>
          <p className="text-gray-400">Manage your rdCoins and earnings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Transactions */}
          <div className="md:col-span-2">
            <div className="bg-esports-dark rounded-lg border border-esports-accent/20 p-6">
              <h2 className="text-lg font-medium text-white mb-4">Transaction History</h2>
              
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="bg-esports-darker rounded-md p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full 
                        ${transaction.type === 'win' ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}
                      >
                        {transaction.type === 'win' ? (
                          <ArrowUp className={`h-4 w-4 text-green-500`} />
                        ) : (
                          <ArrowDown className={`h-4 w-4 text-yellow-500`} />
                        )}
                      </div>
                      
                      <div>
                        <p className="text-white font-medium">
                          {transaction.type === 'win' ? 'Tournament Win' : 'Redeemed Coins'}
                        </p>
                        {transaction.tournament && (
                          <p className="text-sm text-gray-400">{transaction.tournament}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${transaction.type === 'win' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {transaction.type === 'win' ? '+' : '-'}{transaction.amount} rdCoins
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
          <div>
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
              
              {/* Redeem Form */}
              <div>
                <h2 className="text-lg font-medium text-white mb-2">Redeem rdCoins</h2>
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Earnings;
