
import React from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RequestAdmin = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
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
        <h1 className="text-2xl font-bold text-white">Request Admin Access</h1>
      </div>

      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center bg-esports-dark p-10 rounded-lg border border-[#1977d4]/30">
          <ShieldCheck className="h-20 w-20 text-[#1977d4] mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">Coming Soon</h2>
          <p className="text-gray-400 text-center max-w-md">
            The admin request functionality is currently under development. 
            Please check back later for updates.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequestAdmin;
