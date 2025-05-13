
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { transferCoinsToUser } from "@/services/adminWalletService";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
}

interface GiveCoinsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess: () => void;
}

const GiveCoinsDialog = ({ isOpen, onOpenChange, user, onSuccess }: GiveCoinsDialogProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await transferCoinsToUser(user.id, amount, reason);
      if (success) {
        onOpenChange(false);
        setAmount(0);
        setReason("");
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setAmount(0);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) handleDialogClose();
    }}>
      <DialogContent className="bg-esports-dark border-esports-accent/20 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Give Coins to User</DialogTitle>
        </DialogHeader>

        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={user.username}
                disabled
                className="bg-esports-darker border-esports-accent/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="bg-esports-darker border-esports-accent/20"
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-esports-darker border-esports-accent/20"
                placeholder="Reason for giving coins"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-esports-accent/20 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Processing..." : "Give Coins"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GiveCoinsDialog;
