import React, { useState } from "react";
import axios from "axios";
import {toast , ToastContainer} from 'react-toastify'
import { useNavigate } from "react-router-dom";

const CreateFoodLog = () => {
  const navigate = useNavigate();
  const [food, setFood] = useState({
    foodName: "",
    quantity: "",
    mealType: "",
  });

  const handleOnChange =  (e) => {
    const { name, value } = e.target;
    setFood({ ...food, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:1001/api/food/createFood",
        food,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Food added successfully");
      setTimeout(() => {
        navigate("/foodLog");
      }, 1000);
    }catch(error){
      console.error("Error submitting food log:", error);
      toast.error("Error submitting food ")
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            Add Food Log
          </h1>

          <div className="space-y-2">
            <label htmlFor="foodName" className="block text-sm font-medium text-gray-600">
              Food Name
            </label>
            <input
              type="text"
              id="foodName"
              name="foodName"
              placeholder="Enter food name"
              value={food.foodName}
              onChange={handleOnChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-green-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-600">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              placeholder="Enter quantity"
              value={food.quantity}
              onChange={handleOnChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-green-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="mealType" className="block text-sm font-medium text-gray-600">
              Meal Type
            </label>
            <select
              id="mealType"
              name="mealType"
              value={food.mealType}
              onChange={handleOnChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-green-200 focus:outline-none"
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
      <ToastContainer/>
    </div>
  );
};

export default CreateFoodLog;
