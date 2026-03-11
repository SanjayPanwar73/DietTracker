import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "lightly active", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
  { value: "moderately active", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
  { value: "very active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
  { value: "extra active", label: "Extra Active", desc: "Very hard exercise + physical job" },
];

const GOALS = [
  { value: "weight loss", label: "Lose Weight" },
  { value: "maintenance", label: "Maintain Weight" },
  { value: "weight gain", label: "Gain Weight" },
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55,
  very_active: 1.725, extra_active: 1.9,
};

function calculateCalories(weight, height, age, gender, activityLevel, goal) {
  if (!weight || !height || !age || !gender || !activityLevel) return null;
  const bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  let cal = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2);
  if (goal === "weight loss") cal -= 500;
  if (goal === "weight gain") cal += 500;
  return Math.round(cal);
}

function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  return (weight / ((height / 100) ** 2)).toFixed(1);
}

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [form, setForm] = useState({
    height: "", weight: "", age: "",
    gender: "", activityLevel: "", goal: "",
  });
  const estimatedCalories = calculateCalories(
    form.weight, form.height, form.age, form.gender, form.activityLevel, form.goal
  );
  const bmi = calculateBMI(form.weight, form.height);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/profile/getProfile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data) {
          setForm({
            height: data.height || "",
            weight: data.weight || "",
            age: data.age || "",
            gender: data.gender || "",
            activityLevel: data.activityLevel || "",
            goal: data.goal || "",
          });
        }
      } catch (err) {
        // Profile does not exist yet
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.height || !form.weight || !form.age || !form.gender || !form.activityLevel || !form.goal) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/profile/updateProfile",
        { ...form, calorieRequirement: estimatedCalories },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: "Profile saved successfully!" });
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };
  const getBMICategory = (bmiValue) => {
    if (!bmiValue) return { category: "", color: "" };
    if (bmiValue < 18.5) return { category: "Underweight", color: "#3b82f6" };
    if (bmiValue < 25) return { category: "Normal", color: "#22c55e" };
    if (bmiValue < 30) return { category: "Overweight", color: "#f59e0b" };
    return { category: "Obese", color: "#ef4444" };
  };

  const bmiInfo = getBMICategory(bmi);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Update your health information</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  placeholder="175"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="70"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="25"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <div className="flex gap-3">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleChange("gender", g.value)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition ${
                      form.gender === g.value
                        ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {bmi && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Your BMI</span>
                  <p className="text-2xl font-bold" style={{ color: bmiInfo.color }}>{bmi}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                  <p className="font-semibold" style={{ color: bmiInfo.color }}>{bmiInfo.category}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Activity Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleChange("activityLevel", level.value)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    form.activityLevel === level.value
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">{level.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              Health Goal
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => handleChange("goal", goal.value)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                    form.goal === goal.value
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {estimatedCalories && (
            <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-lg p-5 text-white mb-6">
              <p className="text-green-100 text-sm font-medium">Estimated Daily Calorie Need</p>
              <p className="text-3xl font-bold">{estimatedCalories.toLocaleString()} kcal</p>
              <p className="text-green-100 text-xs mt-1">Based on your profile and goal</p>
            </div>
          )}

          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${message.type === "error" ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
