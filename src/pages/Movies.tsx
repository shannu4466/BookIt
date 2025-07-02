
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
import { useMovies } from "@/hooks/useMovies";

const Movies = () => {
  const [activeLanguage, setActiveLanguage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('selectedLocation') || "hyderabad";
  });
  const [loadingMovie, setLoadingMovie] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch movies from database
  const { data: movies = [], isLoading } = useMovies(selectedLocation);

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

  const languages = ["all", "Telugu", "Hindi", "Tamil", "Kannada", "Malayalam"];

  // Filter movies based on search and language
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = activeLanguage === "all" || movie.language === activeLanguage;

    return matchesSearch && matchesLanguage;
  });

  const handleBookTicket = async (movieId: string, movieTitle: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingMovie(movieId);

    try {
      // Add a short delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Redirected to ${movieTitle} details page`);

      // Navigate to booking page
      navigate(`/movie/${movieId}`);
    } catch (error) {
      toast.error("Failed to navigate to booking page");
    } finally {
      setLoadingMovie(null);
    }
  };

  const handleShare = async (movie: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} - ${movie.genre} movie in ${movie.language}`,
          url: window.location.origin + `/movie/${movie.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/movie/${movie.id}`);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pb-16 md:pb-0">
      {/* Header */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-purple-500/20 hover:text-white md:flex hidden"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Movies</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[140px] bg-white/10 border-purple-500/30 text-white text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-purple-500/30">
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
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
          <Input
            placeholder="Search your movie here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/10 backdrop-blur-md border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400 rounded-full"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Language Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-purple-400" />
            <span className="text-white text-sm">Filters:</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            {languages.map((language) => (
              <Button
                key={language}
                variant={activeLanguage === language ? "default" : "ghost"}
                onClick={() => setActiveLanguage(language)}
                className={`${activeLanguage === language
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25"
                  : "text-white hover:bg-purple-500/20 border border-purple-500/30"
                  }`}
              >
                {language === "all" ? "All Languages" : language}
              </Button>
            ))}
          </div>
        </div>

        {/* Location Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Movies in {locations.find(l => l.value === selectedLocation)?.label}
          </h2>
          <p className="text-gray-400">
            Showing {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filters, or check other locations
            </p>
            <Button
              variant="outline"
              className="border-purple-500/30 text-black hover:bg-purple-500/20 hover:text-white"
              onClick={() => {
                setSearchQuery("");
                setActiveLanguage("all");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <Card key={movie.id} className="group overflow-hidden bg-white/5 backdrop-blur-xl border-purple-500/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                <div className="relative">
                  <img
                    src={movie.image_url || "https://images.unsplash.com/photo-1489599150050-1c7675daa1a8?w=400&h=600&fit=crop"}
                    alt={movie.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                    <span className="text-white text-sm">{movie.rating}</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full px-3 py-1">
                    <span className="text-white text-sm font-bold">Movie</span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-orange-500/80 text-white border-none backdrop-blur-sm">
                      {movie.language}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2"
                      onClick={() => handleShare(movie)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="text-white font-bold text-lg mb-2 line-clamp-1">{movie.title}</h4>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-purple-300 text-sm font-semibold">{movie.price_range}</span>
                    <span className="text-gray-400 text-xs">{movie.duration}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-3">{movie.genre}</p>
                  <Button
                    onClick={() => handleBookTicket(movie.id, movie.title)}
                    disabled={loadingMovie === movie.id}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300"
                  >
                    {loadingMovie === movie.id ? (
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

export default Movies;
