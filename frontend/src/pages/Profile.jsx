import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Mail, Ruler, Weight, Activity, 
  Target, Flame, Edit3, Calendar, CheckCircle 
} from 'lucide-react';
import { API_BASE_URL } from "../config/api";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoized fetch function taaki refresh logic clean rahe
  const getProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/profile/getProfile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData = response.data.profile || response.data;
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error getting profile:', error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      getProfile();
    }
  }, [getProfile, navigate]);

  const calculateBMI = () => {
    if (!profile || !profile.height || !profile.weight) 
      return { value: 0, category: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100' };
    
    const heightInMeters = profile.height / 100;
    const bmiValue = profile.weight / (heightInMeters * heightInMeters);
    
    let category, color, bg;

    if (bmiValue < 18.5) {
      category = 'Underweight'; color = 'text-blue-700'; bg = 'bg-blue-100';
    } else if (bmiValue < 25) {
      category = 'Healthy'; color = 'text-green-700'; bg = 'bg-green-100';
    } else if (bmiValue < 30) {
      category = 'Overweight'; color = 'text-yellow-700'; bg = 'bg-yellow-100';
    } else {
      category = 'Obese'; color = 'text-red-700'; bg = 'bg-red-100';
    }

    return { value: bmiValue.toFixed(1), category, color, bg };
  };

  const bmiData = calculateBMI();
  const formatText = (text) => text ? text.replace(/_/g, ' ') : 'N/A';

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', year: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile</h1>
          {/* Quick Refresh Button for better UX */}
          <button onClick={getProfile} className="text-sm text-green-600 font-semibold hover:underline">
            Refresh Data
          </button>
        </div>

        {profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Identity Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden h-full">
                <Link to="/edit-profile" className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:text-green-600 hover:border-green-200 transition shadow-sm">
                  <Edit3 className="w-3 h-3" /> Edit
                </Link>

                <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-green-100 text-white text-5xl font-light select-none">
                  {(profile.user?.name || profile.name || "U").charAt(0).toUpperCase()}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.user?.name || profile.name}</h2>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-8 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile.user?.email || profile.email}</span>
                </div>

                <div className="w-full space-y-5 border-t border-gray-100 pt-6 mt-auto">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Age</span>
                      <span className="font-bold text-gray-900">{profile.age} years</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Gender</span>
                      <span className="font-bold text-gray-900 capitalize">{profile.gender || 'Not set'}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Member Since</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(profile.createdAt)}
                      </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Stats & Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-green-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden flex flex-col justify-between h-40">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1 opacity-90">
                      <Flame className="w-5 h-5" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Daily Calorie Target</span>
                    </div>
                    <div className="text-4xl font-bold mt-2">
                      {Math.round(profile.calorieRequirement || 0)} <span className="text-lg font-medium opacity-80">kcal</span>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                    <div>
                      <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">BMI Score</div>
                      <div className="text-4xl font-bold text-gray-900">{bmiData.value}</div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${bmiData.bg} ${bmiData.color}`}>
                        <CheckCircle className="w-3 h-3" />
                        {bmiData.category}
                      </span>
                    </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Physical Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <DetailBox icon={<Ruler />} label="Height" value={`${profile.height} cm`} />
                  <DetailBox icon={<Weight />} label="Weight" value={`${profile.weight} kg`} />
                  <DetailBox icon={<Target />} label="Goal" value={formatText(profile.goal)} />
                  <DetailBox icon={<Activity />} label="Activity Level" value={formatText(profile.activityLevel)} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyProfileView />
        )}
      </div>
    </div>
  );
};

// Reusable Sub-components for cleaner code
const DetailBox = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition">
    <div className="p-3 bg-white rounded-lg shadow-sm text-green-600">{icon}</div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 capitalize">{value}</p>
    </div>
  </div>
);

const EmptyProfileView = () => (
  <div className="flex flex-col items-center justify-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg mx-auto mt-20">
    <div className="bg-green-100 p-4 rounded-full mb-6">
        <User className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Your Profile</h2>
    <p className="text-gray-500 mb-8">It looks like you haven't created your diet profile yet.</p>
    <Link to="/createProfile" className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-200 hover:bg-green-700 transition">
        Create Profile
    </Link>
  </div>
);

export default Profile;
