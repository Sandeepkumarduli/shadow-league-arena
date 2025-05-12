
import { 
  Trophy, 
  LayoutDashboard, 
  Users,
  User,
  Wallet,
  Coins,
  Settings,
  PlusCircle,
  MessageSquare,
  Newspaper,
  ShieldCheck,
  Activity,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Admin Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Create Tournaments",
    icon: PlusCircle,
    href: "/admin/create-tournament",
  },
  {
    title: "Tournaments",
    icon: Trophy,
    href: "/admin/tournaments",
  },
  {
    title: "Teams",
    icon: Users,
    href: "/admin/teams",
  },
  {
    title: "Users",
    icon: User,
    href: "/admin/users",
  },
  {
    title: "Update Winners",
    icon: Award,
    href: "/admin/update-winners",
  },
  {
    title: "Broadcast",
    icon: MessageSquare,
    href: "/admin/broadcast",
  },
  {
    title: "Edit News Section",
    icon: Newspaper,
    href: "/admin/news",
  },
  {
    title: "Activity Log",
    icon: Activity,
    href: "/admin/activity",
  },
  {
    title: "Big Tournaments",
    icon: Trophy,
    href: "/admin/big-tournaments",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    title: "Coin Balance",
    icon: Coins,
    href: "/admin/coins",
  },
  {
    title: "Admin Requests",
    icon: ShieldCheck,
    href: "/admin/requests",
  },
];

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar = ({ className }: AdminSidebarProps) => {
  return (
    <div className={cn("w-64 h-full bg-esports-dark border-r border-[#1977d4]/20", className)}>
      {/* Logo */}
      <div className="p-4 border-b border-[#1977d4]/20">
        <NavLink to="/admin" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[#1977d4]" />
          <span className="text-xl font-bold font-rajdhani text-white tracking-wider">
            ADMIN<span className="text-[#1977d4]">PANEL</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#1977d4]/20 text-[#1977d4]"
                  : "text-gray-300 hover:bg-[#1977d4]/10 hover:text-[#1977d4]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
