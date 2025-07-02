import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Film, Calendar, Music, Trophy, MapPin, Search, Star, Percent, Gift, Ticket, ArrowUp, Users, Heart, Bot, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import TrendingSection from "@/components/TrendingSection";
import MobileNavigation from "@/components/MobileNavigation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { FaGithub } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { AiOutlineLinkedin } from "react-icons/ai";
import ModernSlider from "./ModernSlider";
import { UserPlus } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  image_url: string;
  valid_until: string;
  category: string;
  color_gradient: string;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('selectedLocation') || "hyderabad";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);

  const [filteredContent, setFilteredContent] = useState([]);
  const [allContent, setAllContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasLoggedInBefore = localStorage.getItem("hasLoggedIn");

    if (!hasLoggedInBefore && user) {
      // First time login
      localStorage.setItem("hasLoggedIn", "true");
      setShowWelcomeCard(true);
    }
  }, [user]);

  // Save location preference
  useEffect(() => {
    localStorage.setItem('selectedLocation', selectedLocation);
  }, [selectedLocation]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch offers from Supabase
  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        toast.error('Failed to load offers');
      } else {
        setOffers(data || []);
      }
      setLoadingOffers(false);
    };

    fetchOffers();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Search data for selected location
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);

      const tables = [
        { name: "movies", type: "Movie" },
        { name: "events", type: "Event" },
        { name: "plays", type: "Play" },
        { name: "sports", type: "Sport" },
      ];

      try {
        const allResults = await Promise.all(
          tables.map(async (table) => {
            const { data, error } = await supabase
              .from(table.name)
              .select("*")

            if (error) {
              console.error(`Error fetching ${table.name}:`, error);
              return [];
            }

            return data.map((item) => ({
              ...item,
              type: table.type,
            }));
          })
        );

        const combinedData = allResults
          .flat()
          .map((item, index) => ({
            id: index + 1,
            ...item,
          }));

        setAllContent(combinedData);
      } catch (err) {
        console.error("Error fetching content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Search functionality filtering
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();

      // Only search in content relevant to the current location
      const filtered = filteredContent.filter((item: any) =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.type && item.type.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.language && item.language.toLowerCase().includes(query))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filteredContent]);

  const handleBookNow = (id: string, eventType: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`${eventType}/${id}`);
  };

  const handleMoreInfo = (offerId: string) => {
    navigate(`/offer/${offerId}`);
  };

  const handleCategoryClick = (categoryTitle: string) => {
    scrollToTop();
  };

  const stats = [
    { icon: Users, label: "Happy Customers", value: "5M+" },
    { icon: Ticket, label: "Tickets Sold", value: "100M+" },
    { icon: MapPin, label: "Cities Covered", value: "100+" },
    { icon: Heart, label: "Customer Rating", value: "4.9★" }
  ];

  useEffect(() => {
    const locationFromStorage = localStorage.getItem("selectedLocation") || "hyderabad";

    const filtered = allContent.filter(
      item => item.location?.toLowerCase() === locationFromStorage.toLowerCase()
    );

    setFilteredContent(filtered);
  }, [allContent, selectedLocation]);

  const displayName = user?.user_metadata?.name || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pb-16 md:pb-0">
      {/* Sticky Header - Only visible on Index page */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row items-normal md:items-center gap-3 md:gap-4">
            <div className="flex justify-between items-center w-auto md:w-1/2">
              <div className="flex items-center space-x-2 order-1 md:order-2">
                <Ticket className="h-5 md:h-6 w-5 md:w-6 text-purple-400" />
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  BookIt
                </h1>
              </div>

              <div className="flex justify-between items-center order-2 md:order-1">
                <div className="md:order-2">
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-[130px] md:w-[200px] h-8 md:h-9 bg-white/10 border-purple-500/30 text-white text-xs md:text-sm flex justify-around">
                      <MapPin className="h-3 md:h-4 w-3 md:w-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:order-1 md:mr-3">
                  {user ? (
                    <div className="scale-75 md:scale-100">
                      <UserProfile />
                    </div>
                  ) : (
                    <Link to="/login">
                      <Button variant="outline" className="ml-[3px] h-8 md:h-9 px-3 md:px-4 border-purple-500/30 text-black hover:bg-purple-500/20 hover:text-white text-xs md:text-sm">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl order-3 md:order-2 w-full ">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 md:h-5 w-4 md:w-5" />
                <Input
                  placeholder="Search movies, events, plays, sports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-white/10 backdrop-blur-md border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-6 px-4 bg-black/20">
          <div className="container mx-auto">
            <div className="bg-black/20 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
                Search Results for "{searchQuery}" in {locations.find(l => l.value === selectedLocation)?.label} ({searchResults.length} found)
              </h3>
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 text-lg">No results found for "{searchQuery}" in {locations.find(l => l.value === selectedLocation)?.label}</p>
                  <p className="text-gray-500 text-sm mt-2">Try changing your location or search term</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-purple-500/30 text-black hover:bg-purple-500/20 hover:text-white"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {searchResults.map((item) => (
                    <Card key={item.id} className="group overflow-hidden bg-white/5 backdrop-blur-xl border-purple-500/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                      <div className="relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-40 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/70 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 flex items-center">
                          <Star className="h-3 md:h-4 w-3 md:w-4 text-yellow-400 mr-1 fill-current" />
                          <span className="text-white text-xs md:text-sm">{item.rating}</span>
                        </div>
                        <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-2 md:px-3 py-1">
                          <span className="text-white text-xs md:text-sm font-bold">{item.type}</span>
                        </div>
                        {item.language && (
                          <div className="absolute bottom-2 left-2 bg-orange-500/80 rounded-full px-2 py-1">
                            <span className="text-white text-xs font-medium">{item.language}</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 md:p-4">
                        <h4 className="text-white font-bold text-sm md:text-lg mb-2 line-clamp-1">{item.title}</h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-300 text-xs md:text-sm">{item.price}</span>
                          <span className="text-gray-400 text-xs capitalize">{item.category}</span>
                        </div>
                        <Button
                          onClick={() => handleBookNow(item.id, item.type.toLowerCase())}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-xs md:text-sm"
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {(showWelcomeCard && user) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white/10 backdrop-blur-xl border-purple-500/20 text-white">
            <CardHeader>
              <CardTitle>🎉 Welcome! {displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Thanks for signing in! Explore the app and make your bookings of your favourite <span className="text-[red]">Movies, Events, Plays </span>and <span className="text-[red]">Sports</span> at lowest prices ever.</p>
              <p>You can change your <span className="text-[red]">Name</span>, <span className="text-[red]">Mobile number</span> and even you can update your <span className="text-[red]">Password</span> directly from the settings.</p>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setShowWelcomeCard(false)} className="bg-purple-600 hover:bg-purple-700">
                  Got it!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Hero Section - Only show when not searching */}
      {!searchQuery && (
        <section className="relative py-8 md:py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Your Entertainment Hub
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
              Discover and book tickets for movies, events, plays, and sports in {locations.find(l => l.value === selectedLocation)?.label}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
                Telugu Cinema Available
              </Badge>
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 px-4 py-2">
                Live Events
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
                Sports Matches
              </Badge>
            </div>
          </div>
        </section>
      )}

      {/* Modern slider */}
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <UserPlus />For you
        </h3>
        <ModernSlider />
      </div>

      {/* Stats Section */}
      {/* {!searchQuery && (
        <section className="py-6 md:py-12 px-4 bg-gradient-to-r from-purple-950/50 to-blue-950/50">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-xl border-purple-500/20 text-center p-3 md:p-6">
                  <stat.icon className="h-6 md:h-10 w-6 md:w-10 text-purple-400 mx-auto mb-2 md:mb-4" />
                  <div className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-300">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )} */}

      {/* Categories */}
      {!searchQuery && (
        <section className="py-8 md:py-12 px-4 hidden md:block">
          <div className="container mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">What are you looking for?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: "Movies", icon: Film, link: "/movies", color: "from-purple-600 to-pink-600" },
                { title: "Events", icon: Calendar, link: "/events", color: "from-emerald-600 to-cyan-600" },
                { title: "Plays", icon: Music, link: "/plays", color: "from-rose-600 to-pink-600" },
                { title: "Sports", icon: Trophy, link: "/sports", color: "from-blue-600 to-indigo-600" },
              ].map((category) => (
                <Link key={category.title} to={category.link} onClick={() => handleCategoryClick(category.title)}>
                  <Card className="group overflow-hidden bg-white/5 backdrop-blur-xl border-purple-500/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                    <CardContent className="p-4 md:p-6 text-center">
                      <div className={`w-10 md:w-14 h-10 md:h-14 mx-auto mb-3 md:mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className="h-5 md:h-7 w-5 md:w-7 text-white" />
                      </div>
                      <h4 className="text-white font-bold text-sm md:text-lg group-hover:text-purple-300 transition-colors">
                        {category.title}
                      </h4>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      {!searchQuery && <TrendingSection selectedLocation={selectedLocation} />}

      {/* Featured Section */}
      {!searchQuery && (
        <section className="py-8 md:py-12 px-4">
          <div className="container mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
              Featured This Week in {locations.find(l => l.value === selectedLocation)?.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredContent.slice(0, 4).map((event) => (
                <Card key={event.id} className="group overflow-hidden bg-white/5 backdrop-blur-xl border-purple-500/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                  <div className="relative">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/70 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 flex items-center">
                      <Star className="h-3 md:h-4 w-3 md:w-4 text-yellow-400 mr-1 fill-current" />
                      <span className="text-white text-xs md:text-sm">{event.rating}</span>
                    </div>
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-2 md:px-3 py-1">
                      <span className="text-white text-xs md:text-sm font-bold">{event.type}</span>
                    </div>
                    {event.language && (
                      <div className="absolute bottom-2 left-2 bg-orange-500/80 rounded-full px-2 py-1">
                        <span className="text-white text-xs font-medium">{event.language}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 md:p-4">
                    <h4 className="text-white font-bold text-sm md:text-lg mb-2 line-clamp-1">{event.title}</h4>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-purple-300 text-xs md:text-sm font-semibold">{event.price}</span>
                      <div className="flex items-center text-gray-400 text-xs">
                        <span className="capitalize">{event.category}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleBookNow(event.id, event.type.toLowerCase())}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-xs md:text-sm"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Special Offers */}
      {!searchQuery && (
        <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-slate-950/80 via-purple-950/40 to-slate-950/80 backdrop-blur-sm">
          <div className="container mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <Gift className="h-8 md:h-12 w-8 md:w-12 text-purple-400" />
                Special Offers
              </h3>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto px-4">Don't miss out on these amazing deals and exclusive offers!</p>
            </div>

            {loadingOffers ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-16 md:h-32 w-16 md:w-32 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {offers.slice(0, 4).map((offer) => (
                  <Card key={offer.id} className="group overflow-hidden bg-red-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-purple-500/30 hover:bg-white/15 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400/60 rounded-3xl">
                    <div className="relative overflow-hidden">
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-40 md:h-52 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute top-2 md:top-4 right-2 md:right-4 bg-gradient-to-r ${offer.color_gradient} rounded-2xl px-2 md:px-4 py-1 md:py-2 shadow-xl border border-white/20`}>
                        <span className="text-white text-xs md:text-sm font-bold">{offer.discount}</span>
                      </div>
                      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                        <Badge variant="secondary" className="bg-black/80 text-white border-none backdrop-blur-sm rounded-full px-2 md:px-3 py-1">
                          <Percent className="h-3 w-3 mr-1 md:mr-2" />
                          <span className="text-xs">{offer.valid_until}</span>
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 md:p-6">
                      <h4 className="text-white font-bold text-lg md:text-xl mb-2 md:mb-3 line-clamp-2">{offer.title}</h4>
                      <p className="text-gray-300 text-xs md:text-sm mb-3 md:mb-4 line-clamp-3 leading-relaxed">{offer.description}</p>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl transition-all duration-300 rounded-xl font-semibold py-2 md:py-3 text-xs md:text-sm"
                        onClick={() => handleMoreInfo(offer.id)}
                      >
                        More Information
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Scroll to Top Button */}
      {/* {showScrollTop && (
        <Button
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 rounded-full w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )} */}

      {/* Footer */}
      <footer className="bg-black/50 border-t border-purple-500/20 py-6 md:py-8 px-4 hidden sm:flex">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
            <Ticket className="h-5 md:h-6 w-5 md:w-6 text-purple-400" />
            <span className="text-lg md:text-xl font-bold text-white">BookIt</span>
          </div>
          <p className="text-gray-400 text-sm md:text-base">Your one-stop destination for entertainment tickets</p>
          <div className="mt-4 flex justify-center space-x-4 text-gray-400 text-xs md:text-sm">
            <span>Serving {locations.find(l => l.value === selectedLocation)?.label}</span>
            <span>•</span>
            <span>24/7 Support</span>
            <span>•</span>
            <span>Secure Booking</span>
          </div><br />

          <div className=" flex items-center justify-center space-x-2">
            <button
              onClick={() => window.open("https://shannuportfolio.netlify.app")}
              title="Portfolio"
              className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <User className="text-xl" />
            </button>
            <button
              onClick={() => window.open("https://github.com/shannu4466")}
              title="Github"
              className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <FaGithub className="text-xl" />
            </button>
            <button
              onClick={() => window.open("https://instagram.com/shannu4466")}
              title="Instagram"
              className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <FaInstagram className="text-xl" />
            </button>
            <button
              onClick={() => window.open("https://www.linkedin.com/in/shanmukha-rao-thangudu-504a72250/")}
              title="Linkedin"
              className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            >
              <AiOutlineLinkedin className="text-xl" />
            </button>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} BookIt. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <div className="fixed bottom-20 right-4 z-[9999] mb-[env(safe-area-inset-bottom)] animate-bounce">
        <button
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg transition flex items-center justify-center"
          aria-label="Open Chat"
          onClick={() => navigate('/chatbot')}
          title="Chat with AI"
        >
          <Bot className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Index;
