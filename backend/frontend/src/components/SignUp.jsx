import React, { useState } from "react";
import axios from "axios";  // Import axios
import { ToastContainer, toast } from 'react-toastify';
import {useNavigate} from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleOnChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = data;
    try {
        const response = await axios.post("http://localhost:1001/api/auth/signup", { name, email, password });
        toast.success('User signed up successfully');
        navigate('/login');
    } catch (error) {
        console.error("There was an error signing up the user:", error);
        toast.error(`Error: ${error.response.data.message}`);
    }
};


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Enter Your Name"
            onChange={handleOnChange}
            value={data.name}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-green-500"
          />
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
            Sign up
            <div className="arrow-wrapper">
              <div className="arrow"></div>
            </div>
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
