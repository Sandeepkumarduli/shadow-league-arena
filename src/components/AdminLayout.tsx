
import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import TopBar from "./TopBar";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-esports-darker">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-black/80 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <AdminSidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <AdminSidebar className="hidden md:block" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center md:hidden px-4 h-16 border-b border-[#1977d4]/20">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center">
            <span className="text-xl font-bold font-rajdhani text-white tracking-wider">
              ADMIN<span className="text-[#1977d4]">PANEL</span>
            </span>
          </div>
        </div>
        
        <TopBar isAdmin={true} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
