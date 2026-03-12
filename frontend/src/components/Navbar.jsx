import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  ChefHat, Menu, X, MessageCircle, Send, LogOut,
  Camera, TrendingUp
} from "lucide-react";
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
        const response = await axios.post("http://localhost:1001/api/chat/chats", {
          message: userMsg,
        });
        setChatMessages((prev) => [...prev, { bot: response.data.reply }]);
      } catch (error) {
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

  const navLinkStyle = "text-sm font-medium text-gray-500 hover:text-green-600 transition block py-2 lg:py-0";
  const activeStyle = (path) =>
    location.pathname === path
      ? "text-green-600 font-semibold"
      : "text-gray-500";

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <ChefHat className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-green-700 tracking-tight">DietTracker</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              <Link to="/dashboard" className={`text-sm font-medium transition ${activeStyle("/dashboard")} hover:text-green-600`}>Dashboard</Link>
              <Link to="/foodLog" className={`text-sm font-medium transition ${activeStyle("/foodLog")} hover:text-green-600`}>Food Log</Link>
              <Link to="/nutritionInfo" className={`text-sm font-medium transition ${activeStyle("/nutritionInfo")} hover:text-green-600`}>Nutrition</Link>
              <Link to="/mealPlannerHome" className={`text-sm font-medium transition ${activeStyle("/mealPlannerHome")} hover:text-green-600`}>Meal Planner</Link>
              <Link to="/history" className={`text-sm font-medium transition ${activeStyle("/history")} hover:text-green-600`}>History</Link>
              <Link to="/profile" className={`text-sm font-medium transition ${activeStyle("/profile")} hover:text-green-600`}>Profile</Link>
              <Link to="/help" className={`text-sm font-medium transition ${activeStyle("/help")} hover:text-green-600`}>Help</Link>

              {/* NEW AI features highlighted */}
              <Link
                to="/photo-log"
                className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition"
              >
                <Camera className="w-3.5 h-3.5" /> Photo Log
              </Link>
              <Link
                to="/weekly-insights"
                className="flex items-center gap-1.5 text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full hover:bg-purple-100 transition"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Insights
              </Link>
            </div>

            {/* Auth Buttons Desktop */}
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
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Dashboard</Link>
              <Link to="/foodLog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Food Log</Link>
              <Link to="/nutritionInfo" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Nutrition Info</Link>
              <Link to="/mealPlannerHome" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Meal Planner</Link>
              <Link to="/history" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">History</Link>
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Profile</Link>
              <Link to="/help" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50">Help</Link>

              {/* NEW AI features in mobile */}
              <Link to="/photo-log" className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-emerald-700 hover:bg-emerald-50">
                <Camera className="w-4 h-4" /> AI Photo Log
              </Link>
              <Link to="/weekly-insights" className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-purple-700 hover:bg-purple-50">
                <TrendingUp className="w-4 h-4" /> Weekly Insights
              </Link>

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

      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 bg-green-600 rounded-full shadow-xl text-white hover:bg-green-700 hover:scale-105 transition z-50 flex items-center justify-center"
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden flex flex-col h-[500px]">
          <div className="bg-green-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> AI Assistant
            </h3>
            <button onClick={toggleChat} className="text-green-100 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {chatMessages.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-10">Ask me anything about your diet!</p>
            )}
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.user ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.user ? "bg-green-600 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm"}`}>
                  {msg.user || msg.bot}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 text-xs px-3 py-2 rounded-full animate-pulse">Typing...</div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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