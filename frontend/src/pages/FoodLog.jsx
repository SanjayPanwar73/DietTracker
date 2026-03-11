import React, { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isSameDay, parseISO } from "date-fns";
import { 
  Plus, Trash2, Utensils, Flame, Coffee, Sun, Moon, Zap, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Camera // <--- Added Camera
} from "lucide-react";

// --- CUSTOM DATE INPUT COMPONENT ---
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:border-green-500 hover:text-green-600 transition"
  >
    <CalendarIcon className="w-4 h-4 text-green-600" />
    {value}
  </button>
));

const FoodLog = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  const fetchFoods = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:1001/api/food/allFood",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const allFoods = response.data.foods;
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

  useEffect(() => {
    fetchFoods();
  }, [selectedDate, navigate]);

  const deleteFood = async (id) => {
    const token = localStorage.getItem("token");
    if(!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      await axios.delete(`http://localhost:1001/api/food/deleteFood/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoods((prevFoods) => prevFoods.filter((food) => food._id !== id));
    } catch (error) {
      console.error("Error deleting food:", error);
    }
  };

  const totalCalories = foods.reduce((total, food) => total + food.nutritionInfo.calories, 0);

  const getMealStyle = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("breakfast")) return { icon: <Coffee className="w-4 h-4" />, bg: "bg-orange-100 text-orange-700" };
    if (lowerType.includes("lunch")) return { icon: <Sun className="w-4 h-4" />, bg: "bg-yellow-100 text-yellow-700" };
    if (lowerType.includes("dinner")) return { icon: <Moon className="w-4 h-4" />, bg: "bg-indigo-100 text-indigo-700" };
    if (lowerType.includes("snack")) return { icon: <Zap className="w-4 h-4" />, bg: "bg-pink-100 text-pink-700" };
    return { icon: <Utensils className="w-4 h-4" />, bg: "bg-gray-100 text-gray-700" };
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-6 md:p-10">
      
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Food Log</h1>
            <p className="text-gray-500 mt-1">Track your daily meals and nutritional intake.</p>
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
                maxDate={new Date()}
              />
            </div>

            {/* Next Day Button */}
            <button 
              onClick={() => changeDate(1)} 
              disabled={isSameDay(selectedDate, new Date())} 
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Buttons — only show if viewing Today */}
            {isSameDay(selectedDate, new Date()) && (
              <>
                {/* AI Photo Log Button */}  {/* <--- ADDED */}
                <button
                  onClick={() => navigate("/photo-log")}
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-100 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span className="hidden sm:inline">Photo</span>
                </button>

                {/* Manual Add Button */}
                <button
                  onClick={() => navigate("/add-food")}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition transform active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    <Flame className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">
                        Calories for <span className="text-green-600 font-bold">{format(selectedDate, "MMM d")}</span>
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(totalCalories)} <span className="text-sm font-normal text-gray-400">kcal</span></p>
                </div>
            </div>
        </div>

        {/* FOOD LIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
            {foods.length > 0 ? (
                <div className="divide-y divide-gray-50">
                    {foods.map((food) => {
                        const mealStyle = getMealStyle(food.mealType);
                        return (
                            <div key={food._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition group">
                                
                                {/* Left: Meal Info */}
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-lg ${mealStyle.bg}`}>
                                        {mealStyle.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg capitalize">
                                            {food.foodName}
                                            {food.quantity > 1 && <span className="text-sm font-normal text-gray-500 ml-2">x{food.quantity}</span>}
                                        </h3>
                                        <p className="text-sm text-gray-400 capitalize">{food.mealType}</p>
                                    </div>
                                </div>

                                {/* Right: Calories & Action */}
                                <div className="flex items-center gap-6">
                                    <span className="font-semibold text-gray-700 whitespace-nowrap">
                                        {Math.round(food.nutritionInfo.calories)} <span className="text-xs text-gray-400 font-normal">kcal</span>
                                    </span>
                                    
                                    <button 
                                        onClick={() => deleteFood(food._id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
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
                <div className="p-12 text-center flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Utensils className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No logs for this day</h3>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">
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
