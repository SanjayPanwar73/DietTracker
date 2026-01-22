import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Mail, Ruler, Weight, Activity, 
  Target, Flame, Edit3, Calendar, CheckCircle 
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch profile data
  const getProfile = async () => {
    try {
      const response = await axios.get('http://localhost:1001/api/profile/getProfile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.profile) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error getting profile:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      getProfile();
    }
  }, [navigate]);

  // BMI Logic
  const calculateBMI = () => {
    if (!profile || !profile.height || !profile.weight) return { value: 0, category: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100' };
    
    const heightInMeters = profile.height / 100;
    const bmiValue = profile.weight / (heightInMeters * heightInMeters);
    
    let category = '';
    let color = '';
    let bg = '';

    if (bmiValue < 18.5) {
      category = 'Underweight';
      color = 'text-blue-700';
      bg = 'bg-blue-100';
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      category = 'Healthy';
      color = 'text-green-700';
      bg = 'bg-green-100';
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      category = 'Overweight';
      color = 'text-yellow-700';
      bg = 'bg-yellow-100';
    } else {
      category = 'Obese';
      color = 'text-red-700';
      bg = 'bg-red-100';
    }

    return { value: bmiValue.toFixed(1), category, color, bg };
  };

  const bmiData = calculateBMI();
  const formatText = (text) => text ? text.replace(/_/g, ' ') : 'N/A';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-6 md:p-10">
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Profile</h1>

        {profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Identity Card */}
            {/* ADDED 'h-full' HERE to stretch the card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden h-full justify-between">
                
                {/* Top Section of Card */}
                <div className="flex flex-col items-center w-full">
                    <Link to="/edit-profile" className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:text-green-600 hover:border-green-200 transition shadow-sm">
                    <Edit3 className="w-3 h-3" /> Edit
                    </Link>

                    <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-green-100 text-white text-5xl font-light select-none">
                    {profile.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.user?.name}</h2>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-8 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{profile.user?.email}</span>
                    </div>
                </div>

                {/* Bottom Details List */}
                <div className="w-full space-y-5 border-t border-gray-100 pt-6">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Age</span>
                      <span className="font-bold text-gray-900">{profile.age} years</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Gender</span>
                      <span className="font-bold text-gray-900 capitalize">{profile.gender}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Member Since</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" /> Jan 2026
                      </span>
                   </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Stats & Details */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="bg-green-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden flex flex-col justify-between h-40">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1 opacity-90">
                      <Flame className="w-5 h-5" />
                      <span className="text-sm font-semibold uppercase tracking-wider">Daily Calorie Target</span>
                    </div>
                    <div className="text-4xl font-bold mt-2">
                      {Math.round(profile.calorieRequirement)} <span className="text-lg font-medium opacity-80">kcal</span>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                  <div className="absolute right-10 top-[-20px] w-16 h-16 bg-white opacity-5 rounded-full"></div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                   <div>
                      <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">BMI Score</div>
                      <div className="text-4xl font-bold text-gray-900">
                          {bmiData.value}
                      </div>
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
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                   Physical Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-green-600">
                      <Ruler className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Height</p>
                      <p className="text-xl font-bold text-gray-900">{profile.height} <span className="text-sm font-normal text-gray-500">cm</span></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-green-600">
                      <Weight className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Weight</p>
                      <p className="text-xl font-bold text-gray-900">{profile.weight} <span className="text-sm font-normal text-gray-500">kg</span></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-green-600">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Goal</p>
                      <p className="text-lg font-bold text-gray-900 capitalize leading-tight">{formatText(profile.goal)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-green-600">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Activity Level</p>
                      <p className="text-lg font-bold text-gray-900 capitalize leading-tight">{formatText(profile.activityLevel)}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg mx-auto mt-20">
            <div className="bg-green-100 p-4 rounded-full mb-6">
                <User className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Your Profile</h2>
            <p className="text-gray-500 mb-8">It looks like you haven't created your diet profile yet.</p>
            <Link to="/createProfile">
              <button className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-200 hover:bg-green-700 transition">
                Create Profile
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;