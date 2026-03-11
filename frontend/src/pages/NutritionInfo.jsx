import React, { useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isSameDay, parseISO } from "date-fns";
import { 
  Utensils, Droplet, Wheat, Activity, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight 
} from "lucide-react";

// Custom Date Input Component
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

const NutritionInfo = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default: Today
  const navigate = useNavigate();

  // Fetch Foods & Filter by Date
  useEffect(() => {
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
        // Only show foods created on the selected date
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
    fetchFoods();
  }, [navigate, selectedDate]); // Re-run when selectedDate changes

  // Helper to change day
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-green-600 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100 p-6 md:p-10 transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header with Date Picker */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Nutritional Breakdown</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed macro and micronutrient analysis.</p>
          </div>

          {/* Date Controls */}
          <div className="flex items-center gap-3">
             <button onClick={() => changeDate(-1)} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:border-green-500 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative z-20">
              <DatePicker 
                selected={selectedDate} 
                onChange={(date) => setSelectedDate(date)} 
                dateFormat="MMMM d, yyyy"
                customInput={<CustomDateInput />}
                maxDate={new Date()} 
              />
            </div>

            <button 
              onClick={() => changeDate(1)} 
              disabled={isSameDay(selectedDate, new Date())} 
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.length > 0 ? (
             foods.map((food, index) => (
                <div 
                  key={food._id || index} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition duration-200 flex flex-col"
                >
                  
                  {/* Card Header: Name & Calories */}
                  <div className="p-5 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800 capitalize truncate max-w-[150px]" title={food.foodName}>
                        {food.foodName}
                      </h3>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
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
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                            <Activity className="w-4 h-4 text-green-500" /> Protein
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">{food.nutritionInfo.protein_g}g</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${Math.min(food.nutritionInfo.protein_g * 5, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Fats */}
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                            <Droplet className="w-4 h-4 text-blue-500" /> Total Fat
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">{food.nutritionInfo.fat_total_g}g</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${Math.min(food.nutritionInfo.fat_total_g * 5, 100)}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                          <span>Sat. Fat: {food.nutritionInfo.fat_saturated_g}g</span>
                      </div>
                    </div>

                    {/* Carbs */}
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
                            <Wheat className="w-4 h-4 text-yellow-500" /> Carbs
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">{food.nutritionInfo.carbohydrates_total_g}g</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-yellow-400 rounded-full" 
                            style={{ width: `${Math.min(food.nutritionInfo.carbohydrates_total_g * 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>

                  {/* Footer: Micronutrients Grid */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 grid grid-cols-3 gap-2 text-center border-t border-gray-100 dark:border-gray-600">
                     <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold">Sugar</p>
                        <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">{food.nutritionInfo.sugar_g}g</p>
                     </div>
                     <div className="border-x border-gray-200 dark:border-gray-600">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold">Fiber</p>
                        <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">{food.nutritionInfo.fiber_g}g</p>
                     </div>
                     <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold">Cholest.</p>
                        <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">{food.nutritionInfo.cholesterol_mg}mg</p>
                     </div>
                  </div>

                </div>
              ))
          ) : (
            // Empty State (for specific day)
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full inline-block mb-4">
                    <Utensils className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-lg">No meals logged for {format(selectedDate, "MMM do")}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try selecting a different date or log a new meal.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NutritionInfo;