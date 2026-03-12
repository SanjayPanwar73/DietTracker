import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChefHat, Flame, Ban, Leaf, ArrowRight, Utensils,
  Clock, Loader2, AlertCircle, Sparkles, ChevronDown,
  ChevronUp, Users, Beef, Wheat, Droplets, MapPin
} from "lucide-react";

// ── tag badge ────────────────────────────────────────────────────
const Tag = ({ label }) => {
  const colors = {
    "High Protein": "bg-red-100 text-red-700",
    "Protein Rich": "bg-red-100 text-red-700",
    "High Fiber":   "bg-green-100 text-green-700",
    "Vegetarian":   "bg-emerald-100 text-emerald-700",
    "Vegan":        "bg-teal-100 text-teal-700",
    "Quick":        "bg-blue-100 text-blue-700",
    "Low Fat":      "bg-purple-100 text-purple-700",
    "Balanced":     "bg-yellow-100 text-yellow-700",
    "Traditional":  "bg-orange-100 text-orange-700",
    "Iron Rich":    "bg-amber-100 text-amber-700",
    "Calcium":      "bg-sky-100 text-sky-700",
  };
  const cls = colors[label] || "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
};

// ── meal type icon/color ─────────────────────────────────────────
const mealMeta = {
  Breakfast: { emoji: "🌅", color: "bg-orange-50 border-orange-200", badge: "bg-orange-500" },
  Lunch:     { emoji: "☀️",  color: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-500" },
  Snack:     { emoji: "🍵",  color: "bg-pink-50 border-pink-200",   badge: "bg-pink-500"   },
  Dinner:    { emoji: "🌙", color: "bg-indigo-50 border-indigo-200", badge: "bg-indigo-500" },
};

// ── single meal card ─────────────────────────────────────────────
const MealCard = ({ meal }) => {
  const [open, setOpen] = useState(false);
  const meta = mealMeta[meal.type] || mealMeta.Lunch;

  return (
    <div className={`rounded-2xl border ${meta.color} overflow-hidden shadow-sm`}>
      {/* header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{meta.emoji}</span>
            <div>
              <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${meta.badge} uppercase tracking-wide`}>
                {meal.type}
              </span>
              <h3 className="font-bold text-gray-900 mt-1 leading-tight">{meal.name}</h3>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-gray-900">{meal.calories}</p>
            <p className="text-xs text-gray-400">kcal</p>
          </div>
        </div>

        {/* macros row */}
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Beef className="w-3 h-3 text-red-400" />{meal.protein}g protein
          </span>
          <span className="flex items-center gap-1">
            <Wheat className="w-3 h-3 text-yellow-400" />{meal.carbs}g carbs
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" />{meal.fat}g fat
          </span>
        </div>

        {/* meta row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2 flex-wrap">
            {meal.tags?.map((tag) => <Tag key={tag} label={tag} />)}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0 ml-2">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meal.prepTime}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{meal.servings} serving</span>
          </div>
        </div>
      </div>

      {/* expand toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-1 py-2.5 text-xs font-semibold text-gray-500 bg-white/60 hover:bg-white transition border-t border-current border-opacity-10"
      >
        {open ? <><ChevronUp className="w-4 h-4" /> Hide Recipe</> : <><ChevronDown className="w-4 h-4" /> View Recipe</>}
      </button>

      {/* recipe details */}
      {open && (
        <div className="bg-white px-5 pb-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ingredients</p>
            <ul className="space-y-1">
              {meal.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">•</span>{ing}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Steps</p>
            <ol className="space-y-2">
              {meal.steps?.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

const DIETS = [
  { value: "no restrictions", label: "No Restrictions", emoji: "🍽️" },
  { value: "vegetarian",      label: "Vegetarian",      emoji: "🥦" },
  { value: "vegan",           label: "Vegan",           emoji: "🌱" },
  { value: "jain",            label: "Jain",            emoji: "🙏" },
  { value: "high protein",    label: "High Protein",    emoji: "💪" },
  { value: "low carb",        label: "Low Carb",        emoji: "📉" },
];

const REGIONS = [
  "Any Region", "North Indian", "South Indian", "West Indian",
  "East Indian", "Punjabi", "Bengali", "Gujarati", "Maharashtrian",
  "Kerala", "Rajasthani",
];

const MealPlanner = () => {
  const navigate = useNavigate();
  const [calories, setCalories]   = useState(2000);
  const [diet, setDiet]           = useState("no restrictions");
  const [exclude, setExclude]     = useState("");
  const [region, setRegion]       = useState("Any Region");
  const [mealPlan, setMealPlan]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:1001/api/profile/getProfile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.profile?.calorieRequirement) {
          setCalories(Math.round(res.data.profile.calorieRequirement));
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const generate = async () => {
    if (!calories) { setError("Please enter your calorie target."); return; }
    setLoading(true);
    setError("");
    setMealPlan(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:1001/api/mealplan/generate",
        { calories, diet, exclude, region },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMealPlan(res.data);
    } catch (e) {
      console.error(e);
      setError("Failed to generate meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Powered by Gemini AI
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <ChefHat className="w-8 h-8 text-green-600" /> Indian Meal Planner
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            Get a personalised Indian meal plan with recipes, macros, and ingredients — generated by AI, tailored to your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: controls */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" /> Your Preferences
              </h2>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Daily Calories</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="block w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 focus:bg-white font-medium"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">kcal</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Diet Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {DIETS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDiet(d.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition ${
                        diet === d.value
                          ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-100"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400"
                      }`}
                    >
                      <span>{d.emoji}</span>{d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 bg-gray-50 focus:bg-white"
                >
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Exclude Ingredients</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Ban className="h-4 w-4 text-red-400" />
                  </div>
                  <input
                    type="text"
                    value={exclude}
                    onChange={(e) => setExclude(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 bg-gray-50 focus:bg-white placeholder-gray-400"
                    placeholder="e.g. onion, garlic, dairy"
                  />
                </div>
              </div>

              <button
                onClick={generate}
                disabled={loading}
                className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                  : <><Sparkles className="w-5 h-5" /> Generate Meal Plan</>
                }
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0" />{error}
              </div>
            )}
          </div>

          {/* RIGHT: results */}
          <div className="lg:col-span-8">
            {loading && (
              <div className="min-h-[400px] bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                <p className="text-gray-500 font-medium">Crafting your Indian meal plan...</p>
                <p className="text-gray-400 text-sm">Gemini is selecting authentic dishes for you</p>
              </div>
            )}

            {!loading && !mealPlan && (
              <div className="min-h-[400px] bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-center p-8">
                <div className="text-5xl">🍛</div>
                <h3 className="text-lg font-bold text-gray-900">Your meal plan will appear here</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  Set your preferences and hit Generate — Gemini will create a full day of authentic Indian meals with recipes.
                </p>
              </div>
            )}

            {mealPlan && !loading && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-4 gap-4 text-center">
                  {[
                    { label: "Calories", value: Math.round(mealPlan.totalCalories), unit: "kcal", color: "text-orange-600" },
                    { label: "Protein",  value: Math.round(mealPlan.totalProtein),  unit: "g",    color: "text-red-600"    },
                    { label: "Carbs",    value: Math.round(mealPlan.totalCarbs),    unit: "g",    color: "text-yellow-600" },
                    { label: "Fat",      value: Math.round(mealPlan.totalFat),      unit: "g",    color: "text-blue-600"   },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}<span className="text-sm font-normal text-gray-400 ml-0.5">{s.unit}</span></p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {mealPlan.meals?.map((meal, i) => (
                  <MealCard key={i} meal={meal} />
                ))}

                <button
                  onClick={generate}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-medium hover:border-green-400 hover:text-green-600 transition"
                >
                  <Sparkles className="w-4 h-4" /> Generate Different Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;