import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'

// Components & Pages
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BasicHomePage from './pages/BasicHomePage'
import SignUp from './components/SignUp'
import Login from './components/Login'
import DashBoard from './pages/DashBoard'
import FoodLog from './pages/FoodLog'
import CreateFoodLog from './components/CreateFoodLog'
import NutritionInfo from './pages/NutritionInfo'
import Profile from './pages/Profile'
import CreateProfile from './pages/CreateProfile'
import MealPlanner from './pages/MealPlanner'
import MealPlannerHome from './pages/MealPlannerHome'
import History from './pages/History' // <--- 1. Import the new History page

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<BasicHomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        
        {/* Main Application Routes */}
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/foodLog" element={<FoodLog />} />
        <Route path="/add-food" element={<CreateFoodLog />} />
        <Route path="/nutritionInfo" element={<NutritionInfo />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/createProfile" element={<CreateProfile />} />
        <Route path="/mealPlanner" element={<MealPlanner />} />
        <Route path="/mealPlannerHome" element={<MealPlannerHome />} />
        
        {/* New History Route */}
        <Route path="/history" element={<History />} /> 
      </Routes>
      <Footer />
    </>
  )
}

export default App