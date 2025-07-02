
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Calendar, Music, Trophy, Search, Plus, Edit, Trash2, TrendingUp, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  location: string;
  is_trending: boolean;
  status: string;
  created_at: string;
  rating?: number;
  price_range?: string;
  image_url?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<ContentItem[]>([]);
  const [events, setEvents] = useState<ContentItem[]>([]);
  const [plays, setPlays] = useState<ContentItem[]>([]);
  const [sports, setSports] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("adminStoredLocation") || "all";
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("adminStoredEventType") || "movies";
  });

  const locations = [
    { value: "all", label: "All Locations" },
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

  useEffect(() => {
    localStorage.setItem("adminStoredLocation", selectedLocation);
    localStorage.setItem("adminStoredEventType", activeTab)
  }, [selectedLocation, activeTab])

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    fetchAllContent();
  }, [navigate]);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const [moviesRes, eventsRes, playsRes, sportsRes] = await Promise.all([
        supabase.from('movies').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('plays').select('*').order('created_at', { ascending: false }),
        supabase.from('sports').select('*').order('created_at', { ascending: false })
      ]);

      if (moviesRes.error) throw moviesRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (playsRes.error) throw playsRes.error;
      if (sportsRes.error) throw sportsRes.error;

      setMovies(moviesRes.data || []);
      setEvents(eventsRes.data || []);
      setPlays(playsRes.data || []);
      setSports(sportsRes.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const toggleTrending = async (type: string, id: string, currentStatus: boolean) => {
    try {
      let updateResult;
      if (type === 'movies') {
        updateResult = await supabase
          .from('movies')
          .update({ is_trending: !currentStatus })
          .eq('id', id);
      } else if (type === 'events') {
        updateResult = await supabase
          .from('events')
          .update({ is_trending: !currentStatus })
          .eq('id', id);
      } else if (type === 'plays') {
        updateResult = await supabase
          .from('plays')
          .update({ is_trending: !currentStatus })
          .eq('id', id);
      } else if (type === 'sports') {
        updateResult = await supabase
          .from('sports')
          .update({ is_trending: !currentStatus })
          .eq('id', id);
      }

      if (updateResult?.error) throw updateResult.error;

      toast.success(`${currentStatus ? 'Removed from' : 'Added to'} trending`);
      fetchAllContent();
    } catch (error) {
      console.error('Error updating trending status:', error);
      toast.error('Failed to update trending status');
    }
  };

  const editItem = (type: string, id: string) => {
    navigate(`/admin/edit/${type.slice(0, -1)}/${id}`);
  };

  const deleteItem = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      let deleteResult;
      if (type === 'movies') {
        deleteResult = await supabase.from('movies').delete().eq('id', id);
      } else if (type === 'events') {
        deleteResult = await supabase.from('events').delete().eq('id', id);
      } else if (type === 'plays') {
        deleteResult = await supabase.from('plays').delete().eq('id', id);
      } else if (type === 'sports') {
        deleteResult = await supabase.from('sports').delete().eq('id', id);
      }

      if (deleteResult?.error) throw deleteResult.error;

      toast.success('Item deleted successfully');
      fetchAllContent();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const filterContent = (content: ContentItem[]) => {
    return content.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  };

  const renderContentGrid = (content: ContentItem[], type: string) => {
    const filteredContent = filterContent(content);

    if (filteredContent.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No {type} found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-4">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold text-lg line-clamp-1">{item.title}</h3>
                {item.is_trending && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>

              <p className="text-gray-300 text-sm mb-2 line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>{item.location}</span>
                {item.rating && <span>★ {item.rating}</span>}
              </div>

              {item.price_range && (
                <p className="text-purple-300 text-sm mb-3">{item.price_range}</p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTrending(type, item.id, item.is_trending)}
                  className="flex-1 border-purple-500/30 text-black hover:bg-purple-500/20 hover:text-white"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {item.is_trending ? 'Remove' : 'Trend'}
                </Button>

                <Button size="sm"
                  variant="outline"
                  title="Edit"
                  onClick={() => editItem(type, item.id)}
                  className="border-black-500/30 text-black-600 hover:bg-green-500 hover:text-black"
                >
                  <Edit className="h-3 w-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  title="Delete"
                  onClick={() => deleteItem(type, item.id)}
                  className="border-red-500/30 text-red-600 hover:bg-red-500/20 hover:text-white"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-purple-500/30 text-black hover:bg-purple-500/20 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Movies</CardTitle>
              <Film className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{movies.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Events</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{events.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Plays</CardTitle>
              <Music className="h-4 w-4 text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{plays.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Sports</CardTitle>
              <Trophy className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{sports.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
            />
          </div>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full md:w-[200px] bg-white/10 border-purple-500/30 text-white">
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

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <TabsList className="grid w-full md:w-auto grid-cols-4 bg-white/5 border-purple-500/20">
              <TabsTrigger value="movies" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                <Film className="h-4 w-4 mr-2" />
                Movies
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="plays" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                <Music className="h-4 w-4 mr-2" />
                Plays
              </TabsTrigger>
              <TabsTrigger value="sports" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white">
                <Trophy className="h-4 w-4 mr-2" />
                Sports
              </TabsTrigger>
            </TabsList>

            <Button
              onClick={() => navigate(`/admin/add/${activeTab.slice(0, -1)}`)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab.slice(0, -1)}
            </Button>
          </div>

          <TabsContent value="movies">
            {renderContentGrid(movies, 'movies')}
          </TabsContent>

          <TabsContent value="events">
            {renderContentGrid(events, 'events')}
          </TabsContent>

          <TabsContent value="plays">
            {renderContentGrid(plays, 'plays')}
          </TabsContent>

          <TabsContent value="sports">
            {renderContentGrid(sports, 'sports')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
