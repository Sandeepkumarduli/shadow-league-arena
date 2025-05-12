
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, CreditCard, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type PackageType = {
  id: string;
  coins: number;
  price: number;
  popular?: boolean;
};

const coinPackages: PackageType[] = [
  { id: "basic", coins: 100, price: 99 },
  { id: "popular", coins: 500, price: 475, popular: true },
  { id: "premium", coins: 1000, price: 900 },
  { id: "elite", coins: 2500, price: 2125 },
];

const AddCoins = () => {
  const [selectedPackage, setSelectedPackage] = useState<string>("popular");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const handlePackageSelect = (id: string) => {
    setSelectedPackage(id);
    setIsCustom(false);
  };

  const handleCustomSelect = () => {
    setIsCustom(true);
    setSelectedPackage("");
  };

  const handlePurchase = () => {
    // Validation
    if (isCustom) {
      const amount = parseInt(customAmount);
      if (isNaN(amount) || amount < 100) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount (minimum 100 coins)",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Reset to initial state after showing success
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedPackage("popular");
        setIsCustom(false);
        setCustomAmount("");
      }, 3000);
      
      toast({
        title: "Purchase Successful",
        description: "rdCoins have been added to your account!",
      });
    }, 2000);
  };

  const getSelectedAmount = () => {
    if (isCustom) {
      return parseInt(customAmount) || 0;
    } else {
      const pkg = coinPackages.find(p => p.id === selectedPackage);
      return pkg ? pkg.coins : 0;
    }
  };

  const getSelectedPrice = () => {
    if (isCustom) {
      const coins = parseInt(customAmount) || 0;
      // Apply a standard discount formula for custom amounts
      return coins >= 1000 ? Math.floor(coins * 0.9) : coins;
    } else {
      const pkg = coinPackages.find(p => p.id === selectedPackage);
      return pkg ? pkg.price : 0;
    }
  };

  if (paymentSuccess) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-400 mb-6">
            {getSelectedAmount()} rdCoins have been added to your account.
          </p>
          <Button 
            onClick={() => setPaymentSuccess(false)}
            className="bg-esports-accent hover:bg-esports-accent-hover"
          >
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Add rdCoins</h1>
            <p className="text-gray-400">Purchase rdCoins to register for tournaments</p>
          </div>

          <div className="bg-esports-dark rounded-lg border border-esports-accent/20 p-6">
            <h2 className="text-lg font-medium text-white mb-4">Select a Package</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {coinPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative cursor-pointer rounded-lg p-4 border-2 transition-all
                    ${selectedPackage === pkg.id && !isCustom
                      ? 'border-esports-accent bg-esports-accent/10'
                      : 'border-esports-accent/20 hover:border-esports-accent/50'
                    }
                  `}
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 -right-3 bg-esports-accent px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="font-bold text-lg text-white">{pkg.coins} rdCoins</span>
                    </div>
                    <RadioGroupItem 
                      id={pkg.id} 
                      value={pkg.id} 
                      checked={selectedPackage === pkg.id && !isCustom} 
                      className="text-esports-accent border-esports-accent/50" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {pkg.coins > pkg.price && (
                        <span className="text-green-500">
                          {Math.round((1 - pkg.price / pkg.coins) * 100)}% off
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-white">₹{pkg.price}</span>
                  </div>
                </div>
              ))}

              {/* Custom amount */}
              <div
                className={`cursor-pointer rounded-lg p-4 border-2 transition-all
                  ${isCustom
                    ? 'border-esports-accent bg-esports-accent/10'
                    : 'border-esports-accent/20 hover:border-esports-accent/50'
                  }
                `}
                onClick={handleCustomSelect}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold text-lg text-white">Custom Amount</span>
                  </div>
                  <RadioGroupItem 
                    id="custom" 
                    value="custom" 
                    checked={isCustom} 
                    className="text-esports-accent border-esports-accent/50" 
                  />
                </div>
                {isCustom && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      placeholder="Enter amount (min 100)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      autoFocus
                      className="bg-esports-darker border-esports-accent/30 text-white"
                    />
                    {parseInt(customAmount) >= 1000 && (
                      <p className="text-xs text-green-500 mt-1">10% discount on 1000+ coins</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment summary */}
            <div className="bg-esports-darker rounded-lg p-4 mb-6">
              <h3 className="text-md font-medium text-white mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">{getSelectedAmount()} rdCoins</span>
                  <span className="text-white">₹{getSelectedPrice()}</span>
                </div>
                <div className="flex justify-between border-t border-esports-accent/20 pt-2 mt-2">
                  <span className="font-medium text-white">Total</span>
                  <span className="font-semibold text-white">₹{getSelectedPrice()}</span>
                </div>
              </div>
            </div>
            
            {/* Payment button */}
            <Button 
              onClick={handlePurchase}
              className="w-full bg-esports-accent hover:bg-esports-accent-hover h-12 text-base"
              disabled={isProcessing || (isCustom && (!customAmount || parseInt(customAmount) < 100))}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pay ₹{getSelectedPrice()}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddCoins;
