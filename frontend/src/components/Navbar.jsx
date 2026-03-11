import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { 
  ChefHat, Menu, X, MessageCircle, Send, LogOut, Sun, Moon, Monitor,
  Mic, MicOff, Volume2, VolumeX, Globe, Bot, User, Sparkles
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import useDarkMode from "../hooks/useDarkMode";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isDark, theme, toggleTheme } = useDarkMode();
  
  // Voice Features State
  const [isListening, setIsListening] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState("en-US");
  const [recognitionError, setRecognitionError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isListening, isSpeaking]);

  // Initialize speech synthesis and cleanup
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    return () => {
      // Cleanup speech synthesis on unmount
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      // Cleanup recognition on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  // Toggle chat with animation
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setRecognitionError(null);
  };

  // Check browser support for Speech Recognition
  const checkSpeechSupport = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Speech recognition not supported in this browser. Please use Chrome.");
      return null;
    }
    return SpeechRecognition;
  };

  // Start Speech-to-Text
  const startListening = useCallback(() => {
    const SpeechRecognition = checkSpeechSupport();
    if (!SpeechRecognition) return;

    try {
      setRecognitionError(null);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        
        if (event.results[0].isFinal) {
          setMessage((prev) => prev + transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        if (event.error === "not-allowed") {
          setRecognitionError("Microphone access denied. Please allow microphone permissions.");
        } else if (event.error === "no-speech") {
          setRecognitionError("No speech detected. Please try again.");
        } else if (event.error === "network") {
          setRecognitionError("Network error. Please check your connection.");
        } else {
          setRecognitionError("Error: " + event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setRecognitionError("Failed to start voice recognition.");
      setIsListening(false);
    }
  }, [speechLanguage]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Toggle microphone
  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Text-to-Speech function
  const speakText = useCallback((text) => {
    if (!voiceReplyEnabled || !text) return;
    
    // Cancel any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLanguage;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [voiceReplyEnabled, speechLanguage]);

  // Toggle voice reply
  const toggleVoiceReply = () => {
    if (!voiceReplyEnabled) {
      if (!window.speechSynthesis) {
        toast.error("Text-to-speech not supported in this browser.");
        return;
      }
    }
    setVoiceReplyEnabled(!voiceReplyEnabled);
  };

  // Cycle through languages
  const cycleLanguage = () => {
    const languages = [
      { code: "en-US", label: "English" },
      { code: "hi-IN", label: "Hindi" }
    ];
    const currentIndex = languages.findIndex(l => l.code === speechLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setSpeechLanguage(languages[nextIndex].code);
    toast.info("Language switched to " + languages[nextIndex].label);
  };

  // Send message
  const sendMessage = async () => {
    if (message.trim()) {
      const userMsg = message;
      setChatMessages([...chatMessages, { user: userMsg }]);
      setMessage("");
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          const botMsg = "Please login to use the chatbot.";
          setChatMessages((prev) => [...prev, { bot: botMsg }]);
          speakText(botMsg);
          setLoading(false);
          return;
        }
        const response = await axios.post("/api/chat/message", {
          message: userMsg,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const botReply = response.data.reply;
        setChatMessages((prev) => [...prev, { bot: botReply }]);
        
        // Auto-speak bot response
        setTimeout(() => speakText(botReply), 500);
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMsg = "Sorry, something went wrong. Please try again.";
        setChatMessages((prev) => [
          ...prev,
          { bot: errorMsg },
        ]);
        speakText(errorMsg);
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
  const navLinkStyle = "text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition block py-2 lg:py-0";

  // Get theme icon based on current theme
  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="flex-shrink-0 flex items-center gap-2">
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
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition mr-2"
                title={`Current theme: ${theme}`}
              >
                {getThemeIcon()}
              </button>
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
              {/* Dark Mode Toggle (Mobile) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition mr-2"
                title={`Current theme: ${theme}`}
              >
                {getThemeIcon()}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800">Dashboard</Link>
              <Link to="/foodLog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800">FoodLog</Link>
              <Link to="/nutritionInfo" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800">Nutrition Info</Link>
              <Link to="/mealPlannerHome" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800">Meal Planner</Link>
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800">Profile</Link>
              {/* ADDED HISTORY LINK HERE FOR MOBILE */}
              <Link to="/history" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800">History</Link>
              
              <div className="pt-4 pb-2 border-t border-gray-100 dark:border-gray-700 mt-2">
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

      {/* --- ENHANCED AI CHATBOT UI --- */}
      
      {/* Floating Toggle Button with pulse animation */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 p-4 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-xl text-white hover:from-green-600 hover:to-green-800 hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center group ${isChatOpen ? '' : 'animate-pulse-slow'}`}
      >
        <div className="relative">
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
          {/* Sparkle effect when closed */}
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          )}
        </div>
      </button>

      {/* Chat Window - Professional SaaS Design */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden flex flex-col h-[550px] transition-all duration-300 animate-slide-up">
          
          {/* Chat Header - Premium SaaS Style */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-1">
                    AI Health Coach
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </h3>
                  <p className="text-xs text-green-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    Online & Ready
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Voice Reply Toggle */}
                <button
                  onClick={toggleVoiceReply}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    voiceReplyEnabled 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-green-100 hover:bg-white/20'
                  }`}
                  title={voiceReplyEnabled ? "Disable voice replies" : "Enable voice replies"}
                >
                  {voiceReplyEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                
                {/* Language Switcher */}
                <button
                  onClick={cycleLanguage}
                  className="p-2 rounded-lg bg-white/10 text-green-100 hover:bg-white/20 transition-all duration-200 flex items-center gap-1 text-xs"
                  title="Switch language"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{speechLanguage === 'en-US' ? 'EN' : 'HI'}</span>
                </button>
                
                <button onClick={toggleChat} className="p-2 rounded-lg text-green-100 hover:bg-white/20 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Voice Status Indicator */}
          {isListening && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 animate-pulse">
              <Mic className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Listening...</span>
              <button 
                onClick={stopListening}
                className="ml-2 px-2 py-1 bg-white/20 rounded text-xs hover:bg-white/30"
              >
                Stop
              </button>
            </div>
          )}

          {/* Error Display */}
          {recognitionError && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              {recognitionError}
              <button 
                onClick={() => setRecognitionError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Speaking Indicator */}
          {isSpeaking && voiceReplyEnabled && (
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 flex items-center justify-center gap-2">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Speaking...</span>
            </div>
          )}

          {/* Messages Area - Enhanced SaaS Style */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl mb-4">
                  <Bot className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Your AI Nutrition Coach</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Ask me about your diet, nutrition, or track your meals. Try voice input!
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs">
                    {speechLanguage === 'en-US' ? 'English' : 'Hindi'}
                  </span>
                  {voiceReplyEnabled && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Voice On
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.user ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.user ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.user 
                      ? 'bg-green-600' 
                      : 'bg-gradient-to-br from-green-500 to-emerald-600'
                  }`}>
                    {msg.user ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                    msg.user 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-600'
                  }`}>
                    {msg.user || msg.bot}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area - Professional SaaS Style */}
          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-600 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
              {/* Microphone Button with animation */}
              <button
                onClick={toggleMicrophone}
                className={`p-2.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              
              {/* Text Input */}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                placeholder={isListening ? "Listening..." : "Type your message..."}
                disabled={loading}
                className="flex-1 p-2 bg-transparent dark:bg-transparent focus:outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
              />
              
              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!message.trim() || loading}
                className={`p-2.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                  message.trim() && !loading
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Quick Tips */}
            <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <Mic className="w-3 h-3" /> Voice
              </span>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> {speechLanguage === 'en-US' ? 'EN/HI' : 'HI/EN'}
              </span>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <span className="flex items-center gap-1">
                {voiceReplyEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                {voiceReplyEnabled ? 'Voice On' : 'Voice Off'}
              </span>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {/* Custom CSS for additional animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;