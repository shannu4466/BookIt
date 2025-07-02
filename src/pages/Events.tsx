
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Star, MapPin, Filter, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileNavigation from "@/components/MobileNavigation";
import { toast } from "@/hooks/use-toast";
import { useEvents } from "@/hooks/useEvents";
import { eventNames, title } from "process";

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('selectedLocation') || "hyderabad";
  });
  const [loadingEvent, setLoadingEvent] = useState<string | null>(null);

  // Fetch events from database
  const { data: events = [], isLoading } = useEvents(selectedLocation);

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

  // Get unique categories from database
  const categories = ["all", ...Array.from(new Set(events.map(event => event.category)))];

  // Filter events based on search, category, and location
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleBookNow = async (eventId: string, link: string, title: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingEvent(eventId);

    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Success",
      description: `Redirected to ${title} details page...`,
    });

    setTimeout(() => {
      navigate(`/event/${eventId}`);
      setLoadingEvent(null);
    }, 1000);
  };

  const handleShare = async (event: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} - ${event.category} event`,
          url: window.location.origin + `/event/${event.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/event/${event.id}`);
      toast({
        title: "Success",
        description: "Link copied to clipboard!",
      });
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
      <nav className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Events</h1>
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

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
            <Input
              placeholder="Search your event here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 backdrop-blur-md border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400 rounded-full"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-purple-400" />
              <span className="text-white text-sm">Filters:</span>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[130px] bg-white/10 border-purple-500/30 text-white text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Events in {locations.find(l => l.value === selectedLocation)?.label}
          </h2>
          <p className="text-gray-400">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filters, or check other locations
            </p>
            <Button
              variant="outline"
              className="border-purple-500/30 text-black hover:bg-purple-500/20 hover:text-white"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="group overflow-hidden bg-white/5 backdrop-blur-xl border-purple-500/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                <div className="relative">
                  <img
                    src={event.image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=400&fit=crop"}
                    alt={event.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                    <span className="text-white text-sm">{event.rating}</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full px-3 py-1">
                    <span className="text-white text-sm font-bold">Event</span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-orange-500/80 text-white border-none backdrop-blur-sm">
                      {event.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2"
                      onClick={() => handleShare(event)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="text-white font-bold text-lg mb-2 line-clamp-1">{event.title}</h4>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-purple-300 text-sm font-semibold">{event.price_range}</span>
                    <span className="text-gray-400 text-xs">
                      {locations.find(l => l.value === event.location)?.label}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleBookNow(event.id, `/event/${event.id}`, event.title)}
                    disabled={loadingEvent === event.id}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300"
                  >
                    {loadingEvent === event.id ? (
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

export default Events;
