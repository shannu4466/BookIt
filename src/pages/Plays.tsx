import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, MapPin, Clock, Search, Filter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MobileNavigation from "@/components/MobileNavigation";
import { supabase } from "@/integrations/supabase/client";
import WishlistButton from "@/components/WishlistButton";
import { useAuth } from "@/contexts/AuthContext";

interface Play {
  id: string;
  title: string;
  description: string;
  genre: string;
  rating: number;
  duration: string;
  language: string;
  image_url: string;
  price_range: string;
  location: string;
  venue: string;
}

const Plays = () => {
  const navigate = useNavigate();
  const [plays, setPlays] = useState<Play[]>([]);
  const [filteredPlays, setFilteredPlays] = useState<Play[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth()

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
  const genres = ["Drama", "Comedy", "Musical", "Romance", "Thriller", "Historical"];

  useEffect(() => {
    const storedLocation = localStorage.getItem("selectedLocation") || "";
    setSelectedLocation(storedLocation.toLowerCase());
    fetchPlays();
  }, []);

  const fetchPlays = async () => {
    const { data, error } = await supabase
      .from("plays")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching plays:", error);
      return;
    }

    const formattedPlays =
      data?.map((play) => ({
        ...play,
        venue: play.venue || "Unknown Theatre",
      })) || [];

    setPlays(formattedPlays);
    setFilteredPlays(formattedPlays);
    setLoading(false);
  };

  useEffect(() => {
    let filtered = [...plays];

    if (searchTerm) {
      filtered = filtered.filter(
        (play) =>
          play.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          play.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation && selectedLocation !== "all") {
      filtered = filtered.filter((play) =>
        play.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedGenre && selectedGenre !== "all") {
      filtered = filtered.filter((play) =>
        play.genre.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    setFilteredPlays(filtered);
  }, [searchTerm, selectedLocation, selectedGenre, plays]);

  const handlePlayClick = (play: Play) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/play/${play.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 pb-16 md:pb-0">
      <nav className="bg-black/30 backdrop-blur-xl border-b border-rose-500/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="hidden md:block">
              <Button variant="ghost" size="sm" className="text-white hover:bg-rose-500/20 border border-rose-500/30 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              Theatre Plays
            </h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your play here"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-rose-500/30 text-white placeholder:text-gray-300"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-rose-400" />
                  <span className="text-white text-sm">Filters:</span>
                </div>
                <Select value={selectedGenre} onValueChange={(value) => setSelectedGenre(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-48 bg-white/10 border-rose-500/30 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-rose-500/30">
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              Events in {localStorage.getItem("selectedLocation")}
            </h2>
            <p className="text-gray-400">
              Showing {filteredPlays.length} event{filteredPlays.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredPlays.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-white mb-4">No plays found</h3>
              <p className="text-gray-300">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlays.map((play, index) => (
                <motion.div
                  key={play.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border-rose-500/20 overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <div className="relative">
                      <img
                        src={play.image_url}
                        alt={play.title}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                        <span className="text-white text-sm">{play.rating}</span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-rose-500/80 text-white border-none mb-2">
                          {play.genre}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">
                        {play.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{play.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-300">
                          <MapPin className="h-4 w-4 mr-2 text-rose-400" />
                          <span>{play.venue}, {play.location}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Clock className="h-4 w-4 mr-2 text-pink-400" />
                          <span>{play.duration}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-rose-300 font-bold">{play.price_range}</span>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayClick(play)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default Plays;
