import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MapPin, Users, CreditCard, Ticket, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DuplicateBookingModal from "@/components/DuplicateBookingModal";
import MobileNavigation from "@/components/MobileNavigation";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // This should exist or be created
import { match } from "assert";
import { v4 as uuidv4 } from "uuid";


const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eventType, setEventType] = useState<string>("");
  const [eventData, setEventData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectedScreen, setSelectedScreen] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [bookingFees, setBookingFees] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateBookingData, setDuplicateBookingData] = useState<any>(null);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [enteredCoupon, setEnteredCoupon] = useState("");

  const [movie, setMovie] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [screenPrice, setScreenPrice] = useState(0);

  useEffect(() => {
    if (!selectedDate) return;

    const today = new Date();
    const selected = new Date(selectedDate);

    // Check if event date is before today
    if (selected < new Date(today.toDateString())) {
      setIsExpired(true);
      setTimeExpired(false);
      return;
    }

    // Check time only if date is today
    if (selected.toDateString() === today.toDateString() && selectedTime) {
      const now = today.getHours() * 60 + today.getMinutes();
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const selectedMinutes = hours * 60 + minutes;

      if (selectedMinutes <= now) {
        setTimeExpired(true);
        setIsExpired(false);
        return;
      }
    }

    // Reset if everything is valid
    setIsExpired(false);
    setTimeExpired(false);
  }, [selectedDate, selectedTime]);

  // Get event type from URL path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('booking/movie/')) {
      setEventType('movie');
    } else if (path.includes('booking/event/')) {
      setEventType('event');
    } else if (path.includes('booking/play/')) {
      setEventType('play');
    } else if (path.includes('booking/sport/')) {
      setEventType('sport');
    }
  }, []);

  // Mock event data based on type and ID
  useEffect(() => {
    const fetchMovie = async () => {
      let tableName: 'movies' | 'events' | 'plays' | 'sports' | null = null;

      if (eventType === 'movie') tableName = 'movies';
      else if (eventType === 'event') tableName = 'events';
      else if (eventType === 'play') tableName = 'plays';
      else if (eventType === 'sport') tableName = 'sports';

      if (!tableName) return;

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error.message);
        setMovie(null);
        setIsLoading(false);
        return;
      }

      const calculateWeightedPrice = (priceRange: string, weight = 0.5): number => {
        if (!priceRange) return 0;
        const prices = priceRange.replace(/₹/g, '').split('-').map(p => parseInt(p.trim(), 10));
        const [min, max] = prices;

        if (prices.length === 2 && !isNaN(min) && !isNaN(max)) {
          return Math.round(min + weight * (max - min));
        }
        return !isNaN(min) ? min : 0;
      };


      const averagePrice = calculateWeightedPrice(data?.price_range || "", 0.3);

      setIsLoading(false);
      setMovie(data);
      setEventData({ ...data, price: averagePrice });
    };

    if (id) {
      fetchMovie();
    }
  }, [id, eventType]);

  // (1) Get showtimes from DB or use defaults
  const extractShowTimes = (data: any): string[] => {
    if (Array.isArray(data?.show_times) && data.show_times.length > 0) {
      return data.show_times;
    }
    // Fallback defaults by event type
    if (eventType === "movie") return ["10:00", "14:00", "18:00", "22:00"];
    if (eventType === "play") return data?.show_times ? [data.show_times] : ["18:00"];
    if (eventType === "event") return data?.event_time ? [data.event_time] : ["17:00"];
    if (eventType === "sport") return data?.match_time ? [data.match_time] : ["18:30"];
    return [];
  };

  const [availableShowTimes, setAvailableShowTimes] = useState<string[]>([]);

  useEffect(() => {
    if (eventData) {
      setAvailableShowTimes(extractShowTimes(eventData));
    }
  }, [eventData]);

  const isToday = (selectedDate === new Date().toISOString().split("T")[0]);

  const filteredShowTimes = isToday
    ? availableShowTimes.filter((time) => {
      const now = new Date();
      const showTime = new Date(`${selectedDate} ${time.replace(/(am|pm)$/i, " $1")}`);
      return showTime.getTime() > now.getTime();
    })
    : availableShowTimes;


  // (2) For events/plays/sports, only enable their scheduled dates
  const getEventSpecificDate = () => {
    if (!eventData) return null;
    if (eventType === "movie") return null;
    if (eventType === "event") return eventData.event_date;
    if (eventType === "play") {
      const rawDate = eventData?.show_times?.[0];
      if (rawDate && rawDate.includes(" ")) {
        return rawDate.split(" ")[0]; // returns YYYY-MM-DD
      }
      return null;
    }

    if (eventType === "sport") return eventData.match_date;
    return null;
  };

  const eventOnlyDate = getEventSpecificDate();

  const isEventDateInPast = eventOnlyDate && new Date(eventOnlyDate) < new Date();


  // (3) Mark event day in input and avoid others
  useEffect(() => {
    if (eventOnlyDate) {
      setSelectedDate(eventOnlyDate);
    }
  }, [eventOnlyDate]);

  // (4) SEAT LOGIC: Fetch already booked seats for this [id, date, time, screen] once date/time/screen change
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);

  useEffect(() => {
    if (
      !selectedDate || !selectedTime ||
      !id || !eventType || !eventData
    ) {
      setBookedSeats([]);
      return;
    }
    const fetchBooked = async () => {
      const { data, error } = await supabase
        .from("seat_bookings")
        .select("seat_number")
        .eq("event_id", id)
        .eq("event_type", eventType)
        .eq("show_date", selectedDate)
        .eq("show_time", selectedTime)
        .eq("screen_hall", selectedScreen || null);
      if (error) setBookedSeats([]);
      else setBookedSeats(data?.map((b: any) => b.seat_number) || []);
    };
    fetchBooked();
  }, [selectedDate, selectedTime, selectedScreen, id, eventType, eventData]);

  // (5) Seat selection toggle - disable booked seats
  const toggleSeat = (seat: string) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        return prev.filter(s => s !== seat);
      } else if (prev.length < ticketQuantity) {
        return [...prev, seat];
      }
      return prev;
    });
  };

  // (6) FETCH USER CLAIMED OFFERS AND FILTER VALID COUPONS BY EVENT TYPE
  const [userOffers, setUserOffers] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserOffers = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_offers')
        .select('*, offers (id, title, discount, valid_until, coupon_code, category)')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: false });
      if (!error && data) setUserOffers(data);
    };
    fetchUserOffers();
  }, [user]);

  // Flatten and filter only valid future coupons
  const validClaimedCoupons = userOffers
    .filter((c) => {
      const isNotExpired = new Date(c.offers.valid_until) >= new Date();
      const matchesCategory =
        c.offers.category.toLowerCase() === "general" || // general coupons work everywhere
        c.offers.category.toLowerCase() === eventType.toLowerCase(); // match specific event type

      return isNotExpired && matchesCategory;
    })
    .map((c) => ({
      coupon_code: c.offers.coupon_code,
      title: c.offers.title,
      category: c.offers.category,
      discount: c.offers.discount,
    }));



  const handleApplyCoupon = async () => {
    const entered = enteredCoupon.trim().toLowerCase();

    const matched = userOffers.find((c) => {
      const isValidDate = new Date(c.offers.valid_until) >= new Date();
      const isSameCategory = c.offers.category.toLowerCase() === eventType.toLowerCase();
      const isSameCode = c.offers.coupon_code.toLowerCase() === entered;

      return isValidDate && isSameCategory && isSameCode;
    });

    if (!matched) {
      setAppliedCoupon(null);
      setCouponError("Invalid or expired coupon for this event type.");
      return;
    }

    // Now check if user has already used this offer
    const { data: usage, error: usageError } = await supabase
      .from("coupon_usage")
      .select("*")
      .eq("user_id", matched.user_id)
      .eq("offer_id", matched.offer_id)
      .maybeSingle();

    if (usage) {
      setAppliedCoupon(null);
      setCouponError("You have already used this coupon.");
      return;
    }

    // Coupon is valid and unused
    setAppliedCoupon(matched.offers.coupon_code);
    setCouponError("");
  };


  // Adjusted price based on coupon
  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const foundOffer = validClaimedCoupons.find(o => o.coupon_code === appliedCoupon);
    if (!foundOffer) return 0;
    // Here, example: discount as percentage ("10% OFF") or numeric ("₹100 OFF")
    const disc = foundOffer.discount?.toString() || "";
    if (disc.endsWith("% OFF")) {
      const pct = parseFloat(disc);
      if (!pct) return 0;
      return Math.round((eventData.price * ticketQuantity) * (pct / 100));
    }
    // Try to extract numeric ("₹100 OFF" etc)
    const num = disc.match(/[\d]+/g)?.[0];
    return num ? parseInt(num) : 0;
  };

  // Calculate total amount
  useEffect(() => {
    if (selectedScreen === 'screen1') {
      setScreenPrice(70)
    } else if (selectedScreen === 'screen2') {
      setScreenPrice(50)
    } else {
      setScreenPrice(0)
    }
    if (eventData) {
      const baseAmount = eventData.price * ticketQuantity;
      setTotalAmount(baseAmount + bookingFees + (ticketQuantity * screenPrice));
    }
  }, [bookingFees, eventData, screenPrice, selectedScreen, ticketQuantity]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const checkForDuplicateBooking = async (bookingData: any) => {
    if (!user) return false;

    const { data: existingBookings, error } = await supabase
      .from('booking_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_title', bookingData.event_title)
      .eq('booking_date', bookingData.booking_date)
      .eq('show_time', bookingData.show_time);

    if (error) {
      console.error('Error checking duplicate bookings:', error);
      return false;
    }

    return existingBookings && existingBookings.length > 0;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("Please login to continue booking");
      navigate('/login');
      return;
    }

    const bookingData = {
      user_id: user.id,
      event_id: eventData.id,
      event_type: eventType,
      event_title: eventData.title,
      booking_date: selectedDate,
      show_time: selectedTime,
      ticket_quantity: ticketQuantity,
      price_per_ticket: eventData.price,
      total_amount: totalAmount - getCouponDiscount(),
      booking_fees: bookingFees,
      // payment_method: paymentMethod,
      venue: eventData.venue,
      location: eventData.location,
      seats: selectedSeats,
      screen_hall: selectedScreen || null,
      applied_coupon: appliedCoupon,
    };

    const { data, error } = await supabase
      .from("booking_data")
      .select();

    if (error) {
      toast.error("Booking failed: " + error.message);
      return;
    }

    if (selectedSeats.length > 0 && eventType === "movie") {
      const seatBookingsData = selectedSeats.map((seat) => ({
        event_id: id,
        event_type: eventType,
        show_date: selectedDate,
        show_time: selectedTime,
        seat_number: seat,
        screen_hall: selectedScreen,
        booking_id: data[0].id,
        is_available: false,
      }));

      const { error: seatError } = await supabase
        .from("seat_bookings")
        .insert(seatBookingsData);

      if (seatError) {
        console.error("Error saving seat bookings:", seatError);
      }
    }

    const isDuplicate = await checkForDuplicateBooking(bookingData);

    if (isDuplicate) {
      setDuplicateBookingData({
        eventTitle: bookingData.event_title,
        bookingDate: bookingData.booking_date,
        showTime: bookingData.show_time,
      });

      setPendingBookingData(bookingData);
      setShowDuplicateModal(true);
      return;
    }

    const randomId = uuidv4().split("-")[0];
    navigate(`/payment-gateway/${id}-${randomId}`, { state: { bookingData } });
  };

  // const proceedWithBooking = async (bookingData: any) => {
  //   try {
  //     // First, insert the booking
  //     const { data, error } = await supabase
  //       .from('booking_data')
  //       .insert([bookingData])
  //       .select();

  //     if (error) {
  //       console.error('Supabase error:', error);
  //       toast.error("Booking failed: " + error.message);
  //       return;
  //     }

  //     const booking = data?.[0];

  //     // Then, save the seat bookings if seats were selected (for movies)
  //     if (selectedSeats.length > 0 && eventType === 'movie') {
  //       const seatBookingsData = selectedSeats.map(seat => ({
  //         event_id: id,
  //         event_type: eventType,
  //         show_date: selectedDate,
  //         show_time: selectedTime,
  //         seat_number: seat,
  //         screen_hall: selectedScreen,
  //         booking_id: data[0].id,
  //         is_available: false
  //       }));

  //       const { error: seatError } = await supabase
  //         .from('seat_bookings')
  //         .insert(seatBookingsData);

  //       if (seatError) {
  //         console.error('Error saving seat bookings:', seatError);
  //       }
  //     }

  //     if (appliedCoupon) {
  //       // Get the offer object that matches the applied coupon
  //       const matchedOffer = userOffers.find(
  //         (c) => c.offers.coupon_code.toLowerCase() === appliedCoupon.toLowerCase()
  //       );

  //       if (matchedOffer) {
  //         const { error: couponError } = await supabase
  //           .from("coupon_usage")
  //           .insert([
  //             {
  //               user_id: user.id,
  //               offer_id: matchedOffer.offer_id,
  //               booking_id: booking.id,
  //               discount_amount: getCouponDiscount() // or matchedOffer.offers.discount if fixed
  //             }
  //           ]);


  //         if (couponError) {
  //           console.error("Coupon usage insert failed:", couponError);
  //           // You can toast or ignore depending on whether this is critical
  //         }
  //       }
  //     }

  //     toast.success("Booking confirmed successfully!");
  //     navigate('/my-bookings', { replace: true });
  //   } catch (error) {
  //     console.error('Error saving booking:', error);
  //     toast.error("Booking failed. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleDuplicateConfirm = () => {
    setShowDuplicateModal(false);
    if (pendingBookingData) {
      const randomId = uuidv4().split("-")[0];
      navigate(`/payment-gateway/${id}-${randomId}`, {
        state: { bookingData: pendingBookingData },
      });
    }
  };


  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setPendingBookingData(null);
    setIsLoading(false);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour <= 22; hour += 3) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
  };

  const generateSeats = () => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        seats.push(`${row}${i}`);
      }
    }
    return seats;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }
  const highlightDate = eventOnlyDate ? new Date(eventOnlyDate) : null;

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
                className="text-white hover:bg-purple-500/20 md:flex hidden hover:text-white"
                onClick={() => {
                  const previousPage = sessionStorage.getItem('previousPage');
                  if (previousPage) {
                    navigate(previousPage);
                  } else {
                    navigate(-1);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Book Tickets
              </h1>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {eventType?.charAt(0).toUpperCase() + eventType?.slice(1)}
            </Badge>
          </div>
        </div>
      </nav>

      {!isLoading && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Event Details */}
              <div className="lg:col-span-1">
                <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20 sticky top-24">
                  <div className="relative">
                    <img
                      src={eventData.image_url}
                      alt={eventData.title}
                      className="w-full h-64 md:h-80 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                      <span className="text-white text-sm">{eventData.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">{eventData.title}</h2>
                    {eventData.language && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 mb-3">
                        {eventData.language}
                      </Badge>
                    )}
                    <div className="space-y-3 text-gray-300">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                        <span>{eventData.venue}, {eventData.location}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-purple-400" />
                        <span>₹{eventData.price + screenPrice} per ticket</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Date & Time */}
                  <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        Select Date & Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Date Picker: for movies free, else only specific event date, mark with color */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white mb-1 block">Date</Label>
                          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                            <PopoverTrigger asChild>
                              <button
                                className={`flex items-center justify-between w-full rounded-md px-4 py-2 border text-left transition
          ${eventOnlyDate && selectedDate === eventOnlyDate ? "ring-2 ring-pink-500" : ""}
          bg-white/10 border-purple-500/30 text-white hover:bg-white/20`}
                              >
                                <span>
                                  {selectedDate
                                    ? format(new Date(selectedDate), "PPP")
                                    : "Select a date"}
                                </span>
                                <CalendarIcon className="ml-2 h-5 w-5 text-purple-300" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-slate-900 border-purple-500/30 text-white shadow-xl rounded-xl">
                              <Calendar
                                mode="single"
                                selected={selectedDate ? new Date(selectedDate) : undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    setSelectedDate(format(date, "yyyy-MM-dd"));
                                    setIsDatePopoverOpen(false); // close the calendar
                                  }
                                }}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0); // normalize to start of today

                                  if (eventOnlyDate) {
                                    const eventDate = new Date(eventOnlyDate);
                                    eventDate.setHours(0, 0, 0, 0); // normalize
                                    return date.toDateString() !== eventDate.toDateString();
                                  }

                                  return date < today;
                                }}
                                modifiers={{
                                  highlight: highlightDate,
                                }}
                                modifiersClassNames={{
                                  highlight: "bg-pink-600 text-white font-bold",
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          {eventOnlyDate && (
                            <p className="text-xs text-pink-400 mt-2">
                              This event occurs only on <span className="font-bold">{eventOnlyDate}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-white">Time</Label>
                          <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                              <Clock className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white border-purple-500/30 z-50">
                              {filteredShowTimes.length === 0 ? (
                                <SelectItem value="no-time" disabled className="text-red">
                                  No more showtimes available today
                                </SelectItem>
                              ) : (
                                filteredShowTimes.map((time) => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Screen/Hall Selection for Movies */}
                  {eventType === 'movie' && (
                    <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-white">Select Screen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                          <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                            <SelectValue placeholder="Choose screen" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                            <SelectItem value="screen1">Screen 1 - Dolby Atmos</SelectItem>
                            <SelectItem value="screen2">Screen 2 - IMAX</SelectItem>
                            <SelectItem value="screen3">Screen 3 - Standard</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  )}

                  {/* Ticket Quantity */}
                  <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Number of Tickets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={ticketQuantity.toString()} onValueChange={(value) => {
                        setTicketQuantity(parseInt(value));
                        setSelectedSeats([]);
                      }}>
                        <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>{num} Ticket{num > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Seat Selection for Movies */}
                  {eventType === 'movie' && (
                    <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-white">Select Seats</CardTitle>
                        <p className="text-gray-400 text-sm">Choose {ticketQuantity} seat{ticketQuantity > 1 ? 's' : ''}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm py-2 px-4 rounded-full inline-block">
                            SCREEN
                          </div>
                        </div>
                        <div className="grid grid-cols-10 gap-1 mb-4">
                          {generateSeats().map((seat) => {
                            const isBooked = bookedSeats.includes(seat);
                            const isSelected = selectedSeats.includes(seat);
                            return (
                              <button
                                key={seat}
                                onClick={() => toggleSeat(seat)}
                                disabled={isBooked}
                                className={`w-8 h-8 text-xs rounded transition-colors
                                  ${isSelected
                                    ? "bg-purple-600 text-white"
                                    : isBooked
                                      ? "bg-green-600 text-white"
                                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                                  }
                                  disabled:opacity-80 disabled:cursor-not-allowed`}
                              >
                                {seat}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-center space-x-6 text-sm">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-white/10 rounded mr-2"></div>
                            <span className="text-gray-400">Available</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-purple-600 rounded mr-2"></div>
                            <span className="text-gray-400">Selected</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                            <span className="text-gray-400">Booked</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Offer Apply section */}
                  <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">Apply Coupon here</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {!appliedCoupon ? (
                          <>
                            <div className="flex">
                              <Input
                                type="text"
                                placeholder="Enter coupon code"
                                value={enteredCoupon}
                                onChange={(e) => setEnteredCoupon(e.target.value)}
                                className="bg-white/10 border-purple-500/30 text-white placeholder-gray-400 w-[75%] mr-[3%]"
                              />
                              <Button
                                onClick={handleApplyCoupon}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-[20%]"
                              >
                                Apply
                              </Button>
                            </div>
                            {couponError && (
                              <p className="text-red-500 text-xs mt-1">{couponError}</p>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-between bg-green-600/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-md">
                            <div>
                              <p className="text-sm font-medium">
                                Coupon <span className="font-bold">{appliedCoupon}</span> applied!
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setAppliedCoupon(null);
                                setEnteredCoupon("");
                                setCouponError("");
                              }}
                              className="text-xs underline hover:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  {/* <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                          <SelectValue placeholder="Choose payment method" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 text-white border-purple-500/30">
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="netbanking">Net Banking</SelectItem>
                          <SelectItem value="wallet">Digital Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card> */}

                  {/* Booking Summary */}
                  {(selectedDate && selectedTime) && (
                    <Card className="bg-white/5 backdrop-blur-xl border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Ticket className="h-5 w-5 mr-2" />
                          Booking Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">                            <div className="flex justify-between text-gray-300">
                          <span>Tickets ({ticketQuantity} x {eventData.price + screenPrice})</span>
                          <span>₹{eventData.price * ticketQuantity + ticketQuantity * screenPrice}</span>
                        </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Booking Fees</span>
                            <span>₹{bookingFees}</span>
                          </div>
                          <div className="flex justify-between text-gray-300">
                            <span>Coupon discount</span>
                            <span>- ₹{getCouponDiscount()}</span>
                          </div>
                          <Separator className="bg-purple-500/20" />
                          <div className="flex justify-between text-white font-bold text-lg">
                            <span>Total Amount</span>
                            <span>
                              ₹
                              {totalAmount - getCouponDiscount()}
                            </span>
                          </div>
                        </div>

                        {selectedSeats.length > 0 && (
                          <div className="text-gray-300">
                            <span className="text-sm">Selected Seats: </span>
                            <span className="text-purple-300">{selectedSeats.join(', ')}</span>
                          </div>
                        )}

                        <Button
                          onClick={handleBooking}
                          disabled={isLoading || !selectedDate || !selectedTime || isEventDateInPast || (eventType === "movie" && (selectedSeats.length !== ticketQuantity || !selectedScreen))}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg font-semibold"
                        >
                          {isLoading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Make payment - ₹{totalAmount - getCouponDiscount()}
                            </div>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Booking Modal */}
      <DuplicateBookingModal
        isOpen={showDuplicateModal}
        onClose={handleDuplicateCancel}
        onConfirm={handleDuplicateConfirm}
        eventTitle={duplicateBookingData?.eventTitle || ""}
        bookingDate={duplicateBookingData?.bookingDate || ""}
        showTime={duplicateBookingData?.showTime || ""}
      />

      {/* Mobile Navigation */}
      {/* <MobileNavigation /> */}
    </div>
  );
};

export default BookingPage;
