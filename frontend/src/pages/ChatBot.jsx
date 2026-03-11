// frontend/src/pages/ChatBot.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatBot = () => {
    const [messages, setMessages] = useState([{ text: "Hi! I'm your Nutrition Coach. What did you eat today?", isBot: true }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = { text: input, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:1001/api/chat/message', 
                { message: input }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Error connecting to AI. Please try again.";
            setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[80vh] bg-gray-50 rounded-xl shadow-lg max-w-2xl mx-auto mt-10">
            <div className="p-4 bg-green-600 text-white rounded-t-xl font-bold">AI Health Coach</div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${m.isBot ? 'bg-white border text-gray-800' : 'bg-green-500 text-white'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-gray-400 text-sm animate-pulse">Coach is thinking...</div>}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t flex gap-2">
                <input 
                    className="flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type: 'I had 2 eggs for breakfast'..."
                />
                <button onClick={handleSend} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Send</button>
            </div>
        </div>
    );
};

export default ChatBot;