
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteTeamDialog = ({
  open,
  onOpenChange,
  onConfirmDelete
}: DeleteTeamDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-esports-dark text-white border-esports-accent/20">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete this team? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            className="bg-red-900/20 hover:bg-red-900/40 text-red-500"
          >
            Delete Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTeamDialog;
