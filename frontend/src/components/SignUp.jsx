import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ChefHat, CheckCircle } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", { name, email, password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Track your daily meals",
    "AI-powered meal planning",
    "Nutrition analytics",
    "Barcode scanner"
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-50 to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-purple/20 dark:bg-accent-purple/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative"
      >
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Form */}
            <div className="p-8">
              <div className="text-center md:text-left mb-6">
                <Link to="/" className="inline-flex items-center gap-2">
                  <div className="p-2 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/30">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                </Link>
                <h1 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">Create account</h1>
                <p className="mt-1 text-neutral-500 dark:text-neutral-400 text-sm">Start your health journey today</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      onChange={handleOnChange}
                      value={data.name}
                      required
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      onChange={handleOnChange}
                      value={data.email}
                      required
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      onChange={handleOnChange}
                      value={data.password}
                      required
                      minLength={6}
                      className="input-field pl-10 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">Must be at least 6 characters</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Already have an account?{" "}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Right Side - Features */}
            <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
              <h2 className="text-2xl font-bold mb-6">Join thousands of health-conscious people</h2>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1 bg-white/20 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/30 border-2 border-primary-600 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-white/80">Join 10,000+ happy users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default SignUp;
