import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Flame, Zap, Droplets, Plus, Activity, TrendingUp, UtensilsCrossed, Target, ArrowRight, Sparkles } from "lucide-react";
import { isSameDay, parseISO, format } from "date-fns";
import {
  Chart as ChartJS, BarElement, CategoryScale, LinearScale,
  ArcElement, Tooltip, Legend, LineElement, PointElement, Filler,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, LineElement, PointElement, Filler);

const Dashboard = () => {
  const [foods, setFoods]               = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [profile, setProfile]           = useState(null);
  const [greeting, setGreeting]         = useState("Good morning");
  const navigate = useNavigate();

  const fmt = (n) => Math.round(n || 0);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    fetchFoods();
    getProfile();
  }, []);

  const getProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const res = await axios.get("http://localhost:1001/api/profile/getProfile",
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.profile) setProfile(res.data.profile);
    } catch (e) { console.error(e); }
  };

  const fetchFoods = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const res = await axios.get("http://localhost:1001/api/food/allFood",
        { headers: { Authorization: `Bearer ${token}` } });
      const today = new Date();
      const todays = res.data.foods.filter(f => isSameDay(parseISO(f.createdAt), today));
      setFoods(todays);
      setTotalCalories(todays.reduce((s, f) => s + f.nutritionInfo.calories, 0));
    } catch (e) { console.error(e); navigate("/login"); }
  };

  // ── derived values ──────────────────────────────────────────────
  const goal       = profile?.calorieRequirement || 2000;
  const pct        = Math.min((totalCalories / goal) * 100, 100);
  const remaining  = Math.max(goal - totalCalories, 0);
  const protein    = fmt(foods.reduce((s, f) => s + f.nutritionInfo.protein_g, 0));
  const fat        = fmt(foods.reduce((s, f) => s + f.nutritionInfo.fat_total_g, 0));
  const carbs      = fmt(foods.reduce((s, f) => s + f.nutritionInfo.carbohydrates_total_g, 0));
  const fiber      = fmt(foods.reduce((s, f) => s + (f.nutritionInfo.fiber_g || 0), 0));

  const mealTypes  = [...new Set(foods.map(f => f.mealType))];
  const mealCals   = mealTypes.map(m => foods.filter(f => f.mealType === m).reduce((s, f) => s + f.nutritionInfo.calories, 0));

  const statusColor = pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#10b981";
  const statusLabel = pct >= 100 ? "Over goal" : pct >= 80 ? "Almost there" : "On track";

  // ── chart configs ───────────────────────────────────────────────
  const baseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: '#1e1e2e', titleColor: '#fff', bodyColor: '#a1a1aa',
      padding: 10, cornerRadius: 10, displayColors: false,
    }},
  };

  const macroDonut = {
    labels: ["Protein", "Fat", "Carbs"],
    datasets: [{
      data: [protein || 1, fat || 1, carbs || 1],
      backgroundColor: ["#10b981", "#3b82f6", "#f59e0b"],
      borderWidth: 0, hoverOffset: 6,
    }],
  };

  const mealBar = {
    labels: mealTypes.length ? mealTypes.map(m => m.charAt(0).toUpperCase() + m.slice(1)) : ["No data"],
    datasets: [{
      data: mealCals.length ? mealCals : [0],
      backgroundColor: ["#10b981","#3b82f6","#f59e0b","#ec4899","#8b5cf6"].slice(0, mealTypes.length || 1),
      borderRadius: 10, borderSkipped: false, barThickness: 32,
    }],
  };

  const goalBar = {
    labels: ["Consumed", "Goal"],
    datasets: [{
      data: [fmt(totalCalories), goal],
      backgroundColor: [statusColor, "#e5e7eb"],
      borderRadius: 10, borderSkipped: false, barThickness: 48,
    }],
  };

  const mealBarOpts = {
    ...baseOpts,
    scales: {
      x: { grid: { display:false }, border: { display:false }, ticks: { color:'#a1a1aa', font:{ size:11 } } },
      y: { grid: { color:'#f4f4f5' }, border: { display:false }, ticks: { color:'#a1a1aa', font:{ size:11 } } },
    },
  };

  const goalBarOpts = {
    ...baseOpts,
    scales: {
      x: { grid: { display:false }, border: { display:false }, ticks: { color:'#a1a1aa', font:{ size:12, weight:'600' } } },
      y: { grid: { color:'#f4f4f5' }, border: { display:false }, ticks: { color:'#a1a1aa', font:{ size:11 } } },
    },
  };

  const mealIconMap = { breakfast:'🌅', lunch:'☀️', dinner:'🌙', snack:'🍎' };

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .dash-card { background:white; border-radius:20px; border:1px solid #f1f5f9; box-shadow:0 1px 8px rgba(0,0,0,0.04); }
        .macro-pill { display:flex; flex-direction:column; align-items:center; padding:12px 16px; border-radius:14px; min-width:72px; }
        .meal-row:hover { background:#f8fafc !important; }
        .quick-btn { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:14px; border:1.5px solid #e2e8f0; background:white; cursor:pointer; text-decoration:none; transition:all 0.15s; }
        .quick-btn:hover { border-color:#10b981; background:#f0fdf4; }
        .progress-bar { height:10px; border-radius:999px; background:#f1f5f9; overflow:hidden; }
        .progress-fill { height:100%; border-radius:999px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <main style={{ maxWidth:1280, margin:'0 auto', padding:'28px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#10b981', letterSpacing:'0.05em', textTransform:'uppercase' }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
            <h1 style={{ margin:'4px 0 4px', fontSize:28, fontWeight:800, color:'#0f172a', letterSpacing:'-0.02em' }}>
              {greeting}, <span style={{color:'#10b981'}}>{profile?.user?.name || "there"}!</span> 👋
            </h1>
            <p style={{ margin:0, fontSize:14, color:'#94a3b8' }}>
              {foods.length === 0 ? "No meals logged yet today — let's get started!" : `${foods.length} meal${foods.length > 1 ? 's' : ''} logged · ${fmt(totalCalories)} kcal consumed`}
            </p>
          </div>
          <button
            onClick={() => navigate("/foodLog")}
            style={{
              display:'flex', alignItems:'center', gap:8, padding:'11px 20px',
              borderRadius:14, border:'none', cursor:'pointer', fontWeight:700, fontSize:14,
              background:'linear-gradient(135deg,#10b981,#059669)', color:'white',
              boxShadow:'0 4px 14px rgba(16,185,129,0.35)', transition:'all 0.2s',
              fontFamily:"'Plus Jakarta Sans', sans-serif",
            }}
          >
            <Plus style={{width:16,height:16}} /> Log Food
          </button>
        </div>

        {/* ── Row 1: Calorie Ring + Macro Pills + Status ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:16 }}
          className="grid-cols-1 md:grid-cols-3">

          {/* Big Calorie Card */}
          <div className="dash-card" style={{ padding:'24px', gridColumn:'span 1' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Calories Today</p>
                <p style={{ margin:'4px 0 0', fontSize:36, fontWeight:800, color:'#0f172a', letterSpacing:'-0.03em', lineHeight:1 }}>
                  {fmt(totalCalories).toLocaleString()}
                </p>
                <p style={{ margin:'4px 0 0', fontSize:13, color:'#94a3b8' }}>of {goal.toLocaleString()} kcal goal</p>
              </div>
              <div style={{ position:'relative', width:72, height:72 }}>
                <svg viewBox="0 0 72 72" style={{ width:72, height:72, transform:'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#f1f5f9" strokeWidth="8"/>
                  <circle cx="36" cy="36" r="30" fill="none" stroke={statusColor} strokeWidth="8"
                    strokeDasharray={`${2*Math.PI*30}`}
                    strokeDashoffset={`${2*Math.PI*30*(1-pct/100)}`}
                    strokeLinecap="round"
                    style={{transition:'stroke-dashoffset 1.2s ease'}}
                  />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                  <span style={{ fontSize:14, fontWeight:800, color:statusColor }}>{Math.round(pct)}%</span>
                </div>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg, #10b981, ${statusColor})` }} />
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
              <div style={{ textAlign:'center' }}>
                <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#10b981' }}>{fmt(remaining).toLocaleString()}</p>
                <p style={{ margin:0, fontSize:11, color:'#94a3b8', fontWeight:600 }}>Remaining</p>
              </div>
              <div style={{ width:1, background:'#f1f5f9' }} />
              <div style={{ textAlign:'center' }}>
                <p style={{ margin:0, fontSize:18, fontWeight:800, color:statusColor }}>{statusLabel}</p>
                <p style={{ margin:0, fontSize:11, color:'#94a3b8', fontWeight:600 }}>Status</p>
              </div>
              <div style={{ width:1, background:'#f1f5f9' }} />
              <div style={{ textAlign:'center' }}>
                <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#0f172a' }}>{foods.length}</p>
                <p style={{ margin:0, fontSize:11, color:'#94a3b8', fontWeight:600 }}>Meals</p>
              </div>
            </div>
          </div>

          {/* Macros Card */}
          <div className="dash-card" style={{ padding:'24px' }}>
            <p style={{ margin:'0 0 16px', fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Macronutrients</p>
            <div style={{ display:'flex', justifyContent:'space-around', marginBottom:16 }}>
              {[
                { label:'Protein', val:protein, unit:'g', color:'#10b981', bg:'#f0fdf4' },
                { label:'Carbs',   val:carbs,   unit:'g', color:'#f59e0b', bg:'#fffbeb' },
                { label:'Fat',     val:fat,     unit:'g', color:'#3b82f6', bg:'#eff6ff' },
                { label:'Fiber',   val:fiber,   unit:'g', color:'#8b5cf6', bg:'#f5f3ff' },
              ].map(m => (
                <div key={m.label} className="macro-pill" style={{ background:m.bg }}>
                  <span style={{ fontSize:20, fontWeight:800, color:m.color }}>{m.val}</span>
                  <span style={{ fontSize:10, color:m.color, fontWeight:700 }}>{m.unit}</span>
                  <span style={{ fontSize:10, color:'#94a3b8', fontWeight:600, marginTop:2 }}>{m.label}</span>
                </div>
              ))}
            </div>
            {/* Macro progress bars */}
            {[
              { label:'Protein', val:protein, goal:Math.round(goal*0.0375), color:'#10b981' },
              { label:'Carbs',   val:carbs,   goal:Math.round(goal*0.1375), color:'#f59e0b' },
              { label:'Fat',     val:fat,     goal:Math.round(goal*0.0278), color:'#3b82f6' },
            ].map(m => (
              <div key={m.label} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'#64748b' }}>{m.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:m.color }}>{m.val}g / ~{m.goal}g</span>
                </div>
                <div className="progress-bar" style={{ height:6 }}>
                  <div className="progress-fill" style={{ width:`${Math.min((m.val/m.goal)*100,100)}%`, background:m.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions + Water */}
          <div className="dash-card" style={{ padding:'24px', display:'flex', flexDirection:'column', gap:12 }}>
            <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Quick Actions</p>
            {[
              { to:'/foodLog',        icon:'🍽', label:'Food Log',       desc:'View & manage today' },
              { to:'/photo-log',      icon:'📷', label:'AI Photo Log',   desc:'Log by photo/name' },
              { to:'/weekly-insights',icon:'📊', label:'Weekly Insights',desc:'AI diet analysis' },
              { to:'/activity',       icon:'🏃', label:'Activity',       desc:'Steps & calories' },
            ].map(({ to, icon, label, desc }) => (
              <a key={to} href={to} className="quick-btn" style={{ textDecoration:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:18 }}>{icon}</span>
                  <div>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#0f172a' }}>{label}</p>
                    <p style={{ margin:0, fontSize:11, color:'#94a3b8' }}>{desc}</p>
                  </div>
                </div>
                <ArrowRight style={{ width:14, height:14, color:'#cbd5e1' }} />
              </a>
            ))}
          </div>
        </div>

        {/* ── Row 2: Charts ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr', gap:16, marginBottom:16 }}>

          {/* Meal Calories Bar */}
          <div className="dash-card" style={{ padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Calories by Meal</p>
              <span style={{ fontSize:11, background:'#f0fdf4', color:'#10b981', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>Today</span>
            </div>
            <div style={{ height:160 }}>
              {foods.length > 0
                ? <Bar data={mealBar} options={mealBarOpts} />
                : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
                    <span style={{ fontSize:28 }}>🍽</span>
                    <p style={{ margin:0, fontSize:12, color:'#cbd5e1' }}>No meals logged yet</p>
                  </div>
              }
            </div>
          </div>

          {/* Macro Donut */}
          <div className="dash-card" style={{ padding:'24px', display:'flex', flexDirection:'column', alignItems:'center' }}>
            <p style={{ margin:'0 0 12px', fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', alignSelf:'flex-start' }}>Macro Split</p>
            <div style={{ position:'relative', width:130, height:130 }}>
              <Doughnut data={macroDonut} options={{ ...baseOpts, cutout:'68%' }} />
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>Total</span>
                <span style={{ fontSize:18, fontWeight:800, color:'#0f172a', lineHeight:1.1 }}>{fmt(totalCalories)}</span>
                <span style={{ fontSize:10, color:'#94a3b8' }}>kcal</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:14, marginTop:14 }}>
              {[['#10b981','Protein'],['#f59e0b','Carbs'],['#3b82f6','Fat']].map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }} />
                  <span style={{ fontSize:11, color:'#64748b', fontWeight:600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goal vs Consumed */}
          <div className="dash-card" style={{ padding:'24px' }}>
            <p style={{ margin:'0 0 16px', fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Goal Progress</p>
            <div style={{ height:160 }}>
              <Bar data={goalBar} options={goalBarOpts} />
            </div>
          </div>
        </div>

        {/* ── Row 3: Today's Meals List ── */}
        <div className="dash-card" style={{ padding:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Today's Meals</p>
              <span style={{ fontSize:11, background:'#f0fdf4', color:'#10b981', padding:'3px 10px', borderRadius:999, fontWeight:700 }}>
                {foods.length} Items
              </span>
            </div>
            <button
              onClick={() => navigate('/foodLog')}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'white', cursor:'pointer', fontSize:12, fontWeight:700, color:'#64748b', fontFamily:"'Plus Jakarta Sans', sans-serif" }}
            >
              View All <ArrowRight style={{width:12,height:12}} />
            </button>
          </div>

          {foods.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
              {foods.map((food, i) => {
                const mealIcon = mealIconMap[food.mealType?.toLowerCase()] || '🍴';
                const colors = ['#10b981','#3b82f6','#f59e0b','#ec4899','#8b5cf6'];
                const c = colors[i % colors.length];
                return (
                  <div key={food._id || i} className="meal-row" style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                    borderRadius:14, border:'1.5px solid #f1f5f9', background:'#fafafa',
                    transition:'all 0.15s', cursor:'default',
                  }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:`${c}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                      {mealIcon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#0f172a', textTransform:'capitalize', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{food.foodName}</p>
                      <p style={{ margin:0, fontSize:11, color:'#94a3b8', textTransform:'capitalize', fontWeight:500 }}>{food.mealType} · {fmt(food.nutritionInfo.protein_g)}g prot</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ margin:0, fontSize:14, fontWeight:800, color:c }}>{fmt(food.nutritionInfo.calories)}</p>
                      <p style={{ margin:0, fontSize:10, color:'#94a3b8', fontWeight:600 }}>kcal</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding:'40px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🥗</div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:'#0f172a' }}>No meals logged today</p>
              <p style={{ margin:0, fontSize:13, color:'#94a3b8' }}>Start tracking your nutrition by adding your first meal</p>
              <button
                onClick={() => navigate('/foodLog')}
                style={{ marginTop:4, padding:'10px 20px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#10b981,#059669)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:"'Plus Jakarta Sans', sans-serif" }}
              >
                <Plus style={{width:14,height:14}} /> Log Your First Meal
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;