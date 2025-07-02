
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTrendingMovies } from "@/hooks/useMovies";
import { useTrendingEvents } from "@/hooks/useEvents";
import { useTrendingPlays } from "@/hooks/usePlays";
import { useTrendingSports } from "@/hooks/useSports";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TrendingSection = ({ selectedLocation }: { selectedLocation: string }) => {
  const { data: trendingMovies = [] } = useTrendingMovies();
  const { data: trendingEvents = [] } = useTrendingEvents();
  const { data: trendingPlays = [] } = useTrendingPlays();
  const { data: trendingSports = [] } = useTrendingSports();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter trending items by location and combine them
  const filteredMovies = trendingMovies.filter(movie => movie.location === selectedLocation).slice(0, 2);
  const filteredEvents = trendingEvents.filter(event => event.location === selectedLocation).slice(0, 1);
  const filteredPlays = trendingPlays.filter(play => play.location === selectedLocation).slice(0, 1);
  const filteredSports = trendingSports.filter(sport => sport.location === selectedLocation).slice(0, 1);

  const trendingItems = [
    ...filteredMovies.map(movie => ({
      id: movie.id,
      title: movie.title,
      type: "Movie",
      rating: movie.rating,
      image: movie.image_url || "https://res.cloudinary.com/drjvxkwkq/image/upload/v1748863241/RRR_Poster_tug7yw.jpg",
      link: `/movie/${movie.id}`,
      price: movie.price_range,
      trending: "Top Grosser",
      location: movie.location,
      language: movie.language || undefined
    })),
    ...filteredEvents.map(event => ({
      id: event.id,
      title: event.title,
      type: "Event",
      rating: event.rating,
      image: event.image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop",
      link: `/event/${event.id}`,
      price: event.price_range,
      trending: "Sold Out Soon",
      location: event.location,
      language: undefined
    })),
    ...filteredPlays.map(play => ({
      id: play.id,
      title: play.title,
      type: "Play",
      rating: play.rating,
      image: play.image_url || "https://res.cloudinary.com/drjvxkwkq/image/upload/v1748863428/MV5BMzY2YjE5OGItMWRjMS00YWVmLThlYjAtMjczMGJhYjAyZDE3XkEyXkFqcGc_._V1__ok8icx.jpg",
      link: `/play/${play.id}`,
      price: play.price_range,
      trending: "Critics Choice",
      location: play.location,
      language: play.language || undefined
    })),
    ...filteredSports.map(sport => ({
      id: sport.id,
      title: sport.title,
      type: "Sports",
      rating: sport.rating,
      image: sport.image_url || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=300&h=400&fit=crop",
      link: `/sport/${sport.id}`,
      price: sport.price_range,
      trending: "High Demand",
      location: sport.location,
      language: undefined
    }))
  ].slice(0, 4);

  const handleBookNow = (item: any) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Navigate directly to booking page based on type
    if (item.type === "Movie") {
      navigate(`/movie/${item.id}`);
    } else if (item.type === "Event") {
      navigate(`/event/${item.id}`);
    } else if (item.type === "Play") {
      navigate(`/play/${item.id}`);
    } else if (item.type === "Sports") {
      navigate(`/sport/${item.id}`);
    }
    
    toast.success("Redirecting to booking...");
  };

  if (trendingItems.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <TrendingUp className="h-6 md:h-8 w-6 md:w-8 text-orange-400" />
            Trending Now
          </h3>
          <p className="text-gray-300 text-lg">Most popular entertainment choices this week</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {trendingItems.map((item) => (
            <Card key={`${item.type}-${item.id}`} className="group overflow-hidden bg-white/5 backdrop-blur-xl border-orange-500/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/70 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 flex items-center">
                  <Star className="h-3 md:h-4 w-3 md:w-4 text-yellow-400 mr-1 fill-current" />
                  <span className="text-white text-xs md:text-sm">{item.rating}</span>
                </div>
                <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-2 md:px-3 py-1">
                  <span className="text-white text-xs md:text-sm font-bold">{item.type}</span>
                </div>
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                  <Badge className="bg-orange-500/80 text-white border-none backdrop-blur-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {item.trending}
                  </Badge>
                </div>
                {item.language && (
                  <div className="absolute bottom-2 right-2 bg-purple-500/80 rounded-full px-2 py-1">
                    <span className="text-white text-xs font-medium">{item.language}</span>
                  </div>
                )}
              </div>
              <CardContent className="p-3 md:p-4">
                <h4 className="text-white font-bold text-sm md:text-lg mb-2 line-clamp-1">{item.title}</h4>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-orange-300 text-xs md:text-sm font-semibold">{item.price}</span>
                  <div className="flex items-center text-gray-400 text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="capitalize">{item.location}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleBookNow(item)}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 text-xs md:text-sm"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
