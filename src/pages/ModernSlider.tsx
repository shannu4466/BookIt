import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Star } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// interface Slide {
//     id: string;
//     title: string;
//     imageUrl: string;
//     rating: number;
// }

interface MovieData {
    id: string;
    title: string;
    image_url: string;
    rating: number;
}

const ModernSlider: React.FC = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const { user } = useAuth();
    const [moviesList, setMoviesList] = useState<MovieData[]>([]);
    const selectedLocation = localStorage.getItem("selectedLocation")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSlidesData = async () => {
            const { data, error } = await supabase
                .from("movies")
                .select("*")
                .eq("location", selectedLocation)

            if (error) {
                console.log("Error fetching data for sliders", error);
            } else {
                const filtered = data
                    .filter(movie => movie.is_trending === true || movie.rating >= 4.0)
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 5);

                setMoviesList(filtered);
                setCurrentSlide(0);
                setLoading(false)
            }
        };

        if (selectedLocation) {
            fetchSlidesData();
        }
    }, [selectedLocation]);


    // const slides: Slide[] = [
    //     {
    //         id: "584b703c-d524-4bbb-803a-724d33db0817",
    //         title: "Thammudu",
    //         imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcfZeff-q36MsqOgrcIIa4yXvGt7qIsytUhw&s",
    //         rating: 8.2,
    //     },
    //     {
    //         id: "c100d4e4-ae16-4683-a810-9253eef82751",
    //         title: "Kingdom",
    //         imageUrl: "https://cdn.123telugu.com/content/wp-content/uploads/2025/02/kingbom-e1742072818366.jpg",
    //         rating: 7.4,
    //     },
    //     {
    //         id: "acfdc7cd-fe9a-4fc9-b22a-5a2e24f59f23",
    //         title: "Akhanda 2",
    //         imageUrl: "https://www.koimoi.com/wp-content/new-galleries/2025/02/star-hero-turns-villain-for-balakrishnas-akhanda-2-01.jpg",
    //         rating: 8.0,
    //     },
    //     {
    //         id: "a714f03d-c555-40ab-b89d-4d3b8c3e8dea",
    //         title: "Single",
    //         imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnjRSV2PLCBibh5LZ7LYPMJy1S7aPoiFDVMQ&s",
    //         rating: 8.5,
    //     },
    //     {
    //         id: "c09cc288-9ed6-4dd5-bfaf-1c968eea20f0",
    //         title: "Tourist Family",
    //         imageUrl: "https://www.hollywoodreporterindia.com/_next/image?url=https%3A%2F%2Fcdn.hollywoodreporterindia.com%2Feditor-images%2F2025-05-01T09%253A28%253A42.068Z-Inline2A%2520%25281%2529.jpg&w=3840&q=75",
    //         rating: 9.1,
    //     },
    // ];

    // Auto-play functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % moviesList.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [moviesList.length]);

    const nextSlide = (): void => {
        setCurrentSlide((prev) => (prev + 1) % moviesList.length);
    };

    const prevSlide = (): void => {
        setCurrentSlide((prev) => (prev - 1 + moviesList.length) % moviesList.length);
    };

    // Touch swipe support
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.changedTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        touchEndX.current = e.changedTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current !== null && touchEndX.current !== null) {
            const diff = touchStartX.current - touchEndX.current;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    const sliderNavigate = (slideId: string) => {
        if (!user) navigate("/login")
        else navigate(`/movie/${slideId}`)
    }

    return (
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto h-64 sm:h-80 md:h-96 overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Slides Container */}
            <div
                className="relative h-full flex items-center justify-center perspective-1000"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {loading && (
                    <div className="relative flex justify-center items-center h-40">
                        <div className="absolute text-2xl font-semibold text-gray-400 z-0">
                            Loading content...
                        </div>
                        <div className="animate-spin rounded-full h-16 md:h-32 w-16 md:w-32 border-b-2 border-purple-400 z-10"></div>
                    </div>
                )}


                {moviesList.map((slide, index) => {
                    const isActive = index === currentSlide;
                    const isPrev = index === (currentSlide - 1 + moviesList.length) % moviesList.length;
                    const isNext = index === (currentSlide + 1) % moviesList.length;

                    let slideClasses = "absolute w-full h-full transition-all duration-700 ease-out rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden ";

                    if (isActive) {
                        slideClasses += "z-20 scale-100 opacity-100 translate-x-0 blur-0";
                    } else if (isPrev) {
                        slideClasses += "z-10 scale-75 sm:scale-80 md:scale-75 opacity-40 sm:opacity-50 md:opacity-60 -translate-x-1/4 sm:-translate-x-1/3 blur-sm";
                    } else if (isNext) {
                        slideClasses += "z-10 scale-75 sm:scale-80 md:scale-75 opacity-40 sm:opacity-50 md:opacity-60 translate-x-1/4 sm:translate-x-1/3 blur-sm";
                    } else {
                        slideClasses += "z-0 scale-50 opacity-0 blur-md";
                    }

                    return (
                        <div key={slide.id} className={slideClasses}>
                            <div className="h-full flex flex-col justify-end items-center text-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center z-0"
                                    style={{ backgroundImage: `url(${slide.image_url})` }}
                                />
                                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                                    <span className="text-white text-sm">{slide.rating}</span>
                                </div>
                                {/* Content */}
                                <div className="relative z-10 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mb-8">
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 tracking-tight leading-tight">
                                        {slide.title}
                                    </h2>
                                    <button
                                        className="group bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 hover:border-white/50 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                        onClick={() => sliderNavigate(slide.id)}
                                    >
                                        <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                                            Book Now →
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="hidden sm:flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-300 hover:scale-110 group"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
            </button>

            <button
                onClick={nextSlide}
                className="hidden sm:flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-300 hover:scale-110 group"
                aria-label="Next slide"
            >
                <ChevronRight className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {moviesList.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                            ? 'bg-white scale-125 shadow-lg'
                            : 'bg-white/40 hover:bg-white/60 hover:scale-110'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ModernSlider;
