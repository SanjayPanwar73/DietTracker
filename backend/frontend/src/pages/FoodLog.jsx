import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Utensils, Flame, Coffee, Sun, Moon, Zap } from "lucide-react";

const FoodLog = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Foods
  const fetchFoods = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:1001/api/food/allFood",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFoods(response.data.foods);
    } catch (error) {
      console.error("Error fetching foods:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [navigate]);

  // Delete Food
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

  // Calculate Total (Using reduce for cleaner code)
  const totalCalories = foods.reduce((total, food) => total + food.nutritionInfo.calories, 0);

  // Helper for Meal Icons/Colors
  const getMealStyle = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("breakfast")) return { icon: <Coffee className="w-4 h-4" />, bg: "bg-orange-100 text-orange-700" };
    if (lowerType.includes("lunch")) return { icon: <Sun className="w-4 h-4" />, bg: "bg-yellow-100 text-yellow-700" };
    if (lowerType.includes("dinner")) return { icon: <Moon className="w-4 h-4" />, bg: "bg-indigo-100 text-indigo-700" };
    if (lowerType.includes("snack")) return { icon: <Zap className="w-4 h-4" />, bg: "bg-pink-100 text-pink-700" };
    return { icon: <Utensils className="w-4 h-4" />, bg: "bg-gray-100 text-gray-700" };
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
          
          <button
            onClick={() => navigate("/add-food")}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition transform active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Log
          </button>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    <Flame className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Calories Consumed</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(totalCalories)} <span className="text-sm font-normal text-gray-400">kcal</span></p>
                </div>
            </div>
            {/* Optional: Add a progress bar here if you have a target */}
        </div>

        {/* FOOD LIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                // Empty State
                <div className="p-12 text-center flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Utensils className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No meals logged yet</h3>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Start tracking your nutrition by adding your first meal of the day.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default FoodLog;