import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import { format, subDays, parseISO, isSameDay } from "date-fns";
import {
  TrendingUp, Brain, Flame, Beef, Wheat, Droplets,
  ArrowLeft, Loader2, Sparkles, ChevronRight,
  CheckCircle2, AlertCircle, Target, Calendar
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip,
  Legend, Filler,
} from "chart.js";
import { API_BASE_URL } from "../config/api";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
);

// ── small stat card ──────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color }) => (
  <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ── single AI insight card ───────────────────────────────────────
const InsightCard = ({ insight, index }) => {
  const colors = [
    "bg-green-50 border-green-200 text-green-800",
    "bg-blue-50 border-blue-200 text-blue-800",
    "bg-amber-50 border-amber-200 text-amber-800",
    "bg-purple-50 border-purple-200 text-purple-800",
    "bg-rose-50 border-rose-200 text-rose-800",
  ];
  const icons = ["🎯", "💡", "⚠️", "🔥", "📈"];
  return (
    <div className={`rounded-2xl border p-4 ${colors[index % colors.length]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{icons[index % icons.length]}</span>
        <p className="text-sm leading-relaxed font-medium">{insight}</p>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
const WeeklyInsights = () => {
  const [foods, setFoods]           = useState([]);
  const [profile, setProfile]       = useState(null);
  const [insights, setInsights]     = useState([]);
  const [loadingData, setLoadingData]       = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightError, setInsightError]     = useState("");
  const navigate = useNavigate();

  // ── last 7 days labels ──────────────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) =>
    subDays(new Date(), 6 - i)
  );

  // ── timezone-safe date key (YYYY-MM-DD in local time) ───────
  const toLocalDateKey = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  // ── group foods by date ─────────────────────────────────────
  const byDate = (date) =>
    foods.filter((f) => toLocalDateKey(f.createdAt) === toLocalDateKey(date));

  const dailyCalories   = last7.map((d) =>
    byDate(d).reduce((s, f) => s + f.nutritionInfo.calories, 0)
  );
  const dailyProtein    = last7.map((d) =>
    byDate(d).reduce((s, f) => s + f.nutritionInfo.protein_g, 0)
  );
  const dailyCarbs      = last7.map((d) =>
    byDate(d).reduce((s, f) => s + f.nutritionInfo.carbohydrates_total_g, 0)
  );
  const dailyFat        = last7.map((d) =>
    byDate(d).reduce((s, f) => s + f.nutritionInfo.fat_total_g, 0)
  );

  const goal            = profile?.calorieRequirement || 2000;
  const daysOnTrack     = dailyCalories.filter((c) => c > 0 && c <= goal).length;
  const daysLogged      = dailyCalories.filter((c) => c > 0).length;
  const avgCalories     = Math.round(dailyCalories.reduce((a, b) => a + b, 0) / Math.max(daysLogged, 1));
  const avgProtein      = Math.round(dailyProtein.reduce((a, b) => a + b, 0) / Math.max(daysLogged, 1));

  // ── fetch data ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const [pRes, fRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/profile/getProfile`,
            { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/food/allFood`,
            { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProfile(pRes.data.profile);
        setFoods(fRes.data.foods);
      } catch (e) {
        console.error(e);
        if (e.response?.status === 401) navigate("/login");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [navigate]);

  // ── generate AI insights ────────────────────────────────────
  const generateInsights = async () => {
    setLoadingInsights(true);
    setInsightError("");
    setInsights([]);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        goal: profile?.goal || "maintenance",
        calorieGoal: goal,
        dailyCalories,
        dailyProtein,
        dailyCarbs,
        dailyFat,
        avgCalories,
        daysLogged,
        daysOnTrack,
        avgProtein,
        days: last7.map((d) => format(d, "EEE")),
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/insights/weekly`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInsights(res.data.insights);
    } catch (e) {
      setInsightError("Failed to generate insights. Please try again.");
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  // ── chart configs ───────────────────────────────────────────
  const labels = last7.map((d) => format(d, "EEE"));

  const calLineData = {
    labels,
    datasets: [
      {
        label: "Calories",
        data: dailyCalories,
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.08)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: dailyCalories.map((c) =>
          c === 0 ? "#E5E7EB" : c > goal ? "#EF4444" : "#10B981"
        ),
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Goal",
        data: Array(7).fill(goal),
        borderColor: "#E5E7EB",
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const macroBarData = {
    labels,
    datasets: [
      { label: "Protein (g)", data: dailyProtein, backgroundColor: "#EF4444", borderRadius: 4 },
      { label: "Carbs (g)",   data: dailyCarbs,   backgroundColor: "#FBBF24", borderRadius: 4 },
      { label: "Fat (g)",     data: dailyFat,     backgroundColor: "#3B82F6", borderRadius: 4 },
    ],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#F3F4F6" }, beginAtZero: true },
    },
  };

  const macroOpts = {
    ...chartOpts,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { boxWidth: 10, padding: 16, font: { size: 11 } },
      },
    },
    scales: { ...chartOpts.scales, x: { grid: { display: false }, stacked: false } },
  };

  // ── loading state ───────────────────────────────────────────
  if (loadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current" />
    </div>
  );

  // ── render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/dashboard")}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" /> Weekly Insights
          </h1>
          <p className="text-xs text-gray-400">Last 7 days · AI-powered analysis</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />}
            label="Avg Calories" value={`${avgCalories}`}
            sub={`Goal: ${Math.round(goal)}`} color="bg-orange-50" />
          <StatCard icon={<Calendar className="w-5 h-5 text-blue-500" />}
            label="Days Logged" value={`${daysLogged}/7`}
            sub="this week" color="bg-blue-50" />
          <StatCard icon={<Target className="w-5 h-5 text-green-500" />}
            label="On-Track Days" value={`${daysOnTrack}`}
            sub="within calorie goal" color="bg-green-50" />
          <StatCard icon={<Beef className="w-5 h-5 text-red-500" />}
            label="Avg Protein" value={`${avgProtein}g`}
            sub="per logged day" color="bg-red-50" />
        </div>

        {/* calorie trend chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" /> Calorie Trend
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            Green = on track · Red = over goal · Gray = no data
          </p>
          <div className="h-56">
            <Line data={calLineData} options={chartOpts} />
          </div>
        </div>

        {/* macro breakdown chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-1">Macro Breakdown</h2>
          <p className="text-xs text-gray-400 mb-5">Daily protein, carbs & fat (grams)</p>
          <div className="h-56">
            <Bar data={macroBarData} options={macroOpts} />
          </div>
        </div>

        {/* AI insights section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" /> AI Weekly Analysis
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Personalised insights based on your 7-day data
              </p>
            </div>
            {insights.length === 0 && !loadingInsights && (
              <button onClick={generateInsights}
                className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-purple-200 hover:bg-purple-700 transition active:scale-95">
                <Sparkles className="w-4 h-4" /> Generate
              </button>
            )}
            {insights.length > 0 && (
              <button onClick={generateInsights}
                className="flex items-center gap-2 text-purple-600 border border-purple-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-50 transition">
                <Sparkles className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
          </div>

          <div className="p-6">
            {/* loading */}
            {loadingInsights && (
              <div className="flex flex-col items-center py-10 gap-4">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-gray-500 text-sm">Analyzing your week...</p>
              </div>
            )}

            {/* error */}
            {insightError && !loadingInsights && (
              <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm border border-red-100">
                {insightError}
              </div>
            )}

            {/* empty state */}
            {!loadingInsights && !insightError && insights.length === 0 && (
              <div className="flex flex-col items-center py-10 text-center gap-3">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <Brain className="w-8 h-8 text-purple-300" />
                </div>
                <p className="text-gray-500 text-sm max-w-xs">
                  Click <span className="font-semibold text-purple-600">Generate</span> to get personalised AI insights on your week — patterns, tips, and recommendations.
                </p>
              </div>
            )}

            {/* insights list */}
            {insights.length > 0 && !loadingInsights && (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WeeklyInsights;
