import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Droplets, Apple, Utensils, Award, Zap, ChevronRight, Activity, Plus, User, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ExerciseTracker from '../components/ExerciseTracker';
import WaterTracker from '../components/WaterTracker';

const DashBoard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [todayStats, setTodayStats] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const profileRes = await axios.get('/api/profile/getProfile', { headers: { Authorization: `Bearer ${token}` } });
        if (profileRes.data.profile) setProfile(profileRes.data.profile);
        
        // Fetch water data
        try {
          const waterRes = await axios.get('/api/water/today', { headers: { Authorization: `Bearer ${token}` } });
          setTodayStats(prev => ({ ...prev, water: Math.round((waterRes.data.totalAmount || 0) / 250) }));
        } catch (e) { console.log('Water not available'); }
        
        const today = new Date().toISOString().split('T')[0];
        const foodsRes = await axios.get('/api/food/allFood', { headers: { Authorization: `Bearer ${token}` } });
        const allFoods = foodsRes.data.foods || [];
        const todayFoods = allFoods.filter(food => food.createdAt && food.createdAt.startsWith(today));
        const stats = todayFoods.reduce((acc, food) => ({
          calories: acc.calories + (food.nutritionInfo?.calories || 0),
          protein: acc.protein + (food.nutritionInfo?.protein_g || 0),
          carbs: acc.carbs + (food.nutritionInfo?.carbohydrates_total_g || 0),
          fat: acc.fat + (food.nutritionInfo?.fat_total_g || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
        
        // Add water to stats
        try {
          const waterRes = await axios.get('/api/water/today', { headers: { Authorization: `Bearer ${token}` } });
          stats.water = Math.round((waterRes.data.totalAmount || 0) / 250);
        } catch (e) { }
        
        setTodayStats(stats);
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayFoods = allFoods.filter(food => food.createdAt && food.createdAt.startsWith(dateStr));
          const dayCalories = dayFoods.reduce((sum, food) => sum + (food.nutritionInfo?.calories || 0), 0);
          last7Days.push({ name: date.toLocaleDateString('en-US', { weekday: 'short' }), calories: Math.round(dayCalories) });
        }
        setWeeklyData(last7Days);
        let currentStreak = 0;
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          const hasFood = allFoods.some(food => food.createdAt && food.createdAt.startsWith(dateStr));
          if (hasFood) currentStreak++;
          else if (i > 0) break;
        }
        setStreak(currentStreak);
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
      <div className='w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin' />
    </div>
  );

  const calorieGoal = profile?.calorieRequirement || 2000;
  const calorieProgress = Math.min((todayStats.calories / calorieGoal) * 100, 100);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Header Section */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white'>{greeting} 👋</h1>
            <p className='text-gray-500 dark:text-gray-400 mt-1 text-sm'>Here is your nutrition overview</p>
          </div>
          <Link to='/add-food' className='inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-sm'>
            <Plus className='w-5 h-5 mr-2' /> Log Food
          </Link>
        </div>

        {/* Main Content Grid - 70% Left + 30% Right */}
        <div className='grid grid-cols-12 gap-5'>
          {/* Left Section - Overview Cards + Weekly Progress (70% = col-span-8) */}
          <div className='col-span-12 lg:col-span-8 space-y-5'>
            {/* Overview Stats Cards Row */}
            <div className='grid grid-cols-3 gap-5'>
              <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center gap-3 mb-3'><div className='p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg'><Flame className='w-5 h-5 text-orange-600 dark:text-orange-400' /></div><span className='text-sm font-medium text-gray-500 dark:text-gray-400'>Calories</span></div>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>{Math.round(todayStats.calories)} <span className='text-sm text-gray-400 dark:text-gray-500'>/ {calorieGoal}</span></div>
                <div className='mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden'><div className='h-full bg-orange-500 rounded-full transition-all' style={{ width: calorieProgress + '%' }} /></div>
              </div>
              <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center gap-3 mb-3'><div className='p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg'><Droplets className='w-5 h-5 text-blue-600 dark:text-blue-400' /></div><span className='text-sm font-medium text-gray-500 dark:text-gray-400'>Water</span></div>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>{todayStats.water || 0} <span className='text-sm text-gray-400 dark:text-gray-500'>/ 8</span></div>
                <div className='mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden'><div className='h-full bg-blue-500 rounded-full transition-all' style={{ width: Math.min((todayStats.water || 0) / 8 * 100, 100) + '%' }} /></div>
              </div>
              <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center gap-3 mb-3'><div className='p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg'><Activity className='w-5 h-5 text-green-600 dark:text-green-400' /></div><span className='text-sm font-medium text-gray-500 dark:text-gray-400'>Protein</span></div>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>{Math.round(todayStats.protein)} <span className='text-sm text-gray-400 dark:text-gray-500'>g</span></div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Weekly Progress</h3>
                <span className='text-sm text-gray-500 dark:text-gray-400'>Last 7 days</span>
              </div>
              <div className='h-64'><ResponsiveContainer width='100%' height='100%'><AreaChart data={weeklyData}><defs><linearGradient id='colorCal' x1='0' y1='0' x2='0' y2='1'><stop offset='5%' stopColor='#16a34a' stopOpacity={0.3}/><stop offset='95%' stopColor='#16a34a' stopOpacity={0}/></linearGradient></defs><XAxis dataKey='name' axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} /><Tooltip contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff'}} /><Area type='monotone' dataKey='calories' stroke='#16a34a' strokeWidth={2} fill='url(#colorCal)' /></AreaChart></ResponsiveContainer></div>
            </div>

            {/* Macros Breakdown - Hidden on small mobile */}
            <div className='grid grid-cols-3 gap-5 hidden sm:grid'>
              <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center gap-2 mb-2'><div className='w-3 h-3 bg-yellow-400 rounded-full'></div><span className='text-sm text-gray-500 dark:text-gray-400'>Carbs</span></div>
                <div className='text-xl font-bold text-gray-900 dark:text-white'>{Math.round(todayStats.carbs)}g</div>
              </div>
              <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center gap-2 mb-2'><div className='w-3 h-3 bg-red-400 rounded-full'></div><span className='text-sm text-gray-500 dark:text-gray-400'>Fat</span></div>
                <div className='text-xl font-bold text-gray-900 dark:text-white'>{Math.round(todayStats.fat)}g</div>
              </div>
              <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700'>
                <div className='flex items-center gap-2 mb-2'><div className='w-3 h-3 bg-purple-400 rounded-full'></div><span className='text-sm text-gray-500 dark:text-gray-400'>Protein</span></div>
                <div className='text-xl font-bold text-gray-900 dark:text-white'>{Math.round(todayStats.protein)}g</div>
              </div>
            </div>
          </div>

          {/* Right Section - Streak, AI Insight, Hydration, Activity (30% = col-span-4) */}
          <div className='col-span-12 lg:col-span-4 space-y-5'>
            {/* Streak Card */}
            <div className='bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-6 shadow-md'>
              <div className='flex items-center gap-3 mb-3'><div className='p-2.5 bg-white/20 rounded-lg'><Award className='w-5 h-5' /></div><span className='text-sm font-medium text-white/80'>Streak</span></div>
              <div className='text-3xl font-bold'>{streak} <span className='text-sm font-medium text-white/80'>days</span></div>
            </div>
            
            {/* AI Insight Card */}
            <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800'>
              <div className='flex items-center gap-2 mb-3'>
                <Zap className='w-5 h-5 text-green-600 dark:text-green-400' />
                <h3 className='font-semibold text-gray-900 dark:text-white'>AI Insight</h3>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>
                {todayStats.calories < calorieGoal * 0.5 
                  ? 'Light start! Add a healthy snack to reach your calorie goal.' 
                  : todayStats.calories < calorieGoal 
                    ? 'Great progress! You\'re on track with your nutrition today.' 
                    : 'Exceeded calorie goal today. Great job staying consistent!'}
              </p>
            </div>
            
            {/* Hydration Card */}
            <WaterTracker />
            
            {/* Activity Card */}
            <ExerciseTracker />
            
            {/* Quick Actions */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700'>
              <h3 className='font-semibold text-gray-900 dark:text-white mb-4'>Quick Actions</h3>
              <div className='space-y-1.5'>
                <Link to='/foodLog' className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group'>
                  <Utensils className='w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>View Meals</span>
                  <ChevronRight className='w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform' />
                </Link>
                <Link to='/nutritionInfo' className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group'>
                  <Apple className='w-5 h-5 text-green-600 group-hover:scale-110 transition-transform' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Nutrition</span>
                  <ChevronRight className='w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform' />
                </Link>
                <Link to='/profile' className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group'>
                  <User className='w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>Profile</span>
                  <ChevronRight className='w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform' />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashBoard; 

