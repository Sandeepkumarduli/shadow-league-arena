import { 
  Trophy, 
  LayoutDashboard, 
  List, 
  Users,
  User,
  Wallet,
  Coins,
  Newspaper,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

const Sidebar = ({ className }: { className?: string }) => {
  const { isAdmin } = useAuth();
  
  // Define menu items
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Tournaments",
      icon: Trophy,
      href: "/tournaments",
    },
    {
      title: "Registered Tournaments",
      icon: List,
      href: "/registered-tournaments",
    },
    {
      title: "My Teams",
      icon: Users,
      href: "/my-teams",
    },
    {
      title: "News",
      icon: Newspaper,
      href: "/news",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
    {
      title: "My Account",
      icon: Wallet,
      href: "/my-account",
    },
    {
      title: "Earnings",
      icon: Coins,
      href: "/earnings",
    },
  ];

  // Only add the Request Admin link if user isn't already an admin
  if (!isAdmin) {
    menuItems.push({
      title: "Request Admin",
      icon: Shield,
      href: "/request-admin",
    });
  }

  return (
    <div className={cn("w-64 h-full bg-esports-dark border-r border-[#1977d4]/20", className)}>
      {/* Logo */}
      <div className="p-4 border-b border-[#1977d4]/20">
        <NavLink to="/" className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-[#1977d4]" />
          <span className="text-xl font-bold font-rajdhani text-white tracking-wider">
            NEXUS<span className="text-[#1977d4]">ARENA</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <div className="p-4">
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
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
