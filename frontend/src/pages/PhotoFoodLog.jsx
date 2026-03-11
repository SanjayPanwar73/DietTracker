import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Camera, Upload, Sparkles, CheckCircle2, Loader2,
  Flame, Beef, Wheat, Droplets, Plus, ArrowLeft, X, RefreshCw
} from "lucide-react";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const MacroBadge = ({ icon, label, value, unit, color }) => (
  <div className={`flex flex-col items-center p-3 rounded-2xl ${color} gap-1`}>
    <span className="text-lg">{icon}</span>
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <span className="font-bold text-gray-800 text-sm">{value}<span className="text-xs font-normal ml-0.5">{unit}</span></span>
  </div>
);

const PhotoFoodLog = () => {
  const [stage, setStage] = useState("upload"); // upload | analyzing | results | logging | success
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState("Lunch");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setStage("preview");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const analyzeImage = async () => {
    if (!imageFile) return;
    setStage("analyzing");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await axios.post(
        "http://localhost:1001/api/food/analyzePhoto",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAnalysisResult(response.data);
      setStage("results");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.response?.data?.message || "Failed to analyze image. Please try again.");
      setStage("preview");
    }
  };

  const logFood = async () => {
    if (!analysisResult) return;
    setStage("logging");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:1001/api/food/createFood",
        {
          foodName: analysisResult.foodName,
          quantity,
          mealType: selectedMeal,
          nutritionInfo: {
            calories: analysisResult.nutrition.calories * quantity,
            protein_g: analysisResult.nutrition.protein_g * quantity,
            fat_total_g: analysisResult.nutrition.fat_total_g * quantity,
            carbohydrates_total_g: analysisResult.nutrition.carbohydrates_total_g * quantity,
            fiber_g: analysisResult.nutrition.fiber_g * quantity,
            sugar_g: analysisResult.nutrition.sugar_g * quantity,
            sodium_mg: analysisResult.nutrition.sodium_mg * quantity,
            potassium_mg: analysisResult.nutrition.potassium_mg * quantity,
            cholesterol_mg: analysisResult.nutrition.cholesterol_mg * quantity,
            fat_saturated_g: analysisResult.nutrition.fat_saturated_g * quantity,
            serving_size_grams: quantity,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStage("success");
    } catch (err) {
      console.error("Log error:", err);
      setError("Failed to log food. Please try again.");
      setStage("results");
    }
  };

  const reset = () => {
    setStage("upload");
    setImageFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError("");
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/foodLog")}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-green-600" />
            AI Photo Logger
          </h1>
          <p className="text-xs text-gray-400">Snap a photo — we'll handle the nutrition</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Claude AI
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">

        {/* STAGE: Upload */}
        {(stage === "upload") && (
          <div className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-green-500 bg-green-50 scale-[1.02]"
                  : "border-gray-200 bg-white hover:border-green-400 hover:bg-green-50/40"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-green-200">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">Drop your food photo here</p>
              <p className="text-gray-400 text-sm mb-6">or click to browse</p>
              <div className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-green-200 hover:bg-green-700 transition">
                <Upload className="w-4 h-4" />
                Choose Photo
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">How it works</p>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Upload a photo of your meal", icon: "📸" },
                  { step: "2", text: "Claude AI identifies the food and estimates nutrition", icon: "🤖" },
                  { step: "3", text: "Review, adjust, and log it instantly", icon: "✅" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm border border-red-100">
                {error}
              </div>
            )}
          </div>
        )}

        {/* STAGE: Preview */}
        {stage === "preview" && (
          <div className="space-y-5">
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-80 object-cover"
              />
              <button
                onClick={reset}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-xl text-white transition backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                <p className="text-white font-semibold">Ready to analyze</p>
                <p className="text-white/70 text-sm">Claude will identify the food and estimate calories</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={analyzeImage}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-green-200 hover:bg-green-700 transition active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" />
              Analyze with AI
            </button>
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 text-gray-500 py-3 rounded-2xl font-medium hover:bg-gray-100 transition"
            >
              <RefreshCw className="w-4 h-4" /> Choose different photo
            </button>
          </div>
        )}

        {/* STAGE: Analyzing */}
        {stage === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-lg">
                <img src={imagePreview} alt="analyzing" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-xl p-2 shadow-md">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800 mb-1">Analyzing your meal...</p>
              <p className="text-gray-400 text-sm">Claude is identifying ingredients and calculating nutrition</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* STAGE: Results */}
        {stage === "results" && analysisResult && (
          <div className="space-y-5">
            {/* Food Name & Image */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-52">
                <img src={imagePreview} alt="food" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-green-500 rounded-lg px-2 py-0.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-semibold">AI Detected</span>
                    </div>
                    <span className="text-white/60 text-xs">{Math.round(analysisResult.confidence * 100)}% confidence</span>
                  </div>
                  <h2 className="text-white text-2xl font-bold capitalize">{analysisResult.foodName}</h2>
                  {analysisResult.description && (
                    <p className="text-white/70 text-sm mt-0.5">{analysisResult.description}</p>
                  )}
                </div>
              </div>

              {/* Macros */}
              <div className="p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Nutrition per serving</p>
                <div className="grid grid-cols-4 gap-3">
                  <MacroBadge icon="🔥" label="Calories" value={Math.round(analysisResult.nutrition.calories)} unit="kcal" color="bg-orange-50" />
                  <MacroBadge icon="🥩" label="Protein" value={Math.round(analysisResult.nutrition.protein_g)} unit="g" color="bg-red-50" />
                  <MacroBadge icon="🍞" label="Carbs" value={Math.round(analysisResult.nutrition.carbohydrates_total_g)} unit="g" color="bg-yellow-50" />
                  <MacroBadge icon="🥑" label="Fat" value={Math.round(analysisResult.nutrition.fat_total_g)} unit="g" color="bg-blue-50" />
                </div>
              </div>
            </div>

            {/* Log Options */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
              <p className="font-semibold text-gray-700">Log this meal</p>

              {/* Meal Type */}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Meal Type</p>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map((meal) => (
                    <button
                      key={meal}
                      onClick={() => setSelectedMeal(meal)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition ${
                        selectedMeal === meal
                          ? "bg-green-600 text-white shadow-md shadow-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Servings</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center"
                  >−</button>
                  <span className="text-xl font-bold text-gray-800 w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 0.5)}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center"
                  >+</button>
                  <span className="text-sm text-gray-400 ml-2">
                    = {Math.round(analysisResult.nutrition.calories * quantity)} kcal total
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={logFood}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-green-200 hover:bg-green-700 transition active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Log {selectedMeal}
            </button>
            <button
              onClick={reset}
              className="w-full text-gray-400 py-2 text-sm hover:text-gray-600 transition"
            >
              Try a different photo
            </button>
          </div>
        )}

        {/* STAGE: Logging */}
        {stage === "logging" && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            <p className="text-xl font-bold text-gray-800">Logging your meal...</p>
          </div>
        )}

        {/* STAGE: Success */}
        {stage === "success" && (
          <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 mb-1">Logged! 🎉</p>
              <p className="text-gray-400">
                <span className="font-semibold text-gray-600 capitalize">{analysisResult?.foodName}</span> has been added to your {selectedMeal}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => navigate("/foodLog")}
                className="flex-1 bg-green-600 text-white py-3.5 rounded-2xl font-semibold hover:bg-green-700 transition"
              >
                View Food Log
              </button>
              <button
                onClick={reset}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-semibold hover:bg-gray-200 transition"
              >
                Log Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoFoodLog;
