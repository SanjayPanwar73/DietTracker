import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import { Flame, Zap, Droplets, Plus, Activity } from 'lucide-react'; // Removed LogOut and ChefHat as they are in Navbar now
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [foods, setFoods] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const formatNumber = (num) => Math.round(num || 0);

  const getProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) navigate('/login');

    try {
      const response = await axios.get(
        "http://localhost:1001/api/profile/getProfile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.profile) {
        setProfile(response.data.profile);
      } else {
        alert("No profile found. Please create one.");
      }
    } catch (error) {
      console.error("Error getting profile:", error.message);
    }
  };

  const fetchFoods = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:1001/api/food/allFood",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedFoods = response.data.foods;
      setFoods(fetchedFoods);

      const calories = fetchedFoods.reduce(
        (total, food) => total + food.nutritionInfo.calories,
        0
      );
      setTotalCalories(calories);
    } catch (error) {
      console.error("Error fetching foods:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchFoods();
    getProfile();
  }, []);

  // --- CHART CONFIGURATIONS ---

  const cleanChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { grid: { display: false }, border: { display: false }, ticks: { display: false } },
    },
  };

  const comparisonChartData = {
    labels: ["Consumed", "Required"],
    datasets: [
      {
        data: [totalCalories, profile?.calorieRequirement || 2000],
        backgroundColor: ["#10B981", "#E5E7EB"],
        borderRadius: 5,
        barThickness: 40,
      },
    ],
  };

  const macroData = {
    labels: ["Proteins", "Fats", "Carbs"],
    datasets: [
      {
        data: [
          foods.reduce((t, f) => t + f.nutritionInfo.protein_g, 0),
          foods.reduce((t, f) => t + f.nutritionInfo.fat_total_g, 0),
          foods.reduce((t, f) => t + f.nutritionInfo.carbohydrates_total_g, 0),
        ],
        backgroundColor: ["#10B981", "#3B82F6", "#FBBF24"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const mealBreakdownData = {
    labels: [...new Set(foods.map((f) => f.mealType))],
    datasets: [
      {
        data: [...new Set(foods.map((f) => f.mealType))].map((meal) =>
          foods
            .filter((f) => f.mealType === meal)
            .reduce((sum, f) => sum + f.nutritionInfo.calories, 0)
        ),
        backgroundColor: "#3B82F6",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* NOTE: The Navbar is gone from here. 
         It should be rendered in App.js or Layout.js above the Routes 
      */}

      {/* MAIN CONTENT */}
      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 mt-2">
          <h2 className="text-3xl font-light text-gray-800">
            Welcome back, <span className="font-semibold text-green-700">{profile?.user?.name || "User"}!</span>
          </h2>
          <p className="text-gray-500 mt-1">Here's your daily nutrition overview.</p>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* CARD: Daily Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-semibold text-lg text-gray-700">Daily Summary</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-6 relative z-10">
              {/* Requirement */}
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center"><Flame className="w-5 h-5 text-green-500" /></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Target</span>
                    <span className="font-bold">{formatNumber(profile?.calorieRequirement)} kcal</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              {/* Consumed */}
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center"><Zap className="w-5 h-5 text-blue-500" /></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Consumed</span>
                    <span className="font-bold text-blue-600">{formatNumber(totalCalories)} kcal</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min((totalCalories / (profile?.calorieRequirement || 2000)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

               {/* Water (Static for now) */}
               <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center"><Droplets className="w-5 h-5 text-cyan-500" /></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Water Intake</span>
                    <span className="font-bold">2.5 L</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD: Meal Breakdown List */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-80">
            <h3 className="font-semibold text-lg text-gray-700 mb-4 flex justify-between items-center">
              Meal Breakdown
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{foods.length} Items</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {foods.length > 0 ? (
                foods.map((food, index) => (
                  <div key={food._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition border border-transparent hover:border-green-100 group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${index % 2 === 0 ? 'bg-blue-400' : 'bg-yellow-400'}`}></div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{food.foodName}</p>
                        <p className="text-xs text-gray-500 capitalize">{food.mealType}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-700 text-sm group-hover:text-green-700">
                      {Math.round(food.nutritionInfo.calories)} kcal
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                   <p>No meals logged today.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM CHARTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Chart 1: Calorie Breakdown (Bar) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Calories by Meal</h3>
            <div className="flex-1 h-40">
               <Bar data={mealBreakdownData} options={cleanChartOptions} />
            </div>
          </div>

          {/* Chart 2: Macros (Doughnut) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
             <h3 className="font-semibold text-gray-700 mb-2 self-start text-sm">Macro Distribution</h3>
             <div className="w-32 h-32 relative">
                <Doughnut data={macroData} options={{...cleanChartOptions, cutout: '70%'}} />
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-xs text-gray-400">Total</span>
                  <span className="font-bold text-gray-700">{formatNumber(totalCalories)}</span>
                </div>
             </div>
             <div className="flex gap-4 mt-4 text-xs text-gray-500">
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Prot</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Fat</span>
                 <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-full"></div> Carb</span>
             </div>
          </div>

          {/* Chart 3: Comparison (Bar) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-2 text-sm">Goal Progress</h3>
            <div className="flex-1 h-40">
                <Bar data={comparisonChartData} options={cleanChartOptions} />
            </div>
          </div>

        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/log-food')} 
        className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition flex items-center justify-center z-40"
      >
         <Plus className="w-6 h-6" />
      </button>

    </div>
  );
};

export default Dashboard;