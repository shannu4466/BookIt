import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  MapPin,
  Play,
  Heart,
  Share2,
  Drama,
  EllipsisVertical
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { eventNames } from "process";
import ReactPlayer from 'react-player'
import UserReview from "@/components/UserReview";
import { useSearchParams } from 'react-router-dom';

interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: number;
  language: string;
  duration: string;
  release_date: string;
  description: string;
  image_url: string;
  price_range: string;
  location: string;
  status: string;
}

interface Review {
  id: string;
  movie_id: string;
  user_id: string;
  description: string;
  rating: number;
}

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  // Youtube trailer states
  const [isTrailer, setIsTrailer] = useState(false)
  const [trailerUrl, setTrailerUrl] = useState("")
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [userReview, setUserReview] = useState<Review[]>([]);
  const [editReview, setEditReview] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [editReviewData, setEditReviewData] = useState<{
    id: string;
    description: string;
    rating: number;
  } | null>(null);

  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "about";
  const shouldOpenReviewForm = searchParams.get("openReview") === "true";
  const [avgRating, setAvearageRating] = useState(0);
  const [showTimes, setShowTimes] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (!user || !movie) return;

      const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
        .eq("item_id", movie.id)
        .eq("item_type", "movie")
        .single();

      setIsWishlisted(!!data);
    };

    fetchWishlistStatus();
  }, [user, movie]);

  const onClickedWishListBtn = async () => {
    if (!user) return;

    const wishListData = {
      user_id: user.id,
      item_id: movie.id,
      item_type: "movie",
      event_title: movie.title,
      image_url: movie.image_url,
      rating: movie.rating,
      genre: movie.genre,
      duration: movie.duration,
      description: movie.description,
    };

    try {
      if (isWishlisted) {
        // Remove from wishlist
        toast.success("Removed from wishlist!")
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", movie.id)
          .eq("item_type", "movie");

        if (!error) {
          setIsWishlisted(false);
          console.log("Removed from wishlist");
        } else {
          console.error("Error removing from wishlist:", error);
        }
      } else {
        toast.success("Added to wishlist!")
        // Add to wishlist
        const { error } = await supabase
          .from("wishlists")
          .insert([wishListData])
          .single();

        if (!error) {
          setIsWishlisted(true);
          console.log("Added to wishlist");
        } else {
          console.error("Error adding to wishlist:", error);
        }
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
    }
  };

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching movie:", error);
        toast.error("Failed to load movie details");
        return;
      }

      setMovie(data);
    } catch (error) {
      console.error("Error fetching movie:", error);
      toast.error("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTickets = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/booking/movie/${id}`);
  };

  const handleShare = async () => {
    if (navigator.share && movie) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} - ${movie.genre} movie`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const playYoutubeVideo = async () => {
    setIsTrailer(true)
    if (!user) return;

    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", id)
      .single()
    if (error) {
      console.log("Error fetching youtube video:");
      toast.error("Trailer playing error")
    } else {
      setTrailerUrl(data.trailer_url);
      setIsTrailer(true);
      setIsPlayerReady(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetching user reviews
  const fetchUserReviews = async () => {
    if (!id || !user?.id) return;

    const { data, error } = await supabase
      .from("user_reviews")
      .select("*")
      .eq("movie_id", id)

    if (error) {
      console.error("Error fetching user reviews:", error.message);
    } else {
      setUserReview(data || []);
    }
  };

  useEffect(() => {
    fetchUserReviews();
  }, [id, user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setEditReview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const ratingAverage = async () => {
      const { data, error } = await supabase
        .from("user_reviews")
        .select("rating")
        .eq("movie_id", id)

      if (error) {
        console.log("Error fetching avarage rating of movie");
      } else if (data && data.length > 0) {
        const total = data.reduce((sum, item) => sum + item.rating, 0);
        const average = total / data.length;
        setAvearageRating(average.toFixed(1));
      } else {
        setAvearageRating(0)
      }
    }
    ratingAverage();
  })

  useEffect(() => {
    const fetchShowTimes = async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("show_times")
        .eq("id", id)
        .single()

      if (error) {
        console.log("Error fetching showtimes for this movies")
      } else {
        setShowTimes(data?.show_times || [])
      }
    }
    fetchShowTimes();
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie not found</h1>
          <Link to="/movies">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              Back to Movies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/movies">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-white">{movie.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={onClickedWishListBtn}
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""
                    }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={
            movie.image_url ||
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop"
          }
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <img
                src={
                  movie.image_url ||
                  "https://images.unsplash.com/photo-1489599150050-1c7675daa1a8?w=400&h=600&fit=crop"
                }
                alt={movie.title}
                className="w-48 h-72 object-cover rounded-lg shadow-2xl"
              />

              <div className="flex-1 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex justify-center items-center bg-green-600 rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-white mr-1 fill-yellow-500" />
                    <span className="font-bold">{avgRating ? avgRating : movie.rating}/10</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-300 hover:text-purple-600"
                  >
                    {movie.language}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-6 text-gray-300 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {movie.duration || "Not specified"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {movie.release_date
                      ? formatDate(movie.release_date)
                      : "Not specified"}
                  </div>
                  <div className="flex items-center">
                    <Drama className="h-4 w-4 mr-2" />
                    {movie.genre}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {movie.location}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={handleBookTickets}
                  >
                    Book Tickets
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-black hover:bg-white/10 hover:text-white"
                    onClick={playYoutubeVideo}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Trailer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isTrailer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-black h-[40%] w-[100%] md:h-[60%] md:w-[60%]">
            <ReactPlayer
              url={trailerUrl}
              controls
              width="100%"
              height="100%"
              playing={isPlayerReady}
              onReady={() => setIsPlayerReady(true)}
            />
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setIsTrailer(false)}
            >
              ✕
            </button>
          </Card>
        </div>
      )}

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-md border-white/20">
            <TabsTrigger
              value="about"
              className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="showtimes"
              className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              Showtimes
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Synopsis</h3>
                <p className="text-gray-300 leading-relaxed">
                  {movie.description ||
                    "No description available for this movie."}
                </p>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Price Range
                  </h4>
                  <p className="text-purple-300 font-bold">
                    {movie.price_range || "Price not available"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="showtimes" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 tracking-wide">🎬 Available Showtimes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {showTimes.map((each) => (
                    <div
                      key={each}
                      className="text-center py-2 px-4 rounded-xl bg-white/10 text-white font-medium backdrop-blur hover:bg-white/20 transition-all duration-200"
                    >
                      {each}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleBookTickets}
                    className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 hover:scale-105 transition-all duration-300 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-xl"
                  >
                    Pick Your Date & Seat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">User Reviews</h3>
                {/* Single UserReview component to handle create/edit */}
                <UserReview
                  movieId={id}
                  onReviewSubmitted={fetchUserReviews}
                  editReviewData={editReviewData}
                  closeEditForm={() => {
                    setEditReviewData(null);
                  }}
                  forceOpenForm={shouldOpenReviewForm}
                />

                {/* Conditionally show message when no reviews exist */}
                {userReview.length === 0 ? (
                  <p className="text-gray-300">No reviews found</p>
                ) : (
                  [...userReview]
                    .filter((each) => editReviewData?.id !== each.id)
                    .sort((a, b) => {
                      if (a.user_id === user.id) return -1;
                      if (b.user_id === user.id) return 1;
                      return 0;
                    }).map((each) => (
                      <div key={each.id} className="space-y-4 mb-4">
                        <div className="border-b border-white/10 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {each.user_name.slice(0, 1)}
                                </span>
                              </div>
                              <span className="text-white font-semibold">{each.user_name}</span>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-white">{each.rating}</span>
                              </div>

                              {/* Show edit icon only for logged-in user's own review */}
                              {each.user_id === user.id && (
                                <button
                                  onClick={() =>
                                    setEditReviewData({
                                      id: each.id,
                                      description: each.description,
                                      rating: each.rating,
                                    })
                                  }
                                  title="Edit Review"
                                >
                                  <EllipsisVertical className="text-white cursor-pointer" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-300">
                            {each.description}
                            {each.user_id === user.id && (
                              <span className="text-sm text-gray-500 font-medium ml-1 font-semibold">(Your Review)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MovieDetails;
