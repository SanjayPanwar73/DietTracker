import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "./BarcodeScanner";
import { Camera, Scan } from "lucide-react";
const CreateFoodLog = () => {
  const navigate = useNavigate();
  const [food, setFood] = useState({
    foodName: "",
    quantity: "",
    mealType: "",
  });
  const [showScanner, setShowScanner] = useState(false);
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFood({ ...food, [name]: value });
  };
  const handleScanComplete = (barcodeData) => {
    setFood((prev) => ({ ...prev, foodName: barcodeData }));
    setShowScanner(false);
    toast.info("Barcode scanned! You can edit the food name if needed.");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/food/createFood", food, {
        headers: { Authorization: "Bearer " + token },
      });
      toast.success("Food added successfully");
      setTimeout(() => {
        navigate("/foodLog");
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting food ");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
            Add Food Log
          </h1>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Food Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="foodName"
                placeholder="Enter food name"
                value={food.foodName}
                onChange={handleOnChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring focus:ring-green-200 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
                title="Scan Barcode"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 mt-1"
            >
              <Scan className="w-4 h-4" />
              Scan Barcode
            </button>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              placeholder="Enter quantity"
              value={food.quantity}
              onChange={handleOnChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring focus:ring-green-200 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Meal Type
            </label>
            <select
              name="mealType"
              value={food.mealType}
              onChange={handleOnChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring focus:ring-green-200 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="" disabled>
                Select a meal type
              </option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn w-full bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition"
          >
            <span>Add Food</span>
          </button>
        </form>
      </div>
      <ToastContainer />
      {showScanner && (
        <BarcodeScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};
export default CreateFoodLog;
