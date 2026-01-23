import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";

const MealPlannerHome = () => {
  const navigate = useNavigate();

  // Authentication Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      
      {/* COMPACT HERO SECTION */}
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center max-w-4xl mx-auto">
        
        {/* Decorative Icon (Smaller) */}
        <div className="bg-green-100 p-3 rounded-full mb-6 animate-fade-in-up">
            <ChefHat className="w-8 h-8 text-green-600" />
        </div>

        {/* Heading (Smaller Font) */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
          Eat Smarter, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">
            Not Harder.
          </span>
        </h1>
        
        {/* Subtext (Tighter Width & Smaller Font) */}
        <p className="text-base md:text-lg text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
          Stop guessing. Get personalized meal plans tailored to your calorie needs and goals in seconds.
        </p>

        {/* Button (Compact) */}
        <button
          onClick={() => navigate('/mealPlanner')}
          className="group flex items-center gap-2 bg-green-600 text-white text-base px-6 py-3 rounded-full font-semibold shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-green-300 transition-all transform hover:-translate-y-0.5"
        >
          Generate Plan
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>

      {/* Feature Grid (Moved Up) */}
      <div className="bg-white py-12 border-t border-gray-100 flex-1">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-gray-50 hover:bg-green-50 transition duration-300 border border-transparent hover:border-green-100 group">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Personalized</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    AI crafts the perfect menu tailored specifically for your metabolic rate and goals.
                </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-gray-50 hover:bg-green-50 transition duration-300 border border-transparent hover:border-green-100 group">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Weekly Schedules</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Get a full 7-day view. Breakfast, lunch, dinner, and snacks—all planned ahead.
                </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-gray-50 hover:bg-green-50 transition duration-300 border border-transparent hover:border-green-100 group">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Save Time</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    No more staring at the fridge. We automate your nutrition so you can focus on living.
                </p>
            </div>

        </div>
      </div>

    </div>
  );
};

export default MealPlannerHome;