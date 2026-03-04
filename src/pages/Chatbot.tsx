import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMovies } from '@/hooks/useMovies';
import { useEvents } from '@/hooks/useEvents';
import { useSports } from '@/hooks/useSports';
import { usePlays } from '@/hooks/usePlays';

const API_KEY = "AIzaSyAzAJVF2M-iBFVtjUo30YU_lqTRMD0JRVc";

interface Message {
    role: 'user' | 'bot';
    text: string;
}

const Chatbot = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all application data based on user location
    const selectedLocation = localStorage.getItem('selectedLocation') || 'hyderabad';
    const { data: movies, isLoading: isMoviesLoading } = useMovies(selectedLocation);
    const { data: events, isLoading: isEventsLoading } = useEvents(selectedLocation);
    const { data: sports, isLoading: isSportsLoading } = useSports(selectedLocation);
    const { data: plays, isLoading: isPlaysLoading } = usePlays(selectedLocation);

    const isDataLoading = isMoviesLoading || isEventsLoading || isSportsLoading || isPlaysLoading;

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Protect route
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = { role: 'user', text: inputValue.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Format available app data to inject as context
            const appDataContext = {
                movies: movies?.map(m => ({ title: m.title, genre: m.genre, release_date: m.release_date, location: m.location, rating: m.rating, price_range: m.price_range })) || [],
                events: events?.map(e => ({ title: e.title, category: e.category, date: e.event_date, location: e.location, venue: e.venue, price_range: e.price_range })) || [],
                sports: sports?.map(s => ({ title: s.title, sport_type: s.sport_type, date: s.match_date, location: s.location, venue: s.venue, teams: s.teams })) || [],
                plays: plays?.map(p => ({ title: p.title, genre: p.genre, duration: p.duration, location: p.location, venue: p.venue, price_range: p.price_range })) || []
            };

            const systemInstruction = `You are an AI assistant exclusively for the "BookIt" ticket booking application.
Your ONLY job is to help users find information and book tickets for the specific movies, events, sports, and plays currently available in the BookIt app.

The user's currently selected location is: ${selectedLocation.toUpperCase()}

### CRITICAL RULES:
1. YOU MUST ONLY RECOMMEND OR DISCUSS ITEMS LISTED IN THE APP DATA BELOW.
2. DO NOT make up information or pull general internet knowledge for ticket availability.
3. If the user asks about ANY movie, event, sport, or play that is NOT in the JSON data below, you MUST respond exactly with: "Sorry, I could not find an answer to that."
4. Prioritize results that match the user's selected location (${selectedLocation.toUpperCase()}).
5. If the user asks general everyday questions like "hi", "how are you", respond politely and ask how you can help them book tickets today.
6. If the user asks about a clearly unrelated topic (programming, recipes, politics), inform them you only assist with booking tickets on the BookIt app.
7. Keep your responses short, focused, friendly, and helpful.

                    ### CURRENT APP DATA (JSON):
${JSON.stringify(appDataContext, null, 2)}`;

            // Format previous history for Gemini API
            const contents = [
                ...messages.map((msg) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }],
                })),
                { role: 'user', parts: [{ text: userMessage.text }] },
            ];

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: contents
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response from Gemini API");
            }

            const data = await response.json();
            const botResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (botResponseText) {
                setMessages((prev) => [...prev, { role: 'bot', text: botResponseText }]);
            } else {
                // Fallback if the API returns empty text
                setMessages((prev) => [...prev, { role: 'bot', text: "Sorry, I could not find an answer to that." }]);
            }

        } catch (error: any) {
            console.error('Chatbot Error:', error);
            setMessages((prev) => [...prev, { role: 'bot', text: "Something went wrong. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-purple-300 font-inter antialiased">
            <header className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 shadow-lg flex justify-between">
                <button className='flex' onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-1" /> Back
                </button>
                <h1 className="text-3xl font-bold rounded-lg px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm">
                    BookIt
                </h1>
            </header>

            <main className="flex-1 overflow-auto scrollbar-hide p-6 space-y-4 max-w-2xl mx-auto w-full">
                {messages.length === 0 && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-black text-lg text-center">
                            Hi there! I can help you find information about movies, events, sports, and plays. <br />
                            Ask me anything about ticket booking for these categories!
                        </p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-md p-4 rounded-xl shadow-md ${message.role === 'user'
                            ? 'bg-pink-600 text-white rounded-br-none'
                            : 'bg-purple-500 text-white rounded-bl-none border border-gray-200'
                            }`}>
                            <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-md p-4 rounded-xl bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-200">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            <footer className="p-4 bg-purple-300 flex justify-center">
                <div className="flex w-full max-w-2xl space-x-3">
                    <input
                        type="text"
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 shadow-sm bg-gray-50"
                        placeholder="Ask about movies, events, sports, or plays..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={isLoading || isDataLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || isDataLoading || inputValue.trim() === ''}
                        className={`px-6 py-3 rounded-xl font-semibold text-white transition duration-200 ease-in-out shadow-md
                            ${isLoading || isDataLoading || inputValue.trim() === ''
                                ? 'bg-gray-800 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transform hover:scale-105'
                            }`}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Chatbot;
