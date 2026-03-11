import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
const CreateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    height: "",
    weight: "",
    age: "",
    activityLevel: "sedentary",
    goal: "maintain",
    gender: "",
    calorieRequirement: "",
  });
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/profile/getProfile", {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.data.profile) {
          setProfile(res.data.profile);
          setIsEditing(true);
        }
        setLoading(false);
      } catch (err) {
        console.log("No profile found, creating new");
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.height || !profile.weight || !profile.age) {
      toast.error("Please Fill all the fields");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? "/api/profile/updateProfile"
        : "/api/profile/createProfile";
      const method = isEditing ? axios.put : axios.post;
      await method(url, profile, {
        headers: { Authorization: "Bearer " + token },
      });
      toast.success(
        isEditing
          ? "Profile Updated Successfully"
          : "Profile Created Successfully",
      );
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    }
  };
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 px-6 py-10 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">
          {isEditing ? "Edit Your Profile" : "Create Your Profile"}
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="number"
              placeholder="Enter Height in cm"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
              name="height"
              value={profile.height}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Enter Weight in kg"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
              name="weight"
              value={profile.weight}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Enter Age"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
              name="age"
              value={profile.age}
            />
          </div>
          <div>
            <select
              name="activityLevel"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
              value={profile.activityLevel}
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly active">Lightly Active</option>
              <option value="moderately active">Moderately Active</option>
              <option value="very active">Very Active</option>
              <option value="extra active">Extra Active</option>
            </select>
          </div>
          <div>
            <select
              name="gender"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
              value={profile.gender}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <select
              name="goal"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleChange}
              value={profile.goal}
            >
              <option value="">Select Goal</option>
              <option value="weight loss">Weight Loss</option>
              <option value="maintain">Maintenance</option>
              <option value="weight gain">Weight Gain</option>
            </select>
          </div>
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {isEditing ? "Update Profile" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};
export default CreateProfile;
