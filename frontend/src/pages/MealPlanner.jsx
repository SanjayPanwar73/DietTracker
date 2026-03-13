import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChefHat, Flame, Ban, Leaf, ArrowRight,
  Utensils, Clock, Loader2, AlertCircle,
  Download, CheckCircle2, MapPin, Users,
  ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { jsPDF } from "jspdf";

/* ─── PDF Generator ───────────────────────────────────────────── */
const downloadMealPlanPDF = (mealPlan, preferences) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, M = 16, CW = W - M * 2;
  let y = 0;

  const GREEN  = [16, 185, 129];
  const DGREEN = [5,  150, 105];
  const DARK   = [15,  23,  42];
  const GRAY   = [100,116, 139];
  const LGRAY  = [241,245, 249];
  const WHITE  = [255,255, 255];
  const ORANGE = [249,115,  22];
  const PURPLE = [139, 92, 246];
  const BLUE   = [59, 130, 246];

  const hex = ([r,g,b]) => { doc.setFillColor(r,g,b); doc.setTextColor(r,g,b); };
  const fill = (color) => doc.setFillColor(...color);
  const text = (color) => doc.setTextColor(...color);
  const font = (size, style="normal") => { doc.setFontSize(size); doc.setFont("helvetica", style); };

  const newPage = () => { doc.addPage(); y = 20; };
  const checkPage = (needed = 30) => { if (y + needed > 275) newPage(); };

  /* ── Cover / Header ── */
  fill(GREEN); doc.rect(0, 0, W, 52, "F");
  fill(DGREEN); doc.rect(0, 44, W, 8, "F");

  // Logo circle
  fill(WHITE); doc.circle(M + 8, 20, 8, "F");
  text(GREEN); font(11, "bold");
  doc.text("DT", M + 5, 23.5);

  text(WHITE); font(22, "bold");
  doc.text("AI Meal Plan", M + 22, 18);
  font(10, "normal");
  doc.text("AI-Powered Smart Diet Tracking & Nutrition Guidance System", M + 22, 25);

  // date
  font(8, "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}`, M + 22, 32);

  // Preferences row
  fill([255,255,255,0.15]); // transparent-ish strip already covered by dgreen
  text(WHITE); font(8, "normal");
  const prefStr = `${preferences.calories} kcal  ·  ${preferences.diet || "No Restrictions"}  ·  ${preferences.region || "Any Region"}${preferences.exclude ? "  ·  Excl: " + preferences.exclude : ""}`;
  doc.text(prefStr, M, 49);

  y = 62;

  /* ── Nutrition Summary ── */
  fill(LGRAY); doc.roundedRect(M, y, CW, 28, 3, 3, "F");

  const macros = [
    { label:"Calories", value:`${mealPlan.totalCalories}`, unit:"kcal", color:GREEN },
    { label:"Protein",  value:`${mealPlan.totalProtein}`,  unit:"g",    color:ORANGE },
    { label:"Carbs",    value:`${mealPlan.totalCarbs}`,    unit:"g",    color:PURPLE },
    { label:"Fat",      value:`${mealPlan.totalFat}`,      unit:"g",    color:BLUE   },
  ];
  const boxW = CW / 4;
  macros.forEach((m, i) => {
    const bx = M + i * boxW;
    fill(WHITE); doc.roundedRect(bx + 2, y + 3, boxW - 4, 22, 2, 2, "F");
    text(m.color); font(14, "bold");
    doc.text(m.value, bx + boxW/2, y + 14, { align:"center" });
    font(7, "normal");
    doc.text(m.unit, bx + boxW/2, y + 19, { align:"center" });
    text(GRAY); font(7, "bold");
    doc.text(m.label.toUpperCase(), bx + boxW/2, y + 24, { align:"center" });
  });

  y += 36;

  /* ── Meal Cards ── */
  const mealColors = {
    Breakfast: ORANGE,
    Lunch:     GREEN,
    Snack:     PURPLE,
    Dinner:    BLUE,
  };
  const mealEmoji = { Breakfast:"☀", Lunch:"🍱", Snack:"🥤", Dinner:"🌙" };

  mealPlan.meals.forEach((meal, idx) => {
    const mColor = mealColors[meal.type] || GREEN;

    // estimate card height: header(18) + nutrition(16) + ingredients + steps + tags
    const ingLines = meal.ingredients ? Math.ceil(meal.ingredients.length / 2) : 0;
    const stepLines = meal.steps ? meal.steps.reduce((s, st) => s + Math.ceil(doc.splitTextToSize(st, CW/2 - 8).length), 0) : 0;
    const estH = 18 + 16 + 8 + ingLines * 5 + 8 + stepLines * 5 + 14;
    checkPage(estH);

    /* card background */
    fill(LGRAY); doc.roundedRect(M, y, CW, 6, 2, 2, "F");

    /* colored top bar */
    fill(mColor); doc.roundedRect(M, y, CW, 10, 2, 2, "F");
    fill(mColor); doc.rect(M, y + 6, CW, 4, "F"); // square bottom

    /* meal type badge */
    fill(WHITE);
    doc.roundedRect(M + 3, y + 2, 22, 6, 1, 1, "F");
    text(mColor); font(7, "bold");
    doc.text(meal.type.toUpperCase(), M + 14, y + 6.5, { align:"center" });

    /* meal name */
    text(WHITE); font(11, "bold");
    doc.text(meal.name, M + 28, y + 7.5);

    /* time & servings */
    font(7, "normal");
    doc.text(`⏱ ${meal.prepTime || "—"}   👤 ${meal.servings || 1} serving`, W - M - 2, y + 7.5, { align:"right" });

    y += 13;

    /* nutrition strip */
    fill(WHITE); doc.rect(M, y, CW, 14, "F");
    const nFields = [
      { l:"Calories", v:`${meal.calories} kcal` },
      { l:"Protein",  v:`${meal.protein}g` },
      { l:"Carbs",    v:`${meal.carbs}g` },
      { l:"Fat",      v:`${meal.fat}g` },
    ];
    const nW = CW / 4;
    nFields.forEach((n, i) => {
      const nx = M + i * nW;
      fill(LGRAY); doc.roundedRect(nx + 2, y + 2, nW - 4, 10, 1.5, 1.5, "F");
      text(DARK); font(8, "bold");
      doc.text(n.v, nx + nW/2, y + 8, { align:"center" });
      text(GRAY); font(6.5, "normal");
      doc.text(n.l, nx + nW/2, y + 11.5, { align:"center" });
    });
    y += 17;

    /* two-column: ingredients + steps */
    const colW = CW / 2 - 3;

    // ingredients header
    fill(mColor);
    doc.roundedRect(M, y, colW, 6, 1, 1, "F");
    text(WHITE); font(7, "bold");
    doc.text("INGREDIENTS", M + colW/2, y + 4.3, { align:"center" });

    // steps header
    fill(DARK);
    doc.roundedRect(M + colW + 6, y, colW, 6, 1, 1, "F");
    text(WHITE); font(7, "bold");
    doc.text("PREPARATION STEPS", M + colW + 6 + colW/2, y + 4.3, { align:"center" });

    y += 8;

    const ingStartY = y;
    const stpStartY = y;

    // ingredients
    let iy = ingStartY;
    (meal.ingredients || []).forEach((ing, i) => {
      fill(i % 2 === 0 ? [248,250,252] : WHITE);
      doc.rect(M, iy, colW, 5.5, "F");
      text(DARK); font(7.5, "normal");
      const lines = doc.splitTextToSize(`• ${ing}`, colW - 4);
      doc.text(lines[0], M + 3, iy + 4);
      iy += 5.5;
    });

    // steps
    let sy = stpStartY;
    (meal.steps || []).forEach((step, i) => {
      const stepLines = doc.splitTextToSize(step, colW - 10);
      const sh = stepLines.length * 4.5 + 3;
      fill(i % 2 === 0 ? [248,250,252] : WHITE);
      doc.rect(M + colW + 6, sy, colW, sh, "F");
      // circle number
      fill(mColor);
      doc.circle(M + colW + 6 + 3.5, sy + sh/2, 2.5, "F");
      text(WHITE); font(6, "bold");
      doc.text(`${i+1}`, M + colW + 6 + 3.5, sy + sh/2 + 0.8, { align:"center" });
      text(DARK); font(7, "normal");
      doc.text(stepLines, M + colW + 6 + 8, sy + 4.5);
      sy += sh;
    });

    y = Math.max(iy, sy) + 4;

    // tags
    if (meal.tags && meal.tags.length) {
      let tx = M;
      meal.tags.forEach(tag => {
        const tw = doc.getTextWidth(tag) + 6;
        fill([220,252,231]); doc.roundedRect(tx, y, tw, 5.5, 1, 1, "F");
        text([21,128,61]); font(6.5, "bold");
        doc.text(tag, tx + 3, y + 4);
        tx += tw + 3;
      });
      y += 8;
    }

    // bottom border
    fill(mColor); doc.rect(M, y, CW, 0.8, "F");
    y += 6;
  });

  /* ── Footer ── */
  checkPage(20);
  fill(LGRAY); doc.rect(0, y, W, 18, "F");
  fill(GREEN); doc.rect(0, y, W, 1, "F");
  text(GRAY); font(7, "normal");
  doc.text("Generated by DietTracker · AI-Powered Smart Diet Tracking & Nutrition Guidance System", W/2, y + 7, { align:"center" });
  doc.text(`This meal plan is AI-generated based on your preferences (${preferences.calories} kcal target). Consult a nutritionist for medical advice.`, W/2, y + 12, { align:"center" });

  /* ── Page numbers ── */
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    text(GRAY); font(7, "normal");
    doc.text(`Page ${i} of ${totalPages}`, W - M, 290, { align:"right" });
    if (i > 1) {
      fill(GREEN); doc.rect(0, 0, W, 1.5, "F");
    }
  }

  doc.save(`DietTracker-MealPlan-${new Date().toISOString().split("T")[0]}.pdf`);
};

/* ─── Component ───────────────────────────────────────────────── */
const MealPlanner = () => {
  const navigate = useNavigate();
  const [calories, setCalories]   = useState(2000);
  const [diet, setDiet]           = useState("vegetarian");
  const [exclude, setExclude]     = useState("");
  const [region, setRegion]       = useState("");
  const [mealPlan, setMealPlan]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError]         = useState("");
  const [expanded, setExpanded]   = useState({});

  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:1001/api/profile/getProfile",
          { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.profile?.calorieRequirement)
          setCalories(Math.round(res.data.profile.calorieRequirement));
      } catch (e) { console.error(e); }
    };
    getProfile();
  }, []);

  const fetchMeals = async () => {
    if (!calories) { setError("Please enter your calorie requirement."); return; }
    setLoading(true); setError(""); setMealPlan(null); setExpanded({});
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:1001/api/mealplan/generate",
        { calories, diet, exclude, region },
        { headers: { Authorization: `Bearer ${token}` } });
      setMealPlan(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to generate meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      downloadMealPlanPDF(mealPlan, { calories, diet, exclude, region });
      setDownloading(false);
    }, 100);
  };

  const toggleExpand = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const mealColors = {
    Breakfast: { bg:"#fff7ed", border:"#fed7aa", badge:"#ea580c", text:"#c2410c" },
    Lunch:     { bg:"#f0fdf4", border:"#bbf7d0", badge:"#16a34a", text:"#15803d" },
    Snack:     { bg:"#faf5ff", border:"#e9d5ff", badge:"#9333ea", text:"#7e22ce" },
    Dinner:    { bg:"#eff6ff", border:"#bfdbfe", badge:"#2563eb", text:"#1d4ed8" },
  };
  const mealEmojis = { Breakfast:"🌅", Lunch:"☀️", Snack:"🍎", Dinner:"🌙" };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Plus Jakarta Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .mp-input { width:100%; padding:10px 14px 10px 38px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; outline:none; transition:border-color .15s,background .15s; }
        .mp-input:focus { border-color:#10b981; background:white; }
        .mp-select { width:100%; padding:10px 36px 10px 14px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; outline:none; appearance:none; cursor:pointer; transition:border-color .15s; }
        .mp-select:focus { border-color:#10b981; background:white; }
        .gen-btn { width:100%; padding:12px; border-radius:14px; border:none; cursor:pointer; background:linear-gradient(135deg,#10b981,#059669); color:white; font-size:14px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(16,185,129,.3); transition:all .2s; }
        .gen-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(16,185,129,.38); }
        .gen-btn:disabled { opacity:.65; cursor:not-allowed; }
        .dl-btn { display:flex; align-items:center; gap:8px; padding:11px 22px; border-radius:14px; border:none; cursor:pointer; background:linear-gradient(135deg,#0f172a,#1e293b); color:white; font-size:13px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; box-shadow:0 4px 14px rgba(15,23,42,.2); transition:all .2s; flex-shrink:0; }
        .dl-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(15,23,42,.28); }
        .dl-btn:disabled { opacity:.65; cursor:not-allowed; }
        .meal-card { border-radius:18px; border:1.5px solid; overflow:hidden; transition:box-shadow .2s; }
        .meal-card:hover { box-shadow:0 8px 30px rgba(0,0,0,.08); }
        .tag-chip { display:inline-flex; align-items:center; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; background:#dcfce7; color:#15803d; }
        .ing-item { display:flex; align-items:flex-start; gap:7px; padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:13px; color:#374151; }
        .step-item { display:flex; gap:10px; padding:8px 0; border-bottom:1px solid #f1f5f9; }
      `}</style>

      <main style={{ maxWidth:1240, margin:"0 auto", padding:"28px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(16,185,129,.3)" }}>
              <ChefHat size={20} color="white" />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>AI Meal Planner</h1>
              <p style={{ margin:0, fontSize:13, color:"#64748b" }}>Generate a personalized Indian meal plan tailored to your goals</p>
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20, alignItems:"start" }}>

          {/* ── Left Panel ── */}
          <div style={{ background:"white", borderRadius:20, border:"1px solid #f1f5f9", boxShadow:"0 1px 8px rgba(0,0,0,.04)", padding:22, position:"sticky", top:82 }}>
            <p style={{ margin:"0 0 18px", fontSize:12, fontWeight:800, color:"#10b981", textTransform:"uppercase", letterSpacing:".08em", display:"flex", alignItems:"center", gap:6 }}>
              <Leaf size={13} /> Preferences
            </p>

            {/* Calories */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>Daily Calories</label>
              <div style={{ position:"relative" }}>
                <Flame size={15} color="#f97316" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
                <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="mp-input" placeholder="e.g. 2000" />
                <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#94a3b8", fontWeight:600 }}>kcal</span>
              </div>
            </div>

            {/* Diet */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>Diet Type</label>
              <div style={{ position:"relative" }}>
                <select value={diet} onChange={e => setDiet(e.target.value)} className="mp-select">
                  <option value="vegetarian"> Vegetarian</option>
                  <option value="vegan"> Vegan</option>
                  <option value="jain">Jain</option>
                  <option value="high protein"> High Protein</option>
                  <option value="low carb"> Low Carb</option>
                  <option value=""> No Restrictions</option>
                </select>
                <ChevronDown size={14} color="#94a3b8" style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
              </div>
            </div>

            {/* Region */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>Region</label>
              <div style={{ position:"relative" }}>
                <MapPin size={14} color="#10b981" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
                <select value={region} onChange={e => setRegion(e.target.value)} className="mp-select" style={{ paddingLeft:34 }}>
                  <option value="">🇮🇳 Any Indian Region</option>
                  <option value="North Indian">North Indian</option>
                  <option value="South Indian"> South Indian</option>
                  <option value="Punjabi"> Punjabi</option>
                  <option value="Bengali"> Bengali</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Maharashtrian"> Maharashtrian</option>
                  <option value="Rajasthani"> Rajasthani</option>
                </select>
                <ChevronDown size={14} color="#94a3b8" style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
              </div>
            </div>

            {/* Exclude */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>Exclude Ingredients</label>
              <div style={{ position:"relative" }}>
                <Ban size={14} color="#ef4444" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
                <input type="text" value={exclude} onChange={e => setExclude(e.target.value)} className="mp-input" placeholder="e.g. onion, garlic" />
              </div>
            </div>

            <button className="gen-btn" onClick={fetchMeals} disabled={loading}>
              {loading
                ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Generating plan...</>
                : <><Sparkles size={15} /> Generate My Meal Plan</>
              }
            </button>

            {error && (
              <div style={{ marginTop:14, background:"#fff5f5", border:"1px solid #fecaca", borderRadius:12, padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start" }}>
                <AlertCircle size={15} color="#ef4444" style={{ flexShrink:0, marginTop:1 }} />
                <p style={{ margin:0, fontSize:12, color:"#dc2626" }}>{error}</p>
              </div>
            )}
          </div>

          {/* ── Right Panel ── */}
          <div>
            {!mealPlan && !loading && (
              <div style={{ background:"white", borderRadius:20, border:"2px dashed #e2e8f0", padding:"60px 20px", textAlign:"center" }}>
                <div style={{ width:64, height:64, borderRadius:20, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                  <ChefHat size={30} color="#10b981" />
                </div>
                <p style={{ margin:"0 0 6px", fontSize:17, fontWeight:800, color:"#0f172a" }}>Your Meal Plan Awaits</p>
                <p style={{ margin:0, fontSize:13, color:"#94a3b8", maxWidth:320, marginLeft:"auto", marginRight:"auto" }}>Set your preferences and click Generate to get a personalized Indian meal plan with full recipes.</p>
              </div>
            )}

            {loading && (
              <div style={{ background:"white", borderRadius:20, border:"1px solid #f1f5f9", padding:"60px 20px", textAlign:"center" }}>
                <Loader2 size={36} color="#10b981" style={{ animation:"spin 1s linear infinite", marginBottom:14 }} />
                <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#0f172a" }}>Crafting your meal plan...</p>
                <p style={{ margin:"6px 0 0", fontSize:12, color:"#94a3b8" }}>Our AI is selecting authentic Indian dishes for your goals</p>
              </div>
            )}

            {mealPlan && (
              <div>
                {/* Top bar: summary + download */}
                <div style={{ background:"white", borderRadius:18, border:"1px solid #f1f5f9", boxShadow:"0 1px 8px rgba(0,0,0,.04)", padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <p style={{ margin:0, fontSize:12, fontWeight:700, color:"#10b981", textTransform:"uppercase", letterSpacing:".07em" }}>✦ Your Daily Plan</p>
                    <p style={{ margin:"3px 0 0", fontSize:13, color:"#64748b" }}>
                      {mealPlan.meals?.length} meals · {mealPlan.totalCalories} kcal · {diet || "No restrictions"}{region ? ` · ${region}` : ""}
                    </p>
                  </div>
                  <button className="dl-btn" onClick={handleDownload} disabled={downloading}>
                    {downloading
                      ? <><Loader2 size={15} style={{ animation:"spin 1s linear infinite" }} /> Preparing PDF...</>
                      : <><Download size={15} /> Download PDF Recipe</>
                    }
                  </button>
                </div>

                {/* Macro summary */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
                  {[
                    { label:"Total Calories", value:mealPlan.totalCalories, unit:"kcal", color:"#10b981", bg:"#f0fdf4" },
                    { label:"Protein",        value:mealPlan.totalProtein,  unit:"g",    color:"#f97316", bg:"#fff7ed" },
                    { label:"Carbohydrates",  value:mealPlan.totalCarbs,    unit:"g",    color:"#8b5cf6", bg:"#faf5ff" },
                    { label:"Fat",            value:mealPlan.totalFat,      unit:"g",    color:"#3b82f6", bg:"#eff6ff" },
                  ].map(m => (
                    <div key={m.label} style={{ background:m.bg, borderRadius:14, padding:"14px 16px", textAlign:"center" }}>
                      <p style={{ margin:0, fontSize:22, fontWeight:800, color:m.color, lineHeight:1 }}>{m.value}</p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color:m.color, fontWeight:700 }}>{m.unit}</p>
                      <p style={{ margin:"3px 0 0", fontSize:11, color:"#64748b", fontWeight:600 }}>{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Meal cards */}
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {mealPlan.meals?.map((meal, idx) => {
                    const mc = mealColors[meal.type] || mealColors.Lunch;
                    const isExp = !!expanded[idx];
                    return (
                      <div key={idx} className="meal-card" style={{ background:mc.bg, borderColor:mc.border }}>
                        {/* Card header */}
                        <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={() => toggleExpand(idx)}>
                          {/* emoji */}
                          <div style={{ width:44, height:44, borderRadius:12, background:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
                            {mealEmojis[meal.type] || "🍽"}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                              <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:999, background:mc.badge, color:"white", textTransform:"uppercase", letterSpacing:".06em" }}>
                                {meal.type}
                              </span>
                              {meal.tags?.slice(0,2).map(t => (
                                <span key={t} className="tag-chip">{t}</span>
                              ))}
                            </div>
                            <p style={{ margin:0, fontSize:15, fontWeight:800, color:"#0f172a" }}>{meal.name}</p>
                            <p style={{ margin:"2px 0 0", fontSize:12, color:"#64748b" }}>
                              ⏱ {meal.prepTime}  ·  👤 {meal.servings} serving  ·  🔥 {meal.calories} kcal
                            </p>
                          </div>
                          {/* macros mini */}
                          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                            {[["P",meal.protein,"g"],["C",meal.carbs,"g"],["F",meal.fat,"g"]].map(([l,v,u]) => (
                              <div key={l} style={{ textAlign:"center", background:"white", borderRadius:10, padding:"6px 10px", boxShadow:"0 1px 4px rgba(0,0,0,.05)" }}>
                                <p style={{ margin:0, fontSize:13, fontWeight:800, color:mc.text }}>{v}{u}</p>
                                <p style={{ margin:0, fontSize:10, color:"#94a3b8", fontWeight:600 }}>{l}</p>
                              </div>
                            ))}
                          </div>
                          {/* expand toggle */}
                          <div style={{ width:28, height:28, borderRadius:8, background:"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
                            {isExp ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
                          </div>
                        </div>

                        {/* Expanded: ingredients + steps */}
                        {isExp && (
                          <div style={{ borderTop:`1.5px solid ${mc.border}`, padding:"16px 18px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                            {/* Ingredients */}
                            <div>
                              <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:800, color:mc.text, textTransform:"uppercase", letterSpacing:".07em" }}>🥘 Ingredients</p>
                              {meal.ingredients?.map((ing, i) => (
                                <div key={i} className="ing-item">
                                  <CheckCircle2 size={13} color={mc.badge} style={{ flexShrink:0, marginTop:1 }} />
                                  <span>{ing}</span>
                                </div>
                              ))}
                            </div>
                            {/* Steps */}
                            <div>
                              <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:800, color:mc.text, textTransform:"uppercase", letterSpacing:".07em" }}>👨‍🍳 Preparation</p>
                              {meal.steps?.map((step, i) => (
                                <div key={i} className="step-item">
                                  <div style={{ width:20, height:20, borderRadius:"50%", background:mc.badge, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                                    <span style={{ fontSize:10, fontWeight:800, color:"white" }}>{i+1}</span>
                                  </div>
                                  <p style={{ margin:0, fontSize:13, color:"#374151", lineHeight:1.5 }}>{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom download CTA */}
                <div style={{ marginTop:20, background:"linear-gradient(135deg,#0f172a,#1e293b)", borderRadius:18, padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                  <div>
                    <p style={{ margin:0, fontSize:15, fontWeight:800, color:"white" }}>Save this meal plan as PDF</p>
                    <p style={{ margin:"3px 0 0", fontSize:12, color:"#94a3b8" }}>Includes all recipes, ingredients & step-by-step instructions</p>
                  </div>
                  <button className="dl-btn" style={{ background:"linear-gradient(135deg,#10b981,#059669)", boxShadow:"0 4px 14px rgba(16,185,129,.35)" }} onClick={handleDownload} disabled={downloading}>
                    {downloading
                      ? <><Loader2 size={15} style={{ animation:"spin 1s linear infinite" }} /> Preparing...</>
                      : <><Download size={15} /> Download Full Recipe PDF</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

export default MealPlanner;