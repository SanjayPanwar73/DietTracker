import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Utensils, Droplet, Wheat, Activity, Info } from "lucide-react";

const NutritionInfo = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Foods
  useEffect(() => {
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
    fetchFoods();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-6 md:p-10">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nutritional Breakdown</h1>
          <p className="text-gray-500 mt-1">Detailed macro and micronutrient analysis of your meals.</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food, index) => (
            <div 
              key={food._id || index} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-200 flex flex-col"
            >
              
              {/* Card Header: Name & Calories */}
              <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-gray-800 capitalize truncate max-w-[150px]" title={food.foodName}>
                    {food.foodName}
                  </h3>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-white border border-gray-200 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {food.mealType || "Meal"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-green-600">
                    {Math.round(food.nutritionInfo.calories)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium uppercase">Kcal</span>
                </div>
              </div>

              {/* Body: Macronutrient Bars */}
              <div className="p-5 space-y-5 flex-1">
                
                {/* Protein */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                        <Activity className="w-4 h-4 text-green-500" /> Protein
                    </span>
                    <span className="font-bold text-gray-900">{food.nutritionInfo.protein_g}g</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    {/* Visual Width Calculation: Multiplied by 5 just for visual effect, capped at 100% */}
                    <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${Math.min(food.nutritionInfo.protein_g * 5, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fats */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                        <Droplet className="w-4 h-4 text-blue-500" /> Total Fat
                    </span>
                    <span className="font-bold text-gray-900">{food.nutritionInfo.fat_total_g}g</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min(food.nutritionInfo.fat_total_g * 5, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                      <span>Sat. Fat: {food.nutritionInfo.fat_saturated_g}g</span>
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                        <Wheat className="w-4 h-4 text-yellow-500" /> Carbs
                    </span>
                    <span className="font-bold text-gray-900">{food.nutritionInfo.carbohydrates_total_g}g</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${Math.min(food.nutritionInfo.carbohydrates_total_g * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Footer: Micronutrients Grid */}
              <div className="bg-gray-50 p-4 grid grid-cols-3 gap-2 text-center border-t border-gray-100">
                 <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Sugar</p>
                    <p className="font-bold text-gray-700 text-sm">{food.nutritionInfo.sugar_g}g</p>
                 </div>
                 <div className="border-x border-gray-200">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Fiber</p>
                    <p className="font-bold text-gray-700 text-sm">{food.nutritionInfo.fiber_g}g</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Cholest.</p>
                    <p className="font-bold text-gray-700 text-sm">{food.nutritionInfo.cholesterol_mg}mg</p>
                 </div>
              </div>

            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {!loading && foods.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed mt-8">
                <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                    <Utensils className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg">No meals logged yet</h3>
                <p className="text-gray-500 text-sm mt-1">Log your food to see a detailed nutritional breakdown here.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default NutritionInfo;