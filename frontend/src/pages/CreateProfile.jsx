import React, { useEffect, useState } from "react";
import axios from "axios";
import {toast,ToastContainer} from 'react-toastify'
import {useNavigate} from 'react-router-dom'

const CreateProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    height: "",
    weight: "",
    age: "",
    activityLevel: "sedentary",
    goal: "maintenance",
    gender: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    // Validation
    if (!profile.height || !profile.weight || !profile.age) {
      toast.error("Please Fill all the fields")
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:1001/api/profile/createProfile",
        profile,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success("Profile Created Successfully");
      setTimeout(() => {
        navigate('/profile')
      }, 1000);
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      toast.error(`Failed to create profile ${err.response.data.message}`)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 px-6 py-10 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Create Your Profile
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="number"
              placeholder="Enter Height in cm"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange} // Corrected to onChange
              name="height"
              value={profile.height}
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Enter Weight in kg"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange} // Corrected to onChange
              name="weight"
              value={profile.weight}
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Enter Age"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange} // Corrected to onChange
              name="age"
              value={profile.age}
            />
          </div>

          <div>
            <select
              name="activityLevel"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange} // Corrected to onChange
              value={profile.activityLevel}
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly active">Lightly Active</option>
              <option value="moderately active">Moderately Active</option>
              <option value="very active">Very Active</option>
              <option value="extra active">Extra Active</option>
              <option value="super active">Super Active</option>
            </select>
          </div>

          <div>
            <select
              name="gender"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange} // Corrected to onChange
              value={profile.gender}
            >
              <option value="select">Select Gender</option>
              <option value="male">male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <select
              name="goal"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange} // Corrected to onChange
              value={profile.goal}
            >
              <option value="select">Select Goal</option>
              <option value="weight loss">Weight Loss</option>
              <option value="maintenance">Maintenance</option>
              <option value="weight gain">Weight Gain</option>
            </select>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default CreateProfile;
