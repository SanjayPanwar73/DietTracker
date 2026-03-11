import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, subDays, parseISO } from "date-fns";
import { Bar } from "react-chartjs-2";
import { Calendar, TrendingUp, CheckCircle, AlertCircle, Filter } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  
  // NEW: State for Time Range Toggle ('week' or 'month')
  const [timeRange, setTimeRange] = useState("week");

  // Helper: Group raw food logs by Date (YYYY-MM-DD)
  const processHistoryData = (foods) => {
    const grouped = {};
    
    foods.forEach(food => {
      const dateKey = format(parseISO(food.createdAt), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = { calories: 0, items: 0 };
      }
      grouped[dateKey].calories += food.nutritionInfo.calories;
      grouped[dateKey].items += 1;
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const profileRes = await axios.get("/api/profile/getProfile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.data.profile) {
            setCalorieGoal(profileRes.data.profile.calorieRequirement);
        }

        const foodRes = await axios.get("/api/food/allFood", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const processed = processHistoryData(foodRes.data.foods);
        setHistoryData(processed);

      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- DYNAMIC CHART DATA ---
  const daysToShow = timeRange === "week" ? 7 : 30;

  // Generate labels for the last X days (reverse order for chart: Oldest -> Newest)
  const chartLabelsDates = Array.from({ length: daysToShow }).map((_, i) => {
    const d = subDays(new Date(), (daysToShow - 1) - i); 
    return format(d, "yyyy-MM-dd");
  });

  const chartData = {
    labels: chartLabelsDates.map(d => format(parseISO(d), timeRange === "week" ? "EEE" : "MMM d")),
    datasets: [
      {
        label: "Calories",
        data: chartLabelsDates.map(date => {
            const dayLog = historyData.find(h => h.date === date);
            return dayLog ? dayLog.calories : 0;
        }),
        backgroundColor: (context) => {
            const value = context.raw;
            // Red if over goal, Green if under
            return value > calorieGoal ? "rgba(239, 68, 68, 0.8)" : "rgba(16, 185, 129, 0.8)";
        },
        borderRadius: 4,
        hoverBackgroundColor: (context) => {
            const value = context.raw;
            return value > calorieGoal ? "rgba(239, 68, 68, 1)" : "rgba(16, 185, 129, 1)";
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false },
        tooltip: {
            backgroundColor: '#1F2937',
            padding: 12,
            titleFont: { size: 13 },
            bodyFont: { size: 13 },
            callbacks: {
                label: (context) => `${context.raw} kcal`
            }
        }
    },
    scales: {
        x: { 
            grid: { display: false },
            ticks: { 
                maxTicksLimit: timeRange === "week" ? 7 : 10, // Show fewer labels on monthly view
                font: { size: 11 }
            }
        },
        y: { 
            grid: { borderDash: [5, 5], color: '#F3F4F6' }, 
            beginAtZero: true,
            suggestedMax: calorieGoal + 500
        }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-green-600" /> Past History
                </h1>
                <p className="text-gray-500 mt-1">Review your consistency and calorie trends over time.</p>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 flex shadow-sm">
                <button 
                    onClick={() => setTimeRange("week")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        timeRange === "week" 
                        ? "bg-green-50 text-green-700 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Last 7 Days
                </button>
                <button 
                    onClick={() => setTimeRange("month")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        timeRange === "month" 
                        ? "bg-green-50 text-green-700 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Last 30 Days
                </button>
            </div>
        </div>

        {/* TREND CHART CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" /> 
                    {timeRange === "week" ? "Weekly Overview" : "Monthly Overview"}
                </h2>
                {/* Dynamic Goal Line Legend */}
                <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1 text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Under Goal
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Over Goal
                    </span>
                </div>
            </div>
            <div className="h-72">
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>

        {/* LOG ARCHIVE LIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Log Archive</h3>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">All Time</span>
            </div>

            {historyData.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {historyData.map((day) => {
                        const isGoalMet = day.calories <= calorieGoal;
                        return (
                            <div key={day.date} className="p-5 flex items-center justify-between hover:bg-gray-50 transition group cursor-default">
                                
                                {/* Date Info */}
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl text-center min-w-[60px] ${isGoalMet ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <span className={`block text-xs font-bold uppercase ${isGoalMet ? 'text-green-600' : 'text-red-500'}`}>{format(parseISO(day.date), "MMM")}</span>
                                        <span className={`block text-xl font-bold ${isGoalMet ? 'text-green-800' : 'text-red-700'}`}>{format(parseISO(day.date), "dd")}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{format(parseISO(day.date), "EEEE")}</p>
                                        <p className="text-sm text-gray-500">{day.items} items logged</p>
                                    </div>
                                </div>

                                {/* Stats & Status */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className={`block font-bold text-lg ${isGoalMet ? 'text-gray-800' : 'text-red-600'}`}>
                                            {Math.round(day.calories)}
                                        </span>
                                        <span className="text-xs text-gray-400 uppercase">/ {Math.round(calorieGoal)} kcal</span>
                                    </div>
                                    
                                    <div className={`p-2 rounded-full ${isGoalMet ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {isGoalMet ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-16 text-center">
                    <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                        <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium">No history found</h3>
                    <p className="text-gray-500 text-sm mt-1">Start logging your meals to see your progress here.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default History;