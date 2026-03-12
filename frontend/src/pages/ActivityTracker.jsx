import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Footprints, Flame, MapPin, Clock, Zap,
  Wifi, WifiOff, RefreshCw, ArrowLeft,
  Loader2, Activity, AlertCircle, CheckCircle2
} from 'lucide-react';

// ── Metric Card ──────────────────────────────────────────────────
const MetricCard = ({ icon, label, value, unit, sub, textColor, bgColor }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${bgColor}`}>
      {icon}
    </div>
    <p className={`text-3xl font-bold ${textColor}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
      <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
    </p>
    <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ── Step Progress Ring ───────────────────────────────────────────
const StepRing = ({ steps, goal = 10000 }) => {
  const pct = Math.min((steps / goal) * 100, 100);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 100 ? '#10B981' : '#3B82F6';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{steps.toLocaleString()}</span>
          <span className="text-xs text-gray-400">steps</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Daily goal: <span className="font-semibold text-gray-700">{goal.toLocaleString()}</span>
        {pct >= 100 && <span className="text-green-600 ml-2 font-bold">✓ Goal reached!</span>}
      </p>
      <div className="w-full mt-2 bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{Math.round(pct)}% of goal</p>
    </div>
  );
};

// ── Net Calories Card ────────────────────────────────────────────
const NetCaloriesCard = ({ consumed, burned }) => {
  const net = Math.round(consumed - burned);
  const isDeficit = net < 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" /> Net Calories Today
      </h3>

      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex-1 text-center p-3 bg-blue-50 rounded-xl">
          <p className="text-2xl font-bold text-blue-600">{Math.round(consumed).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">🍽 Consumed</p>
        </div>
        <span className="text-2xl font-bold text-gray-300">−</span>
        <div className="flex-1 text-center p-3 bg-orange-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-600">{Math.round(burned).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">🔥 Burned</p>
        </div>
      </div>

      <div className={`rounded-xl p-4 text-center ${isDeficit ? 'bg-green-50' : 'bg-amber-50'}`}>
        <p className={`text-3xl font-bold ${isDeficit ? 'text-green-600' : 'text-amber-600'}`}>
          {isDeficit ? '' : '+'}{net.toLocaleString()} kcal
        </p>
        <p className={`text-sm mt-1 font-medium ${isDeficit ? 'text-green-700' : 'text-amber-700'}`}>
          {isDeficit
            ? `${Math.abs(net)} kcal deficit — great work!`
            : `${net} kcal surplus today`}
        </p>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────
const ActivityTracker = () => {
  const [connected, setConnected]       = useState(false);
  const [fitnessData, setFitnessData]   = useState(null);
  const [consumed, setConsumed]         = useState(0);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [connecting, setConnecting]     = useState(false);
  const [error, setError]               = useState('');

  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Handle redirect back from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('fitness') === 'connected') {
      window.history.replaceState({}, '', '/activity');
    }
  }, [location]);

  // On mount: check connection status + load today's food calories
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const init = async () => {
      setLoading(true);
      await Promise.all([checkStatus(), fetchTodayCalories()]);
      setLoading(false);
    };
    init();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await axios.get('http://localhost:1001/api/fitness/status', authHeader);
      setConnected(res.data.connected);
      if (res.data.connected) await fetchFitnessData();
    } catch (e) {
      console.error('Status check error:', e.message);
    }
  };

  const fetchTodayCalories = async () => {
    try {
      const res = await axios.get('http://localhost:1001/api/food/allFood', authHeader);
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const todayFoods = res.data.foods.filter(f => {
        const d = new Date(f.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        return key === todayKey;
      });
      setConsumed(todayFoods.reduce((s, f) => s + f.nutritionInfo.calories, 0));
    } catch (e) {
      console.error('Food fetch error:', e.message);
    }
  };

  const fetchFitnessData = async (showSpin = false) => {
    if (showSpin) setRefreshing(true);
    setError('');
    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const res = await axios.get(`http://localhost:1001/api/fitness/data?date=${dateStr}`, authHeader);
      setFitnessData(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to fetch fitness data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const connectGoogleFit = async () => {
    setConnecting(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:1001/api/fitness/auth-url', authHeader);
      window.location.href = res.data.url;
    } catch (e) {
      setError('Could not start Google Fit connection. Check your backend .env settings.');
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm('Disconnect Google Fit? Your stored fitness data will remain.')) return;
    try {
      await axios.delete('http://localhost:1001/api/fitness/disconnect', authHeader);
      setConnected(false);
      setFitnessData(null);
    } catch (e) {
      console.error('Disconnect error:', e.message);
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
    </div>
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" /> Activity Tracker
          </h1>
          <p className="text-xs text-gray-400">Google Fit · Smartwatch · Phone</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {connected && (
            <button
              onClick={() => fetchFitnessData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          )}
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
            connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {connected ? 'Connected' : 'Not Connected'}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {/* ── NOT CONNECTED ── */}
        {!connected && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center">
              <Activity className="w-10 h-10 text-blue-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Google Fit</h2>
              <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
                Connect your Google Fit account to sync step count, calories burned, distance walked,
                and active minutes — directly from your phone or smartwatch.
              </p>
            </div>

            {/* What gets tracked */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-lg">
              {[
                { emoji: '👟', label: 'Steps' },
                { emoji: '🔥', label: 'Calories Burned' },
                { emoji: '📍', label: 'Distance' },
                { emoji: '⏱️', label: 'Active Minutes' },
              ].map((m) => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <span className="text-2xl">{m.emoji}</span>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Setup steps */}
            <div className="bg-blue-50 rounded-2xl p-4 w-full max-w-md text-left border border-blue-100">
              <p className="text-sm font-semibold text-blue-800 mb-2">📱 Before connecting:</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Install <strong>Google Fit</strong> app on your Android phone</li>
                <li>Open it and walk around — it auto-tracks steps</li>
                <li>Then click Connect below</li>
              </ol>
            </div>

            <button
              onClick={connectGoogleFit}
              disabled={connecting}
              className="flex items-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 px-8 py-3.5 rounded-2xl font-semibold shadow-sm hover:shadow-md transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {connecting
                ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              }
              {connecting ? 'Redirecting to Google...' : 'Connect with Google Fit'}
            </button>

            <p className="text-xs text-gray-400">Read-only access. Your data is never shared.</p>
          </div>
        )}

        {/* ── CONNECTED — waiting for first sync ── */}
        {connected && !fitnessData && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-4">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <h3 className="font-bold text-gray-800 text-xl">Google Fit Connected!</h3>
            <p className="text-gray-500 text-sm">Click Sync Now to load your activity data.</p>
            <button
              onClick={() => fetchFitnessData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-green-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}

        {/* ── CONNECTED + DATA ── */}
        {connected && fitnessData && (
          <>
            {/* Row 1: Step ring + Net Calories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-blue-500" /> Daily Steps
                </h3>
                <StepRing steps={fitnessData.steps || 0} goal={10000} />
              </div>
              <NetCaloriesCard consumed={consumed} burned={fitnessData.caloriesBurned || 0} />
            </div>

            {/* Row 2: 4 metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={<Footprints className="w-5 h-5 text-blue-500" />}
                label="Steps" value={fitnessData.steps || 0} unit="steps"
                sub="Daily total" textColor="text-blue-600" bgColor="bg-blue-50"
              />
              <MetricCard
                icon={<Flame className="w-5 h-5 text-orange-500" />}
                label="Calories Burned" value={fitnessData.caloriesBurned || 0} unit="kcal"
                sub="Active + Resting" textColor="text-orange-600" bgColor="bg-orange-50"
              />
              <MetricCard
                icon={<MapPin className="w-5 h-5 text-green-500" />}
                label="Distance"
                value={((fitnessData.distance || 0) / 1000).toFixed(2)}
                unit="km"
                sub={`${(fitnessData.distance || 0).toLocaleString()}m total`}
                textColor="text-green-600" bgColor="bg-green-50"
              />
              <MetricCard
                icon={<Clock className="w-5 h-5 text-purple-500" />}
                label="Active Minutes" value={fitnessData.activeMinutes || 0} unit="min"
                sub="WHO goal: 30 min/day" textColor="text-purple-600" bgColor="bg-purple-50"
              />
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>
                Last synced: {new Date(fitnessData.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={disconnect} className="text-red-400 hover:text-red-600 transition underline">
                Disconnect Google Fit
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ActivityTracker;