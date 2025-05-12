
import React from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";

const BigTournaments = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center text-gray-400 hover:text-white mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Big Tournaments</h1>
      </div>

      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center bg-esports-dark p-10 rounded-lg border border-[#1977d4]/30">
          <Trophy className="h-20 w-20 text-[#1977d4] mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">Coming Soon</h2>
          <p className="text-gray-400 text-center max-w-md">
            The Big Tournaments feature is currently under development. This section will allow managing larger scale tournaments with more customized options.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BigTournaments;
