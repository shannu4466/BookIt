import { useEffect } from "react";
import { useNavigate, useLocation, replace } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PaymentGatewayPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingData = location.state?.bookingData;
    const { user } = useAuth()

    useEffect(() => {
        if (!bookingData) {
            toast.error("No booking data");
            navigate("/");
            return;
        }

        const loadRazorpay = () => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = startPayment;
            document.body.appendChild(script);
        };

        const { applied_coupon, ...sanitizedBookingData } = bookingData;

        const startPayment = () => {
            const paymentObject = new window.Razorpay({
                key: "rzp_test_A4EaiD1U2cgPhQ",
                amount: bookingData.total_amount * 100,
                currency: "INR",
                name: "BookIt-A ticket booking platform",
                description: bookingData.event_title,
                handler: async (response: any) => {
                    try {
                        const finalData = {
                            ...sanitizedBookingData,
                            payment_status: "completed",
                            booking_status: "confirmed",
                            razorpay_payment_id: response.razorpay_payment_id,
                            payment_method: "razorpay",
                        };

                        const { data, error } = await supabase
                            .from("booking_data")
                            .insert([finalData])
                            .select();

                        if (error) {
                            toast.error("Error saving booking");
                            console.error(error);
                            return;
                        }

                        toast.success("Payment Successful! Booking Confirmed.");
                        navigate("/my-bookings", { replace: true });
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    } catch (e) {
                        console.error("Booking Save Error", e);
                        toast.error("Something went wrong");
                    }
                },
                modal: {
                    ondismiss: async (response: any) => {
                        const finalData = {
                            ...sanitizedBookingData,
                            payment_status: "failed",
                            booking_status: "Not confirmed",
                            // razorpay_payment_id: response.razorpay_payment_id,
                            payment_method: "razorpay",
                        };

                        const { data, error } = await supabase
                            .from("booking_data")
                            .insert([finalData])
                            .select();

                        if (error) {
                            toast.error("Error saving booking");
                            console.error(error);
                            return;
                        }

                        toast.success("Payment cancelled!. Booking not confirmed");
                        navigate("/my-bookings", { replace: true });
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    },
                },
                prefill: {
                    name: user?.user_metadata?.name,
                    email: user?.email,
                },
                theme: {
                    color: "#a855f7",
                },
            });

            paymentObject.open();
        };



        loadRazorpay();
    }, [bookingData, navigate]);

    return (
        <div className="text-white text-center pt-20">
            <h1>Redirecting to Payment...</h1>
        </div>
    );
};

export default PaymentGatewayPage;
