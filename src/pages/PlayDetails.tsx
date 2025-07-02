import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Calendar, Clock, IndianRupee } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PlayDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [play, setPlay] = useState<null | {
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
  }>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchPlay = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("plays")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Failed to fetch play details");
        setLoading(false);
        return;
      }

      setPlay({ ...data, venue: data.venue || 'Unknown Theatre' });
      setLoading(false);
    };

    fetchPlay();
  }, [id]);

  const handleBookTicket = async () => {
    setBookingLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Redirecting to booking...",
      description: `Booking tickets for ${play?.title}`,
    });

    setTimeout(() => {
      navigate(`/booking/play/${id}`);
      setBookingLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading play details...
      </div>
    );
  }

  if (error || !play) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Play not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900">
      <nav className="bg-black/30 backdrop-blur-xl border-b border-rose-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/plays">
              <Button variant="ghost" size="sm" className="text-white hover:bg-rose-500/20 border border-rose-500/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plays
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              {play.title}
            </h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative">
          <img
            src={play.image_url}
            alt={play.title}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
            <span className="text-white text-sm">{play.rating}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{play.title}</h2>
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 mb-4 mr-2">
              {play.genre}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4">
              {play.language}
            </Badge>
            <p className="text-gray-300 text-lg">{play.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-sky-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Theatre</p>
                <p className="font-semibold">{play.venue}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-sky-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold">{play.duration}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-sky-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-semibold">{play.location}</p>
              </div>
            </div>
            <div className="flex items-center">
              <IndianRupee className="h-5 w-5 text-sky-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Price Range</p>
                <p className="font-semibold">{play.price_range}</p>
              </div>
            </div>
          </div>

          <Card className="bg-white/5 backdrop-blur-xl border-rose-500/20">
            <CardContent className="p-6 flex justify-between items-center">
              <Button
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-500/25 transition-all duration-300"
                onClick={handleBookTicket}
                disabled={bookingLoading}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayDetails;
