import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Calendar, Clock, Users, Trophy } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Sport {
  id: string;
  title: string;
  description: string;
  sport_type: string;
  teams: string;
  rating: number;
  match_date: string;
  match_time: string;
  image_url: string;
  price_range: string;
  location: string;
  venue: string;
}

const SportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sport, setSport] = useState<Sport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchSport = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Failed to fetch sport details");
        setLoading(false);
        return;
      }

      setSport({
        ...data,
        id: data.id
      });
      setLoading(false);
    };

    fetchSport();
  }, [id]);

  const handleBookTicket = async () => {
    setBookingLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Redirecting to booking...",
      description: `Booking tickets for ${sport?.title}`,
    });

    setTimeout(() => {
      navigate(`/booking/sport/${id}`);
      setBookingLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (error || !sport) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Sport not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
      <nav className="bg-black/30 backdrop-blur-xl border-b border-blue-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/sports">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-500/20 border border-blue-500/30 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sports
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {sport.title}
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative">
            <img
              src={sport.image_url}
              alt={sport.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{sport.title}</h2>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
                {sport.sport_type}
              </Badge>
              <p className="text-gray-300 text-lg">{sport.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-300">
                <MapPin className="h-5 w-5 text-blue-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Venue</p>
                  <p className="font-semibold">{sport.venue}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-300">
                <Calendar className="h-5 w-5 text-purple-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Date & Time</p>
                  <p className="font-semibold">{new Date(sport.match_date).toLocaleDateString()} • {sport.match_time}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="h-5 w-5 text-indigo-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-semibold">{sport.location}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-300">
                <Users className="h-5 w-5 text-cyan-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-400">Teams</p>
                  <p className="font-semibold">{sport.teams}</p>
                </div>
              </div>
            </div>

            <Card className="bg-white/5 backdrop-blur-xl border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">Price Range</p>
                    <p className="text-white font-bold text-2xl">{sport.price_range}</p>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-300"
                    onClick={handleBookTicket}
                    size="lg"
                  >
                    {bookingLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      "Book Tickets"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportDetails;
