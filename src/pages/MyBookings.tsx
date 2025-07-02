import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Users, CreditCard, Filter, ArrowLeft, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import CancelTicketModal from "@/components/CancelTicketModal";
import TicketDownload from "@/components/TicketDownload";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  event_type: string;
  event_id: number;
  event_title: string;
  booking_date: string;
  show_time: string;
  location: string;
  venue?: string;
  screen_hall?: string;
  seats?: string[];
  ticket_quantity: number;
  price_per_ticket: number;
  total_amount: number;
  booking_fees: number;
  payment_method: string;
  payment_status: string;
  booking_status: string;
  created_at: string;
}

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({ isOpen: false, booking: null });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [userReviews, setUserReviews] = useState([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('booking_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = filterStatus === "all" || booking.booking_status === filterStatus;
    const typeMatch = filterType === "all" || booking.event_type === filterType;
    const searchMatch = searchQuery === "" ||
      booking.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && typeMatch && searchMatch;
  });

  const handleCancelTicket = async (booking: Booking) => {
    setCancelModal({ isOpen: true, booking });
  };

  const confirmCancelTicket = async () => {
    if (!cancelModal.booking) return;

    try {
      // 1. Cancel the booking
      const { error } = await supabase
        .from("booking_data")
        .update({ booking_status: "cancelled" })
        .eq("id", cancelModal.booking.id);

      if (error) {
        console.error("Error cancelling booking:", error);
        toast.error("Failed to cancel ticket");
      } else {
        toast.success("Ticket cancelled successfully");
        fetchBookings();
      }

      // 2. Set seat availability to true (instead of deleting)
      const { data, error: seatError } = await supabase
        .from("seat_bookings")
        .delete()
        .eq("booking_id", cancelModal.booking.id);
      console.log(cancelModal.booking.id)

      if (seatError) {
        console.error("Error updating seat availability:", seatError);
        toast.error("Ticket cancelled, but seats not freed up");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to cancel ticket");
    } finally {
      setCancelModal({ isOpen: false, booking: null });
    }
  };

  // Review button logic
  const isShowCompleted = (booking: any) => {
    const { booking_date, show_time } = booking;

    if (!booking_date || !show_time) return false;

    const showDateTime = new Date(`${booking_date}T${show_time}`);
    const now = new Date();

    return now >= showDateTime;
  };

  // Check if user is already given review for that movie or not
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("user_reviews")
        .select("id, movie_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching user reviews:", error.message);
      } else {
        setUserReviews(data || []);
      }
    };

    fetchUserReviews();
  }, [user?.id]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Not confirmed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'movie':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'event':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'play':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'sport':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 md:h-32 w-16 md:w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-purple-500/20 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Bookings
              </h1>
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
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 backdrop-blur-md border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400 rounded-full"
            />
          </div>

          <div className="flex flex sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-400" />
              <span className="text-white font-medium">Filters:</span>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 bg-white/10 border-purple-500/30 text-white">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48 bg-white/10 border-purple-500/30 text-white">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="play">Plays</SelectItem>
                <SelectItem value="sport">Sports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 md:p-12 max-w-md mx-auto">
              <Calendar className="h-16 w-16 text-purple-400 mx-auto mb-6 opacity-50" />
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No Bookings Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? "No bookings match your search criteria." : "You haven't made any bookings yet. Start exploring and book your favorite events!"}
              </p>
              <Link to="/">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Explore Events
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
              const showDateTime = new Date(`${booking.booking_date}T${booking.show_time}`);
              const isPastShow = new Date() >= showDateTime;

              const hasReviewed = userReviews.some(
                (review) => review.movie_id === booking.event_id
              );
              return (
                <Card key={booking.id} className="bg-white/5 backdrop-blur-xl border-purple-500/20 hover:bg-white/10 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-lg md:text-xl mb-2 line-clamp-2">
                          {booking.event_title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getTypeColor(booking.event_type)}>
                            {booking.event_type.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(booking.booking_status)}>
                            {booking.booking_status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 text-purple-400 mr-2" />
                        <span>{format(new Date(booking.booking_date), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="h-4 w-4 text-cyan-400 mr-2" />
                        <span>{booking.show_time}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-4 w-4 text-emerald-400 mr-2" />
                        <span className="truncate">{booking.location}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="h-4 w-4 text-rose-400 mr-2" />
                        <span>{booking.ticket_quantity} ticket{booking.ticket_quantity > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {booking.venue && (
                      <div className="text-sm text-gray-300">
                        <span className="text-purple-400">Venue:</span> {booking.venue}
                      </div>
                    )}

                    {booking.screen_hall && (
                      <div className="text-sm text-gray-300">
                        <span className="text-purple-400">Hall:</span> {booking.screen_hall}
                      </div>
                    )}

                    {booking.seats && booking.seats.length > 0 && (
                      <div className="text-sm text-gray-300">
                        <span className="text-purple-400">Seats:</span> {booking.seats.join(', ')}
                      </div>
                    )}

                    <div className="border-t border-purple-500/20 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Subtotal ({booking.ticket_quantity} x {booking.price_per_ticket}) {booking.ticket_quantity * booking.price_per_ticket > booking.total_amount ? "Coupon Applied" : ""} : </span>
                        <span className="text-white">₹{(booking.total_amount - booking.booking_fees).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Booking Fees :</span>
                        <span className="text-white">₹{booking.booking_fees.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span className="text-white">Total :</span>
                        <span className="text-green-400">₹{booking.total_amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-400">
                        <CreditCard className="h-4 w-4 mr-1" />
                        <span className="capitalize">{booking.payment_method}</span>
                      </div>
                      <span className="text-gray-400">
                        {format(new Date(booking.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      {booking.booking_status === 'confirmed' && (
                        <TicketDownload booking={booking} />
                      )}
                      {/* Review button */}
                      {booking.booking_status === "confirmed" && isPastShow && (
                        <Button
                          onClick={() =>
                            !hasReviewed && navigate(`/movie/${booking.event_id}?tab=reviews&openReview=true`)
                          }
                          disabled={hasReviewed}
                          title={hasReviewed ? "You have already reviewed this movie" : "Write your review"}
                          className={`transition-all duration-300 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 w-[200px]
                            ${hasReviewed
                              ? "bg-gradient-to-br from-gray-600 to-gray-800 text-white border border-gray-700 cursor-not-allowed"
                              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl"
                            }`}
                          style={{
                            cursor: hasReviewed ? "not-allowed" : "pointer"
                          }}
                        >
                          {hasReviewed ? "🚫 Thanks for giving review" : "Give us a review"}
                        </Button>
                      )}
                      {/* Cancel button for tickets */}
                      {booking.booking_status === 'confirmed' && new Date(booking.booking_date) > new Date() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelTicket(booking)}
                          className="border-red-500/30 text-red-600 hover:bg-red-500/20 hover:text-white"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancel Ticket Modal */}
      <CancelTicketModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, booking: null })}
        onConfirm={confirmCancelTicket}
        eventTitle={cancelModal.booking?.event_title || ""}
        bookingDate={cancelModal.booking?.booking_date || ""}
        showTime={cancelModal.booking?.show_time || ""}
        totalAmount={cancelModal.booking?.total_amount || 0}
      />
    </div>
  );
};

export default MyBookings;
