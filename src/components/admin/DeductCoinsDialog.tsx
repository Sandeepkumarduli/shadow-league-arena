
import { useState } from "react";
import { deductCoinsFromUser } from "@/services/adminWalletService";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DeductCoinsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  onTransactionComplete?: () => void;
}

export function DeductCoinsDialog({ 
  isOpen, 
  onOpenChange, 
  userId, 
  username,
  onTransactionComplete
}: DeductCoinsDialogProps) {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeductCoins = async () => {
    if (amount <= 0) return;
    
    setIsSubmitting(true);
    try {
      await deductCoinsFromUser({ 
        userId, 
        amount, 
        description: description || `Admin deducted coins from ${username}'s wallet` 
      });
      
      setAmount(0);
      setDescription("");
      onOpenChange(false);
      
      if (onTransactionComplete) {
        onTransactionComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-esports-dark border-esports-accent/20 text-white">
        <DialogHeader>
          <DialogTitle>Deduct Coins from {username}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the amount of coins you want to deduct from this user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount" className="text-white">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              placeholder="100"
              className="bg-esports-darker border-esports-accent/20 text-white mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reason for deducting coins"
              className="bg-esports-darker border-esports-accent/20 text-white mt-2"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeductCoins}
            disabled={isSubmitting || amount <= 0}
            variant="destructive"
          >
            {isSubmitting ? "Processing..." : "Deduct Coins"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
