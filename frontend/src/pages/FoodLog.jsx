import React, { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isSameDay, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Utensils, Flame, Coffee, Sun, Moon, Zap, Heart,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight
} from "lucide-react";

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:border-green-500 hover:text-green-600 transition"
  >
    <CalendarIcon className="w-4 h-4 text-green-600" />
    {value}
  </button>
));

const FoodLog = () => {
  const [foods, setFoods] = useState([]); // Stores ONLY the selected day's foods
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to Today
  const navigate = useNavigate();

  // Fetch Foods & Filter by Date
  const fetchFoods = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "/api/food/allFood",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const allFoods = response.data.foods;

      // --- FILTER LOGIC ---
      // Keep only foods where createdAt matches selectedDate
      const filteredFoods = allFoods.filter(food => 
        isSameDay(parseISO(food.createdAt), selectedDate)
      );

      setFoods(filteredFoods);

    } catch (error) {
      console.error("Error fetching foods:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the selectedDate changes
  useEffect(() => {
    fetchFoods();
  }, [selectedDate, navigate]);

  // Delete Food
  const deleteFood = async (id) => {
    const token = localStorage.getItem("token");
    if(!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      await axios.delete(`/api/food/deleteFood/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove item from UI immediately
      setFoods((prevFoods) => prevFoods.filter((food) => food._id !== id));
    } catch (error) {
      console.error("Error deleting food:", error);
    }
  };

  // Calculate Total for the specific day
  const totalCalories = foods.reduce((total, food) => total + food.nutritionInfo.calories, 0);

  // Helper for Meal Icons/Colors
  const getMealStyle = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("breakfast")) return { icon: <Coffee className="w-4 h-4" />, bg: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" };
    if (lowerType.includes("lunch")) return { icon: <Sun className="w-4 h-4" />, bg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" };
    if (lowerType.includes("dinner")) return { icon: <Moon className="w-4 h-4" />, bg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" };
    if (lowerType.includes("snack")) return { icon: <Zap className="w-4 h-4" />, bg: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400" };
    return { icon: <Utensils className="w-4 h-4" />, bg: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" };
  };

  // Helper for Health Score color
  const getHealthScoreStyle = (score) => {
    if (!score) return { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-800 dark:text-gray-300" };
    if (score >= 8) return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" };
    if (score >= 5) return { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" };
    return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" };
  };

  // Helper to change day by +/- 1
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your meals...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100 p-6 md:p-10 transition-colors duration-300">
      
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Food Log</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your daily meals and nutritional intake.</p>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Previous Day Button */}
             <button onClick={() => changeDate(-1)} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-500 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Date Picker Input */}
            <div className="relative z-20">
              <DatePicker 
                selected={selectedDate} 
                onChange={(date) => setSelectedDate(date)} 
                dateFormat="MMMM d, yyyy"
                customInput={<CustomDateInput />}
                maxDate={new Date()} // Prevent future dates
              />
            </div>

            {/* Next Day Button */}
            <button 
              onClick={() => changeDate(1)} 
              disabled={isSameDay(selectedDate, new Date())} 
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Add Button (Only show if viewing Today) */}
            {isSameDay(selectedDate, new Date()) && (
                <button
                onClick={() => navigate("/add-food")}
                className="ml-2 flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition transform active:scale-95"
                >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
                </button>
            )}
          </div>
        </div>

        {/* SUMMARY CARD */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-lg shadow-green-200 mb-8 text-white"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Flame className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-green-100 font-medium">
                            Total Calories for <span className="font-bold text-white">{format(selectedDate, "MMM d")}</span>
                        </p>
                        <p className="text-4xl font-bold">{Math.round(totalCalories)} <span className="text-lg font-normal text-green-100">kcal</span></p>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-green-100 text-sm">{foods.length} meals logged</p>
                </div>
            </div>
        </motion.div>

        {/* FOOD LIST */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[300px] transition-colors duration-300">
            {foods.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {foods.map((food) => {
                        const mealStyle = getMealStyle(food.mealType);
                        const healthScoreStyle = getHealthScoreStyle(food.healthScore);
                        return (
                            <div key={food._id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                                
                                {/* Left: Meal Info */}
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-lg ${mealStyle.bg} dark:bg-opacity-30`}>
                                        {mealStyle.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg capitalize">
                                            {food.foodName}
                                            {food.quantity > 1 && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">x{food.quantity}</span>}
                                        </h3>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 capitalize">{food.mealType}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-sm text-gray-400 dark:text-gray-500 capitalize">{food.mealType}</p>
                                            {food.healthScore && (
                                                <>
                                                    <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                                                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${healthScoreStyle.bg} ${healthScoreStyle.text}`}>
                                                        <Heart className="w-3 h-3" />
                                                        <span>{food.healthScore}/10</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Calories & Action */}
                                <div className="flex items-center gap-6">
                                    <span className="font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                        {Math.round(food.nutritionInfo.calories)} <span className="text-xs text-gray-400 font-normal">kcal</span>
                                    </span>
                                    
                                    <button 
                                        onClick={() => deleteFood(food._id)}
                                        className="p-2 text-gray-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                        title="Delete entry"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Empty State
                <div className="p-12 text-center flex flex-col items-center">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full mb-4">
                        <Utensils className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-semibold">No logs for this day</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                        You haven't logged any meals for {format(selectedDate, "MMMM do")}.
                    </p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default FoodLog;