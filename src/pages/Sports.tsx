
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, ArrowLeft, MapPin, Share2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MobileNavigation from "@/components/MobileNavigation";
import { useSports } from "@/hooks/useSports";

const Sports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('selectedLocation') || "hyderabad";
  });
  const [loadingSport, setLoadingSport] = useState<string | null>(null);

  // Fetch sports from database
  const { data: sports = [], isLoading } = useSports(selectedLocation);

  // Save location to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedLocation', selectedLocation);
  }, [selectedLocation]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const locations = [
    { value: "hyderabad", label: "Hyderabad" },
    { value: "mumbai", label: "Mumbai" },
    { value: "delhi", label: "Delhi" },
    { value: "bangalore", label: "Bangalore" },
    { value: "chennai", label: "Chennai" },
    { value: "kolkata", label: "Kolkata" },
    { value: "pune", label: "Pune" },
    { value: "visakhapatnam", label: "Visakhapatnam" },
    { value: "vijayawada", label: "Vijayawada" },
  ];

  // Get unique sport types from database
  const categories = ["all", ...Array.from(new Set(sports.map(sport => sport.sport_type)))];

  // Filter sports based on search, category, and location
  const filteredSports = sports.filter(sport => {
    const matchesSearch = sport.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sport.sport_type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || sport.sport_type === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleBookTicket = async (sportId: string, sportTitle: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingSport(sportId);

    try {
      // Add a short delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Redirected to ${sportTitle} details page...`);

      // Navigate to booking page
      navigate(`/sport/${sportId}`);
    } catch (error) {
      toast.error("Failed to navigate to booking page");
    } finally {
      setLoadingSport(null);
    }
  };

  const handleShare = async (sport: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: sport.title,
          text: `Check out ${sport.title} - ${sport.sport_type} sports event`,
          url: window.location.origin + `/sport/${sport.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/sport/${sport.id}`);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 pb-16 md:pb-0">
      {/* Header */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-blue-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-500/20 hover:text-white md:flex hidden"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Sports</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[140px] bg-white/10 border-blue-500/30 text-white text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-blue-500/30">
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Search and Filters */}
      <div className="mt-8 space-y-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search your sport here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/10 backdrop-blur-md border-blue-500/30 text-white placeholder:text-blue-300 focus:border-blue-400 rounded-full"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "ghost"}
              onClick={() => setActiveCategory(category)}
              className={`${activeCategory === category
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25"
                : "text-white hover:bg-blue-500/20 border border-blue-500/30"
                }`}
            >
              {category === "all" ? "All Sports" : category}
            </Button>
          ))}
        </div>

        {/* Location Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Sports in {locations.find(l => l.value === selectedLocation)?.label}
          </h2>
          <p className="text-gray-400">
            Showing {filteredSports.length} event{filteredSports.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Sports Grid */}
        {filteredSports.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No sports events found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filters, or check other locations
            </p>
            <Button
              variant="outline"
              className="border-blue-500/30 text-black hover:bg-blue-500/20 hover:text-white"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSports.map((sport) => (
              <Card key={sport.id} className="group overflow-hidden bg-white/5 backdrop-blur-xl border-blue-500/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
                <div className="relative">
                  <img
                    src={sport.image_url || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=600&fit=crop"}
                    alt={sport.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                    <span className="text-white text-sm">{sport.rating}</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full px-3 py-1">
                    <span className="text-white text-sm font-bold">Sports</span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-orange-500/80 text-white border-none backdrop-blur-sm">
                      {sport.sport_type}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2"
                      onClick={() => handleShare(sport)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="text-white font-bold text-lg mb-2 line-clamp-1">{sport.title}</h4>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-300 text-sm font-semibold">{sport.price_range}</span>
                    <span className="text-gray-400 text-xs">
                      {locations.find(l => l.value === sport.location)?.label}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBookTicket(sport.id, sport.title)}
                    disabled={loadingSport === sport.id}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                  >
                    {loadingSport === sport.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redirecting...
                      </div>
                    ) : (
                      "View Details"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Sports;
