import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Film, Calendar, Trophy, Music, ShieldCheck,
    ChevronRight, Star, Clock, MapPin, Zap,
    Smartphone, CheckCircle2
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

// Intersection Observer Hook for Scroll Animations
function useOnScreen(options: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsVisible(true);
        }, options);

        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [options]);

    return [ref, isVisible] as const;
}

// Reusable animated container
const FadeInBlock = ({ children, delay = "0ms", direction = "up" }: { children: React.ReactNode, delay?: string, direction?: "up" | "left" | "right" }) => {
    const [ref, isVisible] = useOnScreen({ threshold: 0.1 });

    const translates = {
        up: "translate-y-12",
        left: "-translate-x-12",
        right: "translate-x-12",
    };

    return (
        <div
            ref={ref}
            style={{ transitionDelay: delay }}
            className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${translates[direction]}`}`}
        >
            {children}
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setHeroVisible(true), 100);

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-inter text-white scroll-smooth selection:bg-purple-500/30">

            {/* Sticky Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">BookIt</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How it Works</button>
                        <button onClick={() => scrollToSection('partners')} className="hover:text-white transition-colors">Partners</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5" onClick={() => navigate("/admin/login")}>
                            Admin Login
                        </Button>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20" onClick={() => navigate("/")}>
                            Explore App
                        </Button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-pink-900/20 pointer-events-none"></div>
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen transition-all duration-[3000ms] ease-in-out ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} pointer-events-none`}></div>
                <div className={`absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-pink-600/20 rounded-full blur-[150px] mix-blend-screen transition-all duration-[3000ms] delay-500 ease-in-out ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} pointer-events-none`}></div>

                <div className="container px-4 py-16 flex flex-col items-center text-center z-10 relative mt-10">
                    <div className={`mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-purple-500/20 backdrop-blur-md transition-all duration-1000 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                        </span>
                        <span className="text-sm font-medium text-purple-200">The Ultimate Booking Experience</span>
                    </div>

                    <h1 className={`text-5xl md:text-8xl font-black tracking-tight mb-8 transition-all duration-1000 delay-200 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} leading-tight`}>
                        Book Your Next <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 drop-shadow-lg">
                            Adventure Today.
                        </span>
                    </h1>

                    <p className={`text-lg md:text-2xl text-gray-400 mb-12 max-w-3xl font-light transition-all duration-1000 delay-300 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        Discover blockbuster movies, thrilling live sports, music concerts, and exclusive plays across your city.
                    </p>

                    <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-500 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <Button size="lg" className="h-14 px-8 text-lg bg-white text-slate-950 hover:bg-gray-200 rounded-full font-semibold shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1" onClick={() => navigate("/home")}>
                            Get Started Now <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg text-black border-white/20 hover:text-black hover:bg-gray-200 rounded-full font-medium transition-all transform hover:-translate-y-1 group" onClick={() => scrollToSection('features')}>
                            Explore Features
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- TRENDING MARQUEE --- */}
            <section className="py-6 border-y border-white/5 bg-black/60 overflow-hidden relative">
                <div className="flex w-[200%] animate-[marquee_40s_linear_infinite] gap-8 py-2">
                    {[1, 2].map((set) => (
                        <div key={set} className="flex gap-8 items-center min-w-full justify-around shrink-0">
                            {['Interstellar IMAX', 'Global Tech Summit', 'Mumbai Marathon', 'Arijit Singh Live', 'Phantom of the Opera'].map((item, idx) => (
                                <span key={idx} className="flex items-center text-xl font-black text-gray-500/40 uppercase tracking-widest hover:text-purple-400 transition-all cursor-default">
                                    <Star className="w-5 h-5 mr-3 text-purple-500" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section id="features" className="py-24 bg-black/40 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <FadeInBlock>
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Unrivaled Access</h2>
                            <p className="text-gray-400 text-lg">Seamless, secure, and instantaneous ticket generation.</p>
                        </div>
                    </FadeInBlock>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Film, title: "Movies", color: "purple", desc: "Latest cinematic releases tailored to you." },
                            { icon: Calendar, title: "Events", color: "pink", desc: "Festivals, comedy, and exclusive pop-ups." },
                            { icon: Trophy, title: "Live Sports", color: "blue", desc: "Cricket, football, and local tournaments." },
                            { icon: Music, title: "Stage Plays", color: "emerald", desc: "Immerse yourself in theatrical performances." }
                        ].map((feature, idx) => (
                            <FadeInBlock key={idx} delay={`${idx * 150}ms`}>
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors h-full">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-purple-400`}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed font-light">{feature.desc}</p>
                                </div>
                            </FadeInBlock>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section id="how-it-works" className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <FadeInBlock direction="left">
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">Booking made simple.</h2>
                                <p className="text-gray-400 text-lg mb-12 font-light">Skip the queue and secure your seats in milliseconds.</p>
                            </FadeInBlock>

                            <div className="space-y-8">
                                {[
                                    { icon: MapPin, title: "Select Your City", desc: "Instantly see all upcoming events tailored to you." },
                                    { icon: Zap, title: "Pick & Checkout", desc: "Interactive maps and zero hidden fees." },
                                    { icon: Smartphone, title: "M-Ticket Delivered", desc: "Instant QR code delivery to your app." }
                                ].map((step, idx) => (
                                    <FadeInBlock key={idx} direction="left" delay={`${idx * 150}ms`}>
                                        <div className="flex gap-6">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                <step.icon className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                                                <p className="text-gray-400 font-light">{step.desc}</p>
                                            </div>
                                        </div>
                                    </FadeInBlock>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full relative">
                            <FadeInBlock direction="right">
                                <div className="aspect-[4/5] rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 p-6 overflow-hidden shadow-2xl relative">
                                    <div className="h-full rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 p-5 flex flex-col">
                                        <div className="flex justify-between items-center mb-5">
                                            <span className="font-semibold text-white text-sm">BookIt Mobile</span>
                                            <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-white/20"></div><div className="w-1.5 h-1.5 rounded-full bg-white/20"></div></div>
                                        </div>
                                        <div className="flex gap-4 mb-5">
                                            <div className="w-16 h-20 rounded-lg bg-purple-500/20 border border-white/10"></div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-bold text-white text-base">Interstellar</h4>
                                                <div className="flex text-yellow-500"><Star className="w-3 h-3 fill-current" /> <Star className="w-3 h-3 fill-current" /></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center mb-4">
                                            <div className="w-3/4 h-1 bg-cyan-500/50 mb-5 rounded-full"></div>
                                            <div className="grid grid-cols-6 gap-2">
                                                {[...Array(24)].map((_, i) => (
                                                    <div key={i} className={`w-4 h-4 rounded-sm border ${i === 14 || i === 15 ? 'bg-purple-500 border-purple-400' : 'border-white/20'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-auto w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-between px-4 text-white text-sm font-semibold">
                                            <span>2 Tickets • ₹850</span>
                                            <div className="flex items-center">Pay Now <ChevronRight className="w-4 h-4 ml-1" /></div>
                                        </div>
                                    </div>
                                </div>
                            </FadeInBlock>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PARTNERS SECTION --- */}
            <section id="partners" className="py-24 bg-gradient-to-b from-transparent to-slate-900/80 border-t border-white/5">
                <div className="container mx-auto px-6 text-center">
                    <FadeInBlock>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Are you an Event Organizer?</h2>
                        <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto font-light">Join thousands of promoters managing their ticketing with BookIt.</p>
                    </FadeInBlock>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                        {[
                            { icon: ShieldCheck, title: "Secure Access", desc: "Dedicated portals." },
                            { icon: Clock, title: "Real-time Data", desc: "Track sales live." },
                            { icon: CheckCircle2, title: "Instant Approval", desc: "Quick verification." }
                        ].map((item, idx) => (
                            <FadeInBlock key={idx} delay={`${idx * 100}ms`}>
                                <div className="flex flex-col items-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-purple-400 border border-white/10 mb-4">
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <h4 className="font-semibold text-lg">{item.title}</h4>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </FadeInBlock>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 rounded-full" onClick={() => navigate("/admin/register")}>
                            Register as Partner
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full text-black border-white/20" onClick={() => navigate("/admin/login")}>
                            Partner Login
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="w-full pt-20 pb-10 bg-black/60 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-6 block">BookIt</span>
                            <p className="text-gray-400 max-w-sm font-light">The modern way to experience the world outside.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-6">Explore</h4>
                            <ul className="space-y-4 text-gray-500 text-sm">
                                <li>Movies</li><li>Events</li><li>Sports</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-6">Partners</h4>
                            <ul className="space-y-4 text-gray-500 text-sm">
                                <li className="cursor-pointer hover:text-purple-400" onClick={() => navigate("/admin/register")}>List your Event</li>
                                <li className="cursor-pointer hover:text-purple-400" onClick={() => navigate("/admin/login")}>Admin Portal</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-sm text-gray-500">
                        <p>BookIt © {new Date().getFullYear()}. All Rights Reserved.</p>
                        <p>Designed by <span className="text-purple-400 font-bold">Shannu</span></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;