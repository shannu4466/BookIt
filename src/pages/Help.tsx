import { HelpCircle, ChevronDown, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const faqs = [
    {
        question: 'Why am I seeing the message "Auth session is missing"?',
        answer:
            'This usually occurs due to expired or corrupted session data. Clear your browser cookies and site data, then try logging in again.',
    },
    {
        question: 'Can I cancel or change my booking after payment?',
        answer: "Most bookings are non-refundable once confirmed. However, in certain situations—such as event rescheduling—you may be eligible for a refund or exchange. Please note that bookings made for today cannot be canceled."
    },
    {
        question: 'How will I receive my ticket after booking?',
        answer:
            'Your ticket is available under "My Bookings" in your account dashboard.',
    },
    {
        question: 'Why is a particular event not available in my city?',
        answer:
            'Events are city-specific based on organizer availability. Try checking nearby cities or stay tuned for future listings.',
    },
    {
        question: 'How can I apply a discount coupon code?',
        answer:
            'On the Booking page, you’ll see a field to enter a Coupon code. If valid, the discount will be applied automatically before payment.',
    },
    {
        question: 'How can I submit a review for a movie?',
        answer: 'To submit a review for a movie, you must first book a ticket for that movie.',
    },
];

const Help = () => {
    const navigate = useNavigate()
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleIndex = (index: number) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white py-10 px-4 md:px-10">
            <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-purple-500/20 hover:text-white"
                onClick={() => navigate("/")}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
            <div className="max-w-3xl mx-auto bg-white/5 border border-purple-500/30 rounded-2xl shadow-lg p-6 md:p-8 backdrop-blur-md">
                <div className="flex items-center mb-6">
                    <HelpCircle className="h-6 w-6 text-purple-400 mr-2" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Help & FAQs
                    </h1>
                </div>

                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-purple-700/30 rounded-xl overflow-hidden mb-4"
                    >
                        <button
                            onClick={() => toggleIndex(index)}
                            className="w-full flex justify-between items-center p-4 bg-purple-900/30 hover:bg-purple-900/40 transition-colors duration-200 text-left"
                        >
                            <span className="font-medium text-white">{faq.question}</span>
                            <ChevronDown
                                className={`h-5 w-5 text-purple-300 transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {openIndex === index && (
                            <div className="p-4 text-sm text-purple-200 border-t border-purple-700/30">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Help;
