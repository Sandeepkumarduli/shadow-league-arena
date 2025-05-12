
import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import TopBar from "./TopBar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen bg-esports-darker">
      <AdminSidebar className="hidden md:block" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar isAdmin={true} />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
