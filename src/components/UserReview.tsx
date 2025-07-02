import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useLocation } from "react-router-dom";

interface Review {
    id: string;
    title: string;
    description: string;
    rating: number;
}

interface UserReviewProps {
    movieId: string;
    onReviewSubmitted: () => void;
    editReviewData?: {
        id: string;
        description: string;
        rating: number;
    };
    closeEditForm();
    forceOpenForm?: boolean;
}

const UserReview = ({
    movieId,
    onReviewSubmitted,
    editReviewData,
    closeEditForm,
    forceOpenForm,
}: UserReviewProps) => {
    const [openReviewForm, setOpenReviewForm] = useState(false);
    const [description, setDescription] = useState("");
    const [rating, setRating] = useState("");
    const [movieData, setMovieData] = useState<Review | null>(null);
    const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
    const [hasBookedTicket, setHasBookedTicket] = useState(false)
    const location = useLocation();
    const navigate = useNavigate();


    const { user } = useAuth();
    const { id } = useParams();

    const writeReview = async () => {
        const { data, error } = await supabase
            .from("booking_data")
            .select("booking_date, show_time")
            .eq("user_id", user.id)
            .eq("event_id", movieId);

        if (error) {
            console.error("Error checking booking:", error.message);
            toast.error("Something went wrong while checking your booking.");
            return;
        }

        if (!data || data.length === 0) {
            toast.error("You need to book a ticket to give a review.");
            return;
        }

        // Find if any past show exists
        const now = new Date();
        const hasPastShow = data.some((booking) => {
            const showDateTime = new Date(`${booking.booking_date}T${booking.show_time}`);
            return now >= showDateTime;
        });

        if (hasPastShow) {
            setOpenReviewForm(!openReviewForm);
        } else {
            toast.error("You can write a review only after the movie show time.");
        }
    };

    // Fetch movie data
    useEffect(() => {
        const fetchMovieData = async () => {
            const { data, error } = await supabase
                .from("movies")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching movie details:", error.message);
                toast.error("Movie data fetching failed");
            } else {
                setMovieData(data);
            }
        };

        if (id) fetchMovieData();
    }, [id]);

    // Pre-fill form if editing
    useEffect(() => {
        if (editReviewData && !openReviewForm) {
            setDescription(editReviewData.description);
            setRating(editReviewData.rating.toString());
            setOpenReviewForm(true);
        }
    }, [editReviewData, openReviewForm]);

    // Fetch if review is already submitted
    useEffect(() => {
        const fetchUserReview = async () => {
            const { data, error } = await supabase
                .from("user_reviews")
                .select("*")
                .eq("user_id", user.id)
                .eq("movie_id", id);

            if (error) {
                console.error("Error fetching user review:", error.message);
            }

            if (data && data.length > 0) {
                setIsReviewSubmitted(true);
            } else {
                setIsReviewSubmitted(false);
            }
        };

        if (user?.id && id) {
            fetchUserReview();
        }
    }, [user?.id, id]);

    // Open review form automatically if user clicks give us review button from the my bookings section
    useEffect(() => {
        if (forceOpenForm && !isReviewSubmitted) {
            setOpenReviewForm(true);
            // Clean the URL (remove ?openReview=true)
            const params = new URLSearchParams(location.search);
            params.delete("openReview");
            params.delete("tab")
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        }
    }, [forceOpenForm, isReviewSubmitted, location.pathname, location.search, navigate]);

    const submitUserReviewForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !rating) {
            toast.error("Please fill all fields before submitting");
            return;
        }

        const parsedRating = parseFloat(rating);
        if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 10) {
            toast.error("Rating must be a number between 0 and 10");
            return;
        }

        if (editReviewData) {
            // Update review
            const { error } = await supabase
                .from("user_reviews")
                .update({ description, rating: parsedRating })
                .eq("id", editReviewData.id);

            if (error) {
                toast.error("Failed to update review");
            } else {
                toast.success("Review updated successfully!");
                setOpenReviewForm(false);
                onReviewSubmitted();
                if (closeEditForm) closeEditForm();
            }
        } else {
            // New review
            const reviewData = {
                id: uuidv4(),
                user_id: user.id,
                user_name: user.user_metadata.name,
                movie_name: movieData?.title || "",
                movie_id: movieData?.id || "",
                description,
                rating: parsedRating,
            };

            const { error } = await supabase
                .from("user_reviews")
                .insert([reviewData]);

            if (error) {
                toast.error("Failed to submit review");
            } else {
                toast.success("Review submitted successfully!");
                setDescription("");
                setRating("");
                setOpenReviewForm(false);
                setIsReviewSubmitted(true);
                onReviewSubmitted();
            }
        }
    };

    const removeReview = async () => {
        if (!user?.id) return;
        const { data, error } = await supabase
            .from("user_reviews")
            .delete()
            .eq("user_id", user.id)
            .eq("movie_id", id)

        if (error) {
            toast.error("Cannot delte your review right now")
            console.log(error.message)
        } else {
            toast.success("Review deleted successfully")
            setIsReviewSubmitted(false);
            setDescription("")
            setRating("")
            onReviewSubmitted();
            setOpenReviewForm(false);
            if (closeEditForm) closeEditForm();
        }
    }
    // Check if user is booked ticket for that movie.
    useEffect(() => {
        const userBookingDataForMovie = async () => {
            if (!user?.id || !movieId) return;

            const { data, error } = await supabase
                .from("booking_data")
                .select("booking_date, show_time")
                .eq("user_id", user.id)
                .eq("event_id", movieId);

            if (error) {
                console.log("Error fetching booking data for this movie:", error.message);
                setHasBookedTicket(false);
            } else if (!data || data.length === 0) {
                console.log("You have not booked any ticket for this event");
                setHasBookedTicket(false);
            } else {
                const now = new Date();
                const hasPastShow = data.some((booking) => {
                    const showDateTime = new Date(`${booking.booking_date}T${booking.show_time}`);
                    return now >= showDateTime;
                });
                setHasBookedTicket(hasPastShow);
            }
        };

        userBookingDataForMovie();
    }, [movieId, user?.id]);


    return (
        <div>
            {!isReviewSubmitted && !editReviewData && (
                <div className="flex justify-start items-center">
                    <h1 className="text-xl font-bold text-white mb-3 mr-6 underline">
                        Write your own review
                    </h1>
                    <button onClick={writeReview} title="Add Review">
                        <Edit className="text-white text-lg" />
                    </button>
                </div>
            )}
            {openReviewForm && (
                <form onSubmit={submitUserReviewForm} className="mb-5">
                    <label className="text-white mb-1 block">Description</label>
                    <textarea
                        className="bg-white/10 border border-white/20 rounded-lg w-full p-2 text-white resize-y min-h-[100px]"
                        rows={4}
                        placeholder="Enter description here..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <label className="text-white">Rating</label>
                    <input
                        type="number"
                        className="bg-white/10 border border-white/20 rounded-lg w-full p-2 text-white h-10 mb-3"
                        placeholder="Enter rating here..."
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        min={1}
                        max={10}
                        step={0.1}
                    />
                    <button
                        type="submit"
                        className="bg-purple-500 p-2 w-[100px] rounded-lg text-white font-bold mb-3"
                    >
                        {editReviewData ? "Update" : "Post"}
                    </button>
                    {editReviewData && closeEditForm && (
                        <button
                            type="button"
                            className="ml-4 bg-gray-600 p-2 rounded-lg text-white font-bold mb-3 w-[100px]"
                            onClick={() => {
                                setOpenReviewForm(false);
                                closeEditForm();
                            }}
                        >
                            Cancel
                        </button>
                    )}
                    {editReviewData && closeEditForm && (
                        <button
                            type="button"
                            className="ml-4 bg-red-600 p-2 rounded-lg text-white font-bold mb-3 w-[100px]"
                            onClick={removeReview}
                        >
                            Delete
                        </button>
                    )}
                    <hr />
                </form>
            )}
        </div>
    );
};

export default UserReview;
