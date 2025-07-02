import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Chatbot = () => {
    const navigate = useNavigate();
    const { user } = useAuth()
    const [chatHistory, setChatHistory] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    const chatbotContextInstruction = {
        role: 'user',
        parts: [{
            text: `You are a helpful AI chatbot for a ticket booking website. Your job is to provide brief, accurate information from the internet related to:
- Movies (e.g., titles like "Raajasaab", actors, release dates, plot summary)
- Sports (e.g., match dates, tournament info)
- Events (e.g., concerts, comedy shows)
- Plays (e.g., theatre shows)

If the user asks about something clearly unrelated (e.g., programming, politics), respond with:
"I am sorry, but my purpose is to assist you with inquiries related to movies, events, sports, and plays. Please ask me something within these categories."

If the query is unclear, assume it might be a movie/event/sport unless you're certain it is off-topic.

Keep responses short and focused. Use internet knowledge to answer. Provide answer in a single attempt. Don't wait user for your searching results.

Don't suggest any other booking apps to user. Always make user to happy with this BookIt app.`
        }]
    };

    useEffect(() => {
        if (!user) navigate("/login")
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const sendMessage = async () => {
        if (currentMessage.trim() === '') return;

        const newUserMessage = { role: 'user', text: currentMessage };
        setChatHistory((prev) => [...prev, newUserMessage]);
        setCurrentMessage('');
        setIsLoading(true);

        try {
            const contentsToSend = [
                chatbotContextInstruction,
                ...chatHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                })),
                {
                    role: 'user',
                    parts: [{ text: newUserMessage.text }]
                }
            ];

            const payload = { contents: contentsToSend };
            const apiKey = "AIzaSyDOcymnUFIE6mJ6nm1S2MiOYfKE8gMKL7c";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
                const botResponseText = result.candidates[0].content.parts[0].text;
                setChatHistory(prev => [...prev, { role: 'bot', text: botResponseText }]);
            } else {
                setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I could not find an answer to that.' }]);
            }
        } catch (error) {
            console.error('Gemini error:', error);
            setChatHistory(prev => [...prev, { role: 'bot', text: `Error: ${error.message || 'Something went wrong.'}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-purple-300 font-inter antialiased">
            <header className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 shadow-lg flex justify-between">
                <button className='flex' onClick={() => navigate("/")}>
                    <ArrowLeft /> Back
                </button>
                <h1 className="text-3xl font-bold rounded-lg px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm">
                    BookIt
                </h1>
            </header>

            <main className="flex-1 overflow-auto scrollbar-hide p-6 space-y-4 max-w-2xl mx-auto w-full ">
                {chatHistory.length === 0 && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-black text-lg text-center">
                            Hi there! I can help you find information about movies, events, sports, and plays. <br />
                            Ask me anything about ticket booking for these categories!
                        </p>
                    </div>
                )}

                {chatHistory.map((message, index) => (
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
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 shadow-sm bg-gray-150"
                        placeholder="Ask about movies, events, sports, or plays..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || currentMessage.trim() === ''}
                        className={`px-6 py-3 rounded-xl font-semibold text-white transition duration-200 ease-in-out shadow-md
                            ${isLoading || currentMessage.trim() === ''
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
