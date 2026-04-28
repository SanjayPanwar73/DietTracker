import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer , toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleOnChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    const {email, password} = data;
    try{
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {email, password});
    const token = response.data.token; 
    localStorage.setItem('token', token);
    toast.success('User signed up successfully');
    navigate('/dashboard');
    }catch(error){
      console.error("There was an error signing up the user:", error);
      toast.error(`Error: ${error.response.data.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter Your Email"
            onChange={handleOnChange}
            value={data.email}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter Your Password"
            onChange={handleOnChange}
            value={data.password}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-500"
          />
          <button className="auth-btn w-full mt-3 " type="submit">
          Login
          <div class="arrow-wrapper">
            <div class="arrow"></div>
          </div>
        </button>
        </form>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Login;
