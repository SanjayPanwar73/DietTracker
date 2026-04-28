import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from "../config/api";

const EditProfile = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    goal: 'weight gain', // Default set to lowercase
    activityLevel: 'extra active', // Default set to lowercase
    gender: 'male'
  });

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/profile/getProfile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = response.data.profile;
        if (data) {
          setFormData({
            name: data.user?.name || '',
            age: data.age || '',
            height: data.height || '',
            weight: data.weight || '',
            goal: data.goal || 'weight gain',
            activityLevel: data.activityLevel || 'extra active',
            gender: data.gender || 'male'
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load current profile data");
      }
    };
    fetchCurrentData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check: Backend expects numbers for these fields
    const payload = {
      ...formData,
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight)
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_BASE_URL}/api/profile/updateProfile`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Profile updated successfully!");
        navigate('/profile');
      }
    } catch (error) {
      console.error("Update failed server response:", error.response?.data);
      toast.error(error.response?.data?.message || "Validation Error: Check values");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-500">Update your physical metrics for better accuracy.</p>
          </div>
          <button 
            onClick={() => navigate('/profile')} 
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Years)</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" />
            </div>

            {/* Goal values must be lowercase to match backend enum */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Goal</label>
              <select name="goal" value={formData.goal} onChange={handleChange} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none">
                <option value="weight gain">Weight Gain</option>
                <option value="weight loss">Weight Loss</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Activity Level values must be lowercase to match backend enum */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Level</label>
              <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none">
                <option value="sedentary">Sedentary</option>
                <option value="lightly active">Lightly Active</option>
                <option value="moderately active">Moderately Active</option>
                <option value="extra active">Extra Active</option>
                <option value="very active">Very Active</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-[0.98] mt-4"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
