
import { 
  Trophy, 
  LayoutDashboard, 
  List, 
  Users,
  User,
  Wallet,
  Coins,
  ShieldCheck,
  Newspaper
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

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
  {
    title: "Request as Admin",
    icon: ShieldCheck,
    href: "/request-admin",
  },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
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
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                isActive
                  ? "bg-[#1977d4]/20 text-[#1977d4]"
                  : "text-gray-300 hover:bg-[#1977d4]/10 hover:text-[#1977d4]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
              
              {item.title === "Request as Admin" && (
                <span className="absolute right-2 text-xs px-1.5 py-0.5 rounded bg-[#1977d4]/20 text-[#1977d4]">
                  Coming Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
