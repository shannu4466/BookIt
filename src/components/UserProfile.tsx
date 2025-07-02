
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Settings, Gift, LogOut, Ticket, History, Info, Heart, HelpCircle, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner'

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    localStorage.removeItem("hasLoggedIn");
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 1);
  };

  const displayName = user.user_metadata.avatar_url || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-full border-2 border-gradient-to-r from-purple-500 to-pink-500 p-0 hover:scale-105 transition-transform duration-200">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm">
              {user.user_metadata.avatar_url ? <img src={displayName} alt="Profile" /> : <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRffynsRFNN4y-DlyuMLHMQl2ji-UvXKfwwGQ&s" alt="Profile" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl" align="end" forceMount>
        <div className="flex items-center justify-start gap-3 p-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
              {user.user_metadata.avatar_url ? <img src={displayName} alt="Profile" /> : <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRffynsRFNN4y-DlyuMLHMQl2ji-UvXKfwwGQ&s" alt="Profile" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-semibold text-white text-sm">{user.user_metadata.name}</p>
            {user?.email && (
              <p className="w-[180px] truncate text-xs text-gray-400">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-purple-500/20" />

        <DropdownMenuItem
          className="text-white hover:bg-purple-500/20 hover:text-white cursor-pointer mx-2 rounded-md transition-colors duration-200"
          onClick={() => navigate('/my-bookings')}
        >
          <History className="mr-3 h-4 w-4 text-purple-400" />
          <span className="font-medium">My Bookings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-white hover:bg-purple-500/20 hover:text-white cursor-pointer mx-2 rounded-md transition-colors duration-200"
          onClick={() => navigate('/my-offers')}
        >
          <Gift className="mr-3 h-4 w-4 text-pink-400" />
          <span className="font-medium">My Offers</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-white hover:bg-purple-500/20 hover:text-white cursor-pointer mx-2 rounded-md transition-colors duration-200"
          onClick={() => navigate('/settings')}
        >
          <Settings className="mr-3 h-4 w-4 text-blue-400" />
          <span className="font-medium">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-white hover:bg-purple-500/20 hover:text-white cursor-pointer mx-2 rounded-md transition-colors duration-200"
          onClick={() => navigate('/about-us')}
        >
          <Users className="mr-3 h-4 w-4 text-yellow-400" />
          <span className="font-medium">About us</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-white hover:bg-purple-500/20 hover:text-white cursor-pointer mx-2 rounded-md transition-colors duration-200"
          onClick={() => navigate('/wishlist')}
        >
          <Heart className="mr-3 h-4 w-4 text-red-400 color-red fill-red-400" />
          <span className="font-medium">Your wishlist</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-white hover:bg-purple-500/20 hover:text-white cursor-pointer mx-2 rounded-md transition-colors duration-200"
          onClick={() => navigate('/help')}
        >
          <HelpCircle className="mr-3 w-4 h-4 text-purple-400" />
          <span className="font-medium">Help</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-white hover:bg-purple-500/20 hover:text-white cursor-pointer mx-2 rounded-md transition-colors duration-200"
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: "Check out this App!",
                  text: "I'm using this awesome ticket booking app – try it out!",
                  url: window.location.origin,
                });
              } else {
                await navigator.clipboard.writeText(window.location.origin);
                toast.success("Link copied to clipboard!");
              }
            } catch (err) {
              // User canceled share or some error occurred
              await navigator.clipboard.writeText(window.location.origin);
              toast.success("Link copied to clipboard!");
            }
          }}
        >
          <Share2 className="mr-3 w-4 h-4 text-blue-400" />
          <span className="font-medium">Share this app</span>
        </DropdownMenuItem>


        <DropdownMenuSeparator className="bg-purple-500/20" />

        <DropdownMenuItem
          className="text-red-400 hover:bg-red-500/20 hover:text-white cursor-pointer mx-2 rounded-md transition-colors duration-200"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
