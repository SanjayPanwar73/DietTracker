import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  ChefHat, Menu, X, MessageCircle, Send, LogOut,
  Sparkles, ChevronDown, Camera, TrendingUp, Activity,
  LayoutDashboard, UtensilsCrossed, Apple, CalendarDays,
  User, History, UserCheck,BookOpen, Zap
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config/api";

const Navbar = () => {
  const [isOpen, setIsOpen]             = useState(false);
  const [isChatOpen, setIsChatOpen]     = useState(false);
  const [isAiOpen, setIsAiOpen]         = useState(false);
  const [message, setMessage]           = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const aiRef    = useRef(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (aiRef.current && !aiRef.current.contains(e.target)) setIsAiOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setChatMessages(prev => [...prev, { user: userMsg }]);
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat/chats`, { message: userMsg });
      setChatMessages(prev => [...prev, { bot: res.data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { bot: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast.success("Logged out successfully!");
    setTimeout(() => navigate("/login"), 900);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/dashboard",       label: "Dashboard",    icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { to: "/foodLog",         label: "Food Log",     icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { to: "/nutritionInfo",   label: "Nutrition",    icon: <Apple className="w-3.5 h-3.5" /> },
    { to: "/profile",         label: "Profile",      icon: <User className="w-3.5 h-3.5" /> },
    { to: "/history",         label: "History",      icon: <History className="w-3.5 h-3.5" /> },
   { to: "/specialists", label: "Experts", icon: <UserCheck className="w-3.5 h-3.5" /> },
  { to: "/videos", label: "Blogs", icon: <BookOpen className="w-3.5 h-3.5" /> }
  ];

  const aiItems = [
    {
      to: "/photo-log",
      icon: <Camera className="w-4 h-4" />,
      label: "Photo Food Log",
      desc: "Identify & log food with AI",
      gradient: "from-emerald-400 to-teal-500",
      badge: "Smart",
    },
    {
      to: "/mealPlanner",
      icon: <CalendarDays className="w-4 h-4" />,
      label: "AI Meal Planner",
      desc: "Generate Indian meal plans",
      gradient: "from-orange-400 to-rose-500",
      badge: "AI",
    },
    {
      to: "/weekly-insights",
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Weekly Insights",
      desc: "AI-powered diet analysis",
      gradient: "from-violet-400 to-purple-500",
      badge: "New",
    },
    {
      to: "/activity",
      icon: <Activity className="w-4 h-4" />,
      label: "Activity Tracker",
      desc: "Sync steps from Google Fit",
      gradient: "from-blue-400 to-cyan-500",
      badge: "Live",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .navbar-root { font-family: 'Plus Jakarta Sans', sans-serif; }

        .nav-link-pill {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 500;
          color: #52525b;
          text-decoration: none;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .nav-link-pill:hover {
          color: #16a34a;
          background: #f0fdf4;
        }
        .nav-link-pill.active {
          color: #15803d;
          background: #dcfce7;
          font-weight: 600;
        }
        .nav-link-pill.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #16a34a;
          border-radius: 50%;
        }

        .ai-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #16a34a, #059669);
          color: white;
          box-shadow: 0 2px 12px rgba(22,163,74,0.35);
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }
        .ai-btn:hover {
          background: linear-gradient(135deg, #15803d, #047857);
          box-shadow: 0 4px 18px rgba(22,163,74,0.45);
          transform: translateY(-1px);
        }
        .ai-btn:active { transform: translateY(0); }

        .ai-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: 280px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05);
          overflow: hidden;
          z-index: 100;
          animation: dropIn 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-8px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        .ai-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 14px;
          text-decoration: none;
          transition: background 0.15s;
          margin: 2px 6px;
        }
        .ai-item:hover { background: #f8fafc; }

        .ai-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 999px;
          border: 1.5px solid #e4e4e7;
          background: white;
          font-size: 13px;
          font-weight: 600;
          color: #52525b;
          cursor: pointer;
          transition: all 0.18s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .logout-btn:hover {
          border-color: #fca5a5;
          color: #dc2626;
          background: #fff5f5;
        }

        .chat-bubble-in  { animation: bubbleIn 0.2s ease; }
        @keyframes bubbleIn {
          from { opacity:0; transform: translateY(6px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .sparkle-spin { animation: sparklePulse 2s ease-in-out infinite; }
        @keyframes sparklePulse {
          0%,100% { opacity:1; transform: rotate(0deg) scale(1); }
          50%      { opacity:0.7; transform: rotate(15deg) scale(1.1); }
        }
      `}</style>

      <nav
        className="navbar-root sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'white',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid #f0f0f0',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 64, gap: 8 }}>

            {/* ── Logo ── */}
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginRight: 12, flexShrink:0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #16a34a, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(22,163,74,0.3)',
              }}>
                <ChefHat style={{ width: 20, height: 20, color: 'white' }} />
              </div>
              <span style={{
                fontSize: 20, fontWeight: 800, color: '#14532d',
                letterSpacing: '-0.03em', lineHeight: 1,
              }}>
                Diet<span style={{ color: '#16a34a' }}>Tracker</span>
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex" style={{ alignItems:'center', gap:1, flex:1, overflow:'hidden' }}>
              {navLinks.map(({ to, label, icon }) => (
                <Link key={to} to={to} className={`nav-link-pill ${isActive(to) ? 'active' : ''}`}>
                  {icon} {label}
                </Link>
              ))}
            </div>

            {/* ── Right side: AI dropdown + auth ── */}
            <div className="hidden lg:flex" style={{ alignItems:'center', gap:10, marginLeft:'auto' }}>

              {/* AI Tools dropdown */}
              <div style={{ position:'relative' }} ref={aiRef}>
                <button className="ai-btn" onClick={() => setIsAiOpen(!isAiOpen)}>
                  <Sparkles className="sparkle-spin" style={{ width:14, height:14 }} />
                  AI Tools
                  <ChevronDown style={{
                    width:13, height:13,
                    transition:'transform 0.2s',
                    transform: isAiOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }} />
                </button>

                {isAiOpen && (
                  <div className="ai-dropdown">
                    {/* Header */}
                    <div style={{
                      padding: '14px 16px 10px',
                      borderBottom: '1px solid #f4f4f5',
                      background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                    }}>
                      <p style={{ margin:0, fontSize:11, fontWeight:700, color:'#15803d', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                        ✦ AI-Powered Features
                      </p>
                      <p style={{ margin:'2px 0 0', fontSize:11, color:'#86efac' }}>
                        Smart tools to enhance your diet journey
                      </p>
                    </div>

                    {/* Items */}
                    <div style={{ padding:'8px 0' }}>
                      {aiItems.map((item) => (
                        <Link key={item.to} to={item.to} className="ai-item" onClick={() => setIsAiOpen(false)}>
                          <div className="ai-icon-wrap" style={{ background:`linear-gradient(135deg, var(--g1), var(--g2))`,
                            backgroundImage: `linear-gradient(135deg, ${
                              item.gradient.includes('emerald') ? '#34d399, #0d9488' :
                              item.gradient.includes('orange')  ? '#fb923c, #f43f5e' :
                              item.gradient.includes('violet')  ? '#a78bfa, #9333ea' :
                              '#60a5fa, #06b6d4'
                            })` }}>
                            {item.icon}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:13, fontWeight:700, color:'#18181b' }}>{item.label}</span>
                              <span style={{
                                fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:999,
                                background: item.badge === 'Smart' ? '#dcfce7' : item.badge === 'New' ? '#ede9fe' : '#dbeafe',
                                color: item.badge === 'Smart' ? '#15803d' : item.badge === 'New' ? '#7c3aed' : '#1d4ed8',
                                textTransform:'uppercase', letterSpacing:'0.06em',
                              }}>{item.badge}</span>
                            </div>
                            <p style={{ margin:0, fontSize:11, color:'#a1a1aa' }}>{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{
                      padding: '10px 16px',
                      borderTop: '1px solid #f4f4f5',
                      background: '#fafafa',
                      display: 'flex', alignItems:'center', gap:6,
                    }}>
                      <Zap style={{ width:12, height:12, color:'#f59e0b' }} />
                      <span style={{ fontSize:11, color:'#a1a1aa' }}>Powered by OpenRouter AI</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Auth */}
              {isLoggedIn ? (
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut style={{ width:14, height:14 }} /> Logout
                </button>
              ) : (
                <div style={{ display:'flex', gap:8 }}>
                  <Link to="/login" style={{
                    padding:'7px 16px', borderRadius:999, fontSize:13, fontWeight:600,
                    color:'#52525b', textDecoration:'none', transition:'color 0.15s',
                  }}>Login</Link>
                  <Link to="/signup" style={{
                    padding:'7px 16px', borderRadius:999, fontSize:13, fontWeight:700,
                    background:'linear-gradient(135deg,#16a34a,#059669)',
                    color:'white', textDecoration:'none',
                    boxShadow:'0 2px 10px rgba(22,163,74,0.3)',
                    transition:'all 0.18s',
                  }}>Sign Up</Link>
                </div>
              )}
            </div>

            {/* ── Mobile burger ── */}
            <button
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                marginLeft:'auto', padding:8, borderRadius:10, border:'none',
                background: isOpen ? '#f0fdf4' : 'transparent',
                cursor:'pointer', alignItems:'center', justifyContent:'center', color:'#52525b',
              }}
            >
              {isOpen ? <X style={{width:22,height:22}} /> : <Menu style={{width:22,height:22}} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isOpen && (
          <div style={{
            background:'white', borderTop:'1px solid #f0f0f0',
            padding:'12px 16px 20px',
            boxShadow:'0 12px 40px rgba(0,0,0,0.1)',
          }}
          className="lg:hidden navbar-root"
          >
            {/* Main links */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:16 }}>
              {navLinks.map(({ to, label, icon }) => (
                <Link key={to} to={to} onClick={() => setIsOpen(false)} style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'10px 14px', borderRadius:12, textDecoration:'none',
                  background: isActive(to) ? '#dcfce7' : '#f9fafb',
                  color: isActive(to) ? '#15803d' : '#3f3f46',
                  fontWeight: isActive(to) ? 700 : 500,
                  fontSize:13, border: isActive(to) ? '1.5px solid #bbf7d0' : '1.5px solid transparent',
                  transition:'all 0.15s',
                }}>
                  <span style={{ color: isActive(to) ? '#16a34a' : '#a1a1aa' }}>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>

            {/* AI Tools section */}
            <div style={{
              background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
              borderRadius:16, padding:'12px 14px', marginBottom:14,
              border:'1px solid #bbf7d0',
            }}>
              <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:800, color:'#15803d', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                ✦ AI Tools
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {aiItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setIsOpen(false)} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'9px 10px', borderRadius:12, textDecoration:'none',
                    background:'white', border:'1px solid #f0f0f0',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
                    transition:'all 0.15s',
                  }}>
                    <div style={{
                      width:32, height:32, borderRadius:10, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      backgroundImage: `linear-gradient(135deg, ${
                        item.gradient.includes('emerald') ? '#34d399, #0d9488' :
                        item.gradient.includes('orange')  ? '#fb923c, #f43f5e' :
                        item.gradient.includes('violet')  ? '#a78bfa, #9333ea' :
                        '#60a5fa, #06b6d4'
                      })`,
                      color:'white',
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#18181b' }}>{item.label}</p>
                      <p style={{ margin:0, fontSize:11, color:'#a1a1aa' }}>{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth */}
            <div style={{ borderTop:'1px solid #f0f0f0', paddingTop:14 }}>
              {isLoggedIn ? (
                <button onClick={handleLogout} style={{
                  width:'100%', padding:'11px', borderRadius:12, border:'1.5px solid #fecaca',
                  background:'white', color:'#dc2626', fontWeight:700, fontSize:13,
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                  fontFamily:'Plus Jakarta Sans, sans-serif',
                }}>
                  <LogOut style={{width:15,height:15}} /> Logout
                </button>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <Link to="/login" onClick={() => setIsOpen(false)} style={{
                    padding:'11px', borderRadius:12, border:'1.5px solid #e4e4e7',
                    textAlign:'center', textDecoration:'none', color:'#52525b',
                    fontWeight:600, fontSize:13,
                  }}>Login</Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} style={{
                    padding:'11px', borderRadius:12,
                    background:'linear-gradient(135deg,#16a34a,#059669)',
                    textAlign:'center', textDecoration:'none', color:'white',
                    fontWeight:700, fontSize:13,
                  }}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Floating Chat Button ── */}
      <button
        onClick={toggleChat}
        style={{
          position:'fixed', bottom:24, right:24, zIndex:50,
          width:52, height:52, borderRadius:999, border:'none',
          background:'linear-gradient(135deg,#16a34a,#059669)',
          color:'white', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(22,163,74,0.4)',
          transition:'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
      >
        {isChatOpen
          ? <X style={{width:22,height:22}} />
          : <MessageCircle style={{width:22,height:22}} />
        }
      </button>

      {/* ── Chat Window ── */}
      {isChatOpen && (
        <div
          className="navbar-root"
          style={{
            position:'fixed', bottom:88, right:24, zIndex:50,
            width:340, height:480,
            background:'white', borderRadius:24,
            boxShadow:'0 24px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            display:'flex', flexDirection:'column', overflow:'hidden',
            animation:'dropIn 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Chat header */}
          <div style={{
            padding:'16px 18px',
            background:'linear-gradient(135deg,#16a34a,#059669)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{
                width:32, height:32, borderRadius:10,
                background:'rgba(255,255,255,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <MessageCircle style={{width:16,height:16,color:'white'}} />
              </div>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:'white' }}>AI Nutrition Assistant</p>
                <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.7)' }}>● Online · Ready to help</p>
              </div>
            </div>
            <button onClick={toggleChat} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.8)', padding:4 }}>
              <X style={{width:18,height:18}} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:10, background:'#f9fafb' }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign:'center', padding:'30px 20px' }}>
                <div style={{
                  width:48, height:48, borderRadius:16,
                  background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 10px',
                }}>
                  <Sparkles style={{width:22,height:22,color:'#16a34a'}} />
                </div>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#52525b' }}>Hi! I'm your diet assistant</p>
                <p style={{ margin:'4px 0 0', fontSize:11, color:'#a1a1aa' }}>Ask me anything about nutrition!</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className="chat-bubble-in" style={{ display:'flex', justifyContent: msg.user ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:'80%', padding:'9px 13px', fontSize:13, lineHeight:1.5,
                  borderRadius: msg.user ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.user
                    ? 'linear-gradient(135deg,#16a34a,#059669)'
                    : 'white',
                  color: msg.user ? 'white' : '#18181b',
                  boxShadow: msg.user ? '0 2px 10px rgba(22,163,74,0.25)' : '0 1px 4px rgba(0,0,0,0.07)',
                  border: msg.user ? 'none' : '1px solid #f0f0f0',
                }}>
                  {msg.user || msg.bot}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', justifyContent:'flex-start' }}>
                <div style={{
                  padding:'10px 14px', background:'white', borderRadius:'18px 18px 18px 4px',
                  border:'1px solid #f0f0f0', display:'flex', gap:4, alignItems:'center',
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width:6, height:6, borderRadius:'50%', background:'#a1a1aa',
                      animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding:'12px', background:'white', borderTop:'1px solid #f0f0f0', display:'flex', gap:8 }}>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about nutrition..."
              style={{
                flex:1, padding:'9px 14px', borderRadius:12, fontSize:13,
                border:'1.5px solid #e4e4e7', outline:'none', fontFamily:'Plus Jakarta Sans, sans-serif',
                transition:'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor='#16a34a'}
              onBlur={e => e.target.style.borderColor='#e4e4e7'}
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              style={{
                width:38, height:38, borderRadius:10, border:'none',
                background: message.trim() && !loading
                  ? 'linear-gradient(135deg,#16a34a,#059669)'
                  : '#f0f0f0',
                color: message.trim() && !loading ? 'white' : '#a1a1aa',
                cursor: message.trim() && !loading ? 'pointer' : 'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, transition:'all 0.15s',
              }}
            >
              <Send style={{width:16,height:16}} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%,60%,100% { transform: translateY(0); }
          30%           { transform: translateY(-4px); }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
};

export default Navbar;
