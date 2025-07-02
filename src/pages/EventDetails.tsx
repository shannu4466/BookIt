import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Calendar, Clock, Users, IndianRupee } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  event_date: string;
  event_time: string;
  image_url: string;
  price_range: string;
  location: string;
  venue: string;
  language: string;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Failed to fetch event details");
        setLoading(false);
        return;
      }

      setEvent({
        ...data,
        language: data.category || 'General', // Use category as language fallback
        rating: Number(data.rating) || 4.5
      });
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const handleBookTicket = async () => {
    setBookingLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Redirecting to booking...",
      description: `Booking tickets for ${event?.title}`,
    });

    setTimeout(() => {
      navigate(`/booking/event/${id}`);
      setBookingLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading event details...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Event not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <nav className="bg-black/30 backdrop-blur-xl border-b border-blue-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/events">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-500/20 border border-blue-500/30 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {event.title}
            </h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
            <span className="text-white text-sm">{event.rating}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{event.title}</h2>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
              {event.category}
            </Badge>
            <p className="text-gray-300 text-lg">{event.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-sky-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Venue</p>
                <p className="font-semibold">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-sky-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="font-semibold">{event.event_time}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-sky-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-semibold">{event.event_date}</p>
              </div>
            </div>
            <div className="flex items-center">
              <IndianRupee className="h-5 w-5 text-sky-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Price Range</p>
                <p className="font-semibold">{event.price_range}</p>
              </div>
            </div>
          </div>

          <Card className="bg-white/5 backdrop-blur-xl border-blue-500/20">
            <CardContent className="p-6 flex justify-between items-center">
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all duration-300"
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

export default EventDetails;
