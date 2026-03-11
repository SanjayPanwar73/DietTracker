import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Droplets, CheckCircle, Sparkles, GlassWater, Waves, 
  TrendingUp, Edit2, Trash2, History, X, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-Component: Wave Progress (Same as your logic) ---
const WaterWaveProgress = ({ percentage, size = 180 }) => {
  const normalizedFill = Math.min(Math.max(percentage, 5), 95);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]" />
      <div className="relative w-[90%] h-[90%] rounded-full bg-gray-100/10 dark:bg-gray-800/40 backdrop-blur-sm overflow-hidden border border-white/10">
        <motion.div
          animate={{ y: `${100 - normalizedFill}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
          className="absolute inset-0 w-[200%] h-[100%] left-[-50%]"
        >
          <svg viewBox="0 0 100 20" className="absolute top-[-15px] w-full h-10 fill-cyan-500/80">
            <motion.path
              animate={{ x: [0, -50, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 V20 H0 Z"
            />
          </svg>
          <div className="w-full h-full bg-gradient-to-b from-cyan-500/80 to-blue-600" />
        </motion.div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center">
          <Droplets size={32} className={percentage > 50 ? "text-white" : "text-cyan-500"} />
          <span className={`text-2xl font-black mt-1 ${percentage > 60 ? "text-white" : "text-gray-800 dark:text-white"}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const WaterTracker = () => {
  const [data, setData] = useState({ totalAmount: 0, goal: 2500, percentage: 0 });
  const [logs, setLogs] = useState([]); // READ: Store history
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. READ: Fetch today's summary and individual logs
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("/api/water/today", { headers: { Authorization: `Bearer ${token}` } });
      setData({
        totalAmount: res.data.totalAmount || 0,
        goal: res.data.goal || 2500,
        percentage: ((res.data.totalAmount || 0) / (res.data.goal || 2500)) * 100
      });
      setLogs(res.data.logs || []); // Assuming backend returns today's list of logs
    } catch (e) { console.error(e); }
  };

  // 2. CREATE: Log new water
  const logWater = async (amount) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      await axios.post("/api/water/log", { amount }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // 3. DELETE: Remove a specific entry
  const deleteLog = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/water/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (e) { console.error(e); }
  };

  // 4. UPDATE: Modify an entry (simple version: prompt for new amount)
  const updateLog = async (id, currentAmount) => {
    const newAmount = prompt("Enter new amount (ml):", currentAmount);
    if (!newAmount || isNaN(newAmount)) return;
    
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/water/update/${id}`, { amount: Number(newAmount) }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <motion.div className="max-w-md mx-auto relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-cyan-300/40 via-transparent to-blue-500/20 shadow-2xl overflow-hidden">
      <div className="relative bg-white/60 dark:bg-gray-900/80 backdrop-blur-3xl p-8 rounded-[2.4rem] z-10">
        
        {/* Header with History Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500 rounded-2xl text-white shadow-lg shadow-cyan-500/30">
              <Waves size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 dark:text-white">Hydration</h3>
              <p className="text-[10px] font-bold text-cyan-600 uppercase flex items-center gap-1">
                <TrendingUp size={12} /> On track
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-cyan-500 transition-all"
          >
            <History size={20} />
          </button>
        </div>

        {/* Progress & Stats (Read) */}
        <div className="grid grid-cols-2 gap-4 items-center mb-10">
          <WaterWaveProgress percentage={data.percentage} />
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Total Drunk</p>
              <p className="text-4xl font-black text-gray-800 dark:text-white">{data.totalAmount}<span className="text-sm font-bold text-gray-400 ml-1">ml</span></p>
            </div>
            <div className="h-[1px] bg-gray-200 dark:bg-gray-700 w-full" />
            <p className="text-sm font-bold text-cyan-600 uppercase tracking-tight">
               {data.percentage >= 100 ? "Goal Met!" : `${data.goal - data.totalAmount}ml left`}
            </p>
          </div>
        </div>

        {/* Action Pills (Create) */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[250, 500, 750].map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => logWater(amount)}
              className="py-4 rounded-3xl bg-white/50 dark:bg-gray-800/50 border border-white/20 flex flex-col items-center gap-1 shadow-sm"
            >
              <GlassWater size={18} className="text-cyan-500" />
              <span className="text-xs font-bold dark:text-white">+{amount}ml</span>
            </motion.button>
          ))}
        </div>

        {/* History Overlay (Update/Delete) */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              className="absolute inset-0 bg-white dark:bg-gray-900 z-50 p-8 rounded-[2.4rem] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-black dark:text-white">Today's Logs</h4>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                {logs.length === 0 && <p className="text-center text-gray-400 py-10">No logs yet today.</p>}
                {logs.map((log) => (
                  <div key={log._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-cyan-500 rounded-full" />
                      <div>
                        <p className="font-bold dark:text-white">{log.amount} ml</p>
                        <p className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateLog(log._id, log.amount)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteLog(log._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WaterTracker;