import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ChefHat, Flame, Ban, Leaf, ArrowRight, 
  Utensils, Clock, Loader2, AlertCircle 
} from "lucide-react";

const MealPlanner = () => {
  const navigate = useNavigate();
  
  // State Management
  const [calories, setCalories] = useState(2000);
  const [diet, setDiet] = useState("vegetarian");
  const [exclude, setExclude] = useState("");
  const [mealPlan, setMealPlan] = useState(null); // Stores the full response (including nutrients)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch User Profile on Mount
  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // Optional: Redirect to login if critical

      try {
        const response = await axios.get("http://localhost:1001/api/profile/getProfile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.profile?.calorieRequirement) {
          // Round to nearest whole number for cleaner UI
          setCalories(Math.round(response.data.profile.calorieRequirement));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    getProfile();
  }, []);

  // Generate Meal Plan
  const fetchMeals = async () => {
    if (!calories) {
      alert("Please enter your calorie requirement.");
      return;
    }

    setLoading(true);
    setError("");
    setMealPlan(null);

    try {
      const apiKey = "4cf222953f524b2abe298a6ab73b281b"; // YOUR KEY
      const url = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${calories}&diet=${diet}&exclude=${exclude}`;

      const response = await axios.get(url);
      setMealPlan(response.data); // Save full data (meals + nutrients)
    } catch (err) {
      console.error("Error generating meals:", err);
      setError("Failed to generate meal plan. Please check your inputs or API limit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-6 md:p-10">
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-3">
            <ChefHat className="w-8 h-8 text-green-600" />
            AI Meal Generator
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Customize your preferences below and let our AI craft the perfect daily menu for your nutritional goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Generator Control Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" /> Preferences
              </h2>
              
              <div className="space-y-5">
                
                {/* Calories Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Daily Calories
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 focus:bg-white font-medium"
                      placeholder="e.g. 2000"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">kcal</span>
                    </div>
                  </div>
                </div>

                {/* Diet Type Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Diet Type
                  </label>
                  <div className="relative">
                     <select
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="glutenFree">Gluten Free</option>
                      <option value="ketogenic">Ketogenic</option>
                      <option value="paleo">Paleo</option>
                      <option value="dairyFree">Dairy Free</option>
                      <option value="">No Restrictions</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                       <ArrowRight className="h-4 w-4 text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Exclude Ingredients */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Exclude Ingredients
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Ban className="h-4 w-4 text-red-400" />
                    </div>
                    <input
                      type="text"
                      value={exclude}
                      onChange={(e) => setExclude(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-gray-50 focus:bg-white placeholder-gray-400"
                      placeholder="e.g. peanuts, shellfish"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={fetchMeals}
                  disabled={loading}
                  className="w-full mt-4 bg-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 hover:shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      Generate Menu <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results Display */}
          <div className="lg:col-span-8">
            
            {mealPlan && mealPlan.meals ? (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Summary Stats (If API returns 'nutrients' object) */}
                {mealPlan.nutrients && (
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap justify-between items-center px-4 md:px-8 gap-4">
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold">Calories</p>
                            <p className="text-xl md:text-2xl font-bold text-green-600">{Math.round(mealPlan.nutrients.calories)}</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold">Protein</p>
                            <p className="text-lg md:text-xl font-bold text-gray-800">{Math.round(mealPlan.nutrients.protein)}g</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold">Carbs</p>
                            <p className="text-lg md:text-xl font-bold text-gray-800">{Math.round(mealPlan.nutrients.carbohydrates)}g</p>
                        </div>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <div className="text-center flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold">Fat</p>
                            <p className="text-lg md:text-xl font-bold text-gray-800">{Math.round(mealPlan.nutrients.fat)}g</p>
                        </div>
                    </div>
                )}

                {/* Meal Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mealPlan.meals.map((meal) => (
                    <div key={meal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group flex flex-col">
                      {/* Image Placeholder */}
                      <div className="h-32 bg-gray-50 flex items-center justify-center text-gray-300 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                         <Utensils className="w-10 h-10 group-hover:scale-110 transition duration-300 text-gray-400" />
                         
                         {/* Optional: Add actual image if available from API */}
                         {/* <img src={`https://spoonacular.com/recipeImages/${meal.id}-556x370.jpg`} alt={meal.title} className="absolute inset-0 w-full h-full object-cover" /> */}
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-3 leading-tight">{meal.title}</h3>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto mb-4">
                           <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3" /> {meal.readyInMinutes} min
                           </span>
                           <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                              <Utensils className="w-3 h-3" /> {meal.servings} serv
                           </span>
                        </div>
                        
                        <a 
                          href={meal.sourceUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="mt-auto block w-full text-center py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition border border-green-100"
                        >
                          View Recipe
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              // Empty State (Initial Load)
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 border-dashed text-center p-8">
                 {!loading && (
                    <>
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <ChefHat className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Your Menu Awaits</h3>
                        <p className="text-gray-500 max-w-sm mt-2">
                            Enter your preferences on the left and hit "Generate Menu" to create your personalized daily meal plan.
                        </p>
                    </>
                 )}
                 {loading && (
                     <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Curating your menu...</p>
                     </div>
                 )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default MealPlanner;