import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Dumbbell, CheckCircle, Flame, Edit2, TrendingUp, 
  Timer, Trophy, Trash2, History, X, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-Component: Enhanced Circular Progress ---
const CircularProgress = ({ percentage, size = 180, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
        <motion.circle 
          cx={size / 2} cy={size / 2} r={radius} fill="none" 
          stroke="url(#exerciseGradient)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.4))" }}
        />
        <defs>
          <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F09819" />
            <stop offset="100%" stopColor="#FF512F" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div animate={percentage >= 100 ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}>
          {percentage >= 100 ? <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-lg" /> : <Flame className="w-10 h-10 text-orange-500" />}
        </motion.div>
        <span className="text-2xl font-black text-gray-800 dark:text-white mt-1">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const ExerciseTracker = () => {
  const [data, setData] = useState({ totalDuration: 0, totalCalories: 0, goal: 60, percentage: 0 });
  const [history, setHistory] = useState([]); // READ history
  const [loading, setLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 1. READ: Fetch stats and individual workout logs
  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("/api/exercise/today", { headers: { Authorization: `Bearer ${token}` } });
      setData({
        totalDuration: res.data.totalDuration || 0,
        totalCalories: res.data.totalCalories || 0,
        goal: res.data.goal || 60,
        percentage: ((res.data.totalDuration || 0) / (res.data.goal || 60)) * 100
      });
      setHistory(res.data.logs || []); // Individual entries for history list
    } catch (e) { console.error("Fetch error", e); }
  };

  // 2. CREATE: Log new workout
  const logWorkout = async (activity) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await axios.post("/api/exercise/log", {
        name: activity.name,
        duration: activity.dur,
        caloriesBurned: activity.cal,
      }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchStats();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // 3. DELETE: Remove a workout entry
  const deleteWorkout = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/exercise/log/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchStats();
    } catch (e) { console.error(e); }
  };

  // 4. UPDATE: Modify an existing entry
  const updateWorkout = async (id, currentDur, currentName) => {
    const newDur = prompt(`Edit duration for ${currentName} (min):`, currentDur);
    if (!newDur || isNaN(newDur)) return;

    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/exercise/log/${id}`, { duration: Number(newDur) }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchStats();
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStats(); }, []);

  const isGoalReached = data.percentage >= 100;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/40 via-transparent to-white/10 shadow-2xl overflow-hidden">
      <div className="relative bg-white/60 dark:bg-gray-900/80 backdrop-blur-3xl p-8 rounded-[2.4rem] z-10 min-h-[500px]">
        
        {/* Header with History Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl shadow-orange-500/30 text-white">
              <Dumbbell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Activity</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Daily Goal</p>
            </div>
          </div>
          <button onClick={() => setIsHistoryOpen(true)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-orange-500 transition-all">
            <History size={20} />
          </button>
        </div>

        {/* Circular Progress & Stats (Read) */}
        <div className="flex flex-col items-center mb-8">
          <CircularProgress percentage={data.percentage} />
          <div className="grid grid-cols-2 gap-8 w-full mt-8 px-4 border-t border-white/20 pt-6">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-orange-500 block mb-1">Time</span>
              <p className="text-3xl font-black text-gray-800 dark:text-white">{data.totalDuration}<span className="text-sm font-medium text-gray-400 ml-1">m</span></p>
            </div>
            <div className="text-center border-l border-gray-200 dark:border-gray-700">
              <span className="text-[10px] font-black uppercase text-red-500 block mb-1">Burned</span>
              <p className="text-3xl font-black text-gray-800 dark:text-white">{data.totalCalories}<span className="text-sm font-medium text-gray-400 ml-1">kcal</span></p>
            </div>
          </div>
        </div>

        {/* Quick Log Buttons (Create) */}
        <div className="space-y-3 mb-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Log Workout</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Run", dur: 30, cal: 300, color: "from-orange-400 to-red-500" },
              { name: "Cycle", dur: 15, cal: 150, color: "from-amber-400 to-orange-500" },
              { name: "Lift", dur: 45, cal: 200, color: "from-yellow-400 to-amber-500" }
            ].map((item) => (
              <motion.button key={item.name} whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }} onClick={() => logWorkout(item)} disabled={loading} className={`flex flex-col items-center p-3 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg border border-white/20`}>
                <span className="text-[10px] font-black uppercase">{item.name}</span>
                <span className="text-xs font-bold">+{item.dur}m</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* History Modal Overlay (Update/Delete) */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute inset-0 bg-white dark:bg-gray-900 z-50 p-8 rounded-[2.4rem] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-2xl font-black dark:text-white">Recent Workouts</h4>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {history.length === 0 && <p className="text-center text-gray-400 mt-20 font-medium">No sessions logged today.</p>}
                {history.map((log) => (
                  <div key={log._id} className="p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl"><Dumbbell size={18} /></div>
                      <div>
                        <p className="font-bold dark:text-white text-sm">{log.name}</p>
                        <p className="text-[10px] text-gray-500">{log.duration} min • {log.caloriesBurned} kcal</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => updateWorkout(log._id, log.duration, log.name)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => deleteWorkout(log._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal Reached UI */}
        <AnimatePresence>
          {isGoalReached && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <CheckCircle className="text-emerald-500" size={20} />
              <p className="text-xs font-bold text-emerald-600">Daily exercise goal smashed! 💪</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ExerciseTracker;