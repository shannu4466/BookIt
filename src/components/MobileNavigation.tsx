
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Film, Calendar, Trophy, User, Theater } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Film, label: "Movies", href: "/movies" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Theater, label: "Plays", href: "/plays" },
    { icon: Trophy, label: "Sports", href: "/sports" },
    // { icon: User, label: "Profile", href: "/settings" }
  ];

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-purple-500/20 transition-transform duration-300",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px]",
                isActive 
                  ? "text-purple-400 bg-purple-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-purple-400")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
