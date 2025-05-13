
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CreateTeamDialog from "@/components/admin/CreateTeamDialog";

interface CreateTeamHandlerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated: () => void;
}

const CreateTeamHandler = ({
  isOpen,
  onOpenChange,
  onTeamCreated
}: CreateTeamHandlerProps) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamGame, setNewTeamGame] = useState("");
  const [newTeamCaptain, setNewTeamCaptain] = useState("");
  const [newTeamMaxMembers, setNewTeamMaxMembers] = useState("4");

  const handleCreateTeam = async () => {
    // Validation
    if (!newTeamName.trim()) {
      toast({
        title: "Team Name Required",
        description: "Please enter a team name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTeamGame) {
      toast({
        title: "Game Selection Required",
        description: "Please select a game for the team.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTeamCaptain.trim()) {
      toast({
        title: "Captain Required",
        description: "Please enter a captain username.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First check if captain exists by username
      const { data: captainData, error: captainError } = await supabase
        .from('users')
        .select('id')
        .eq('username', newTeamCaptain.trim())
        .single();
      
      if (captainError || !captainData) {
        toast({
          title: "Captain Not Found",
          description: "The captain username was not found in the system.",
          variant: "destructive",
        });
        return;
      }
      
      // Create new team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: newTeamName.trim(),
          owner_id: captainData.id,
          // game: newTeamGame // Uncomment if game column exists
        })
        .select()
        .single();
      
      if (teamError) throw teamError;
      
      // Add captain as team member
      await supabase
        .from('team_members')
        .insert({
          team_id: newTeam.id,
          user_id: captainData.id
        });
      
      toast({
        title: "Team Created",
        description: `Team "${newTeamName}" has been successfully created.`,
      });
      
      // Reset form and close dialog
      setNewTeamName("");
      setNewTeamGame("");
      setNewTeamCaptain("");
      setNewTeamMaxMembers("4");
      onOpenChange(false);
      
      // Refresh teams list
      onTeamCreated();
      
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  };

  return (
    <CreateTeamDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      newTeamName={newTeamName}
      onNewTeamNameChange={setNewTeamName}
      newTeamGame={newTeamGame}
      onNewTeamGameChange={setNewTeamGame}
      newTeamCaptain={newTeamCaptain}
      onNewTeamCaptainChange={setNewTeamCaptain}
      newTeamMaxMembers={newTeamMaxMembers}
      onNewTeamMaxMembersChange={setNewTeamMaxMembers}
      onCreateTeam={handleCreateTeam}
    />
  );
};

export default CreateTeamHandler;
