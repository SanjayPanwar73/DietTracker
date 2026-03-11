import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { ChefHat, Menu, X, MessageCircle, Send, LogOut } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const sendMessage = async () => {
    if (message.trim()) {
      const userMsg = message;
      setChatMessages([...chatMessages, { user: userMsg }]);
      setMessage("");
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setChatMessages((prev) => [...prev, { bot: "Please login to use the chatbot." }]);
          setLoading(false);
          return;
        }
        const response = await axios.post("http://localhost:1001/api/chat/message", {
          message: userMsg,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatMessages((prev) => [...prev, { bot: response.data.reply }]);
      } catch (error) {
        console.error("Error sending message:", error);
        setChatMessages((prev) => [
          ...prev,
          { bot: "Sorry, something went wrong. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast.success("Logged Out successfully!");
    setTimeout(() => navigate("/login"), 1000);
  };

  // Common link styles
  const navLinkStyle = "text-sm font-medium text-gray-500 hover:text-green-600 transition block py-2 lg:py-0";

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <button onClick={toggleChat} className="flex-shrink-0 flex items-center gap-2">
                <ChefHat className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-green-700 tracking-tight">DietTracker</span>
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <Link to="/dashboard" className={navLinkStyle}>Dashboard</Link>
              <Link to="/foodLog" className={navLinkStyle}>FoodLog</Link>
              <Link to="/nutritionInfo" className={navLinkStyle}>Nutrition Info</Link>
              <Link to="/mealPlannerHome" className={navLinkStyle}>Meal Planner</Link>
              <Link to="/profile" className={navLinkStyle}>Profile</Link>
              {/* ADDED HISTORY LINK HERE */}
              <Link to="/history" className={navLinkStyle}>History</Link>
            </div>

            {/* Auth Buttons (Desktop) */}
            <div className="hidden lg:flex lg:items-center">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition text-sm"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className="text-gray-500 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                  <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Dashboard</Link>
              <Link to="/foodLog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">FoodLog</Link>
              <Link to="/nutritionInfo" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Nutrition Info</Link>
              <Link to="/mealPlannerHome" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Meal Planner</Link>
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Profile</Link>
              {/* ADDED HISTORY LINK HERE FOR MOBILE */}
              <Link to="/history" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">History</Link>
              
              <div className="pt-4 pb-2 border-t border-gray-100 mt-2">
                {isLoggedIn ? (
                  <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                ) : (
                  <>
                     <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Login</Link>
                     <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- CHATBOT UI --- */}
      
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 bg-green-600 rounded-full shadow-xl text-white hover:bg-green-700 hover:scale-105 transition z-50 flex items-center justify-center"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col h-[500px]">
          {/* Chat Header */}
          <div className="bg-green-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> AI Assistant
            </h3>
            <button onClick={toggleChat} className="text-green-100 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {chatMessages.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-10">Ask me anything about your diet!</p>
            )}
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.user ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'}`}>
                  {msg.user || msg.bot}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 text-xs px-3 py-2 rounded-full animate-pulse">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
};

export default Navbar;