import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner'
import { ArrowLeft, Star, Trash2, Calendar, HeartOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";
import { warning } from "framer-motion";

interface WishList {
  id: string;
  user_id: string;
  item_id: string;
  item_type: string;
  event_title: string;
  rating: Float32Array;
  image_url: string;
  genre: string;
  description: string;
  duration: string;
}

const WishlistButton = ({ item_id, item_type }: { item_id: string, item_type: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState<WishList[]>([]);
  const [warningCard, setWarningCard] = useState(false);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
      if (error) {
        console.log("Error fetching wishlist items")
        toast.error("Error fetching wishlist items")
      } else {
        setWishlist(data || []);
      }
    };
    setIsLoading(false)
    check();
  }, [user, navigate]);

  const removeWishlistItem = async (id: string) => {
    if (!user) {
      toast.error("User not logged in");
      return;
    }

    const { data, error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.log("Error removing wishlist item:", error);
      toast.error("Removing wishlist item failed");
    } else {
      toast.success("Wishlist item removed successfully!");
      setWishlist(prev => prev.filter(w => w.id !== id));
    }
    setWarningCard(false);
    setPendingRemovalId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      <nav className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex justify-between w-full">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-purple-500/20 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-extrabold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mr-[5%]">
                My Wishlist
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 py-8">
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 md:p-12 max-w-md mx-auto shadow-lg">
              <HeartOff className="h-16 w-16 text-purple-400 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold mb-4">Your wishlist is empty</h3>
              <p className="text-gray-400 mb-6">
                Your wishlist is waiting for some excitement. Tap "Explore Events" and find something you'll love.
              </p>
              <Link to="/">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                  Explore Events
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {wishlist.map((each) => (
              <Card
                key={each.id}
                className="flex flex-col sm:flex-row bg-white/5 border border-purple-500/10 rounded-xl overflow-hidden shadow-xl hover:shadow-purple-500/20 transition-shadow duration-300"
              >
                <img
                  src={each.image_url}
                  alt={each.event_title}
                  className="h-[250px] w-full sm:w-[150px] object-cover sm:h-auto"
                />
                <div className="flex flex-col justify-between p-4 flex-grow">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{each.event_title}</h2>
                    <div className="inline-flex items-center bg-green-600 rounded-full px-3 py-1 text-sm">
                      <Star className="h-4 w-4 text-white mr-1 fill-yellow-400" />
                      <span className="font-bold text-white">{each.rating}/10</span>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      <p><span className="font-medium text-white">Genre:</span> {each.genre}</p>
                      <p><span className="font-medium text-white">Duration:</span> {each.duration}</p>
                    </div>
                    <p className="text-sm text-gray-400 italic mb-4">{each.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center flex-wrap gap-2">
                    <Button
                      onClick={() => navigate(`/booking/movie/${each.item_id}`)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                    >
                      Book Tickets
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Remove from wishlist"
                      className="border-red-500/30 text-red-500 hover:bg-red-500/20 hover:text-white"
                      onClick={() => {
                        setWarningCard(true)
                        setPendingRemovalId(each.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {warningCard && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="bg-gradient-to-br from-purple-800/80 to-pink-800/80 text-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-purple-500/30">
                      <div className="text-lg font-semibold mb-4 text-center">
                        Are you sure you want to remove<br/>
                        <span className="text-black font-bold">
                          {
                            wishlist.find((item) => item.id === pendingRemovalId)
                              ?.event_title || "this item"
                          }
                        </span>{" "}
                        from your wishlist...?
                      </div>
                      <div className="flex justify-end space-x-4">
                        <Button
                          variant="ghost"
                          className="border border-white/30 hover:bg-white/10"
                          onClick={() => {
                            setWarningCard(false);
                            setPendingRemovalId(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-700 text-white"
                          onClick={() => {
                            if (pendingRemovalId) {
                              removeWishlistItem(pendingRemovalId);
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistButton;
