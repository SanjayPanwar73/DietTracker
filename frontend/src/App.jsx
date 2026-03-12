import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'

// Existing components & pages (unchanged)
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
import History from './pages/History'
import Help from './pages/Help'
import Specialists from './pages/Specialists'
import Videos from './pages/Videos'

// New pages added previously (keep them)
import PhotoFoodLog from './pages/PhotoFoodLog'
import WeeklyInsights from './pages/WeeklyInsights'

// New: Activity Tracker
import ActivityTracker from './pages/ActivityTracker'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ── Existing routes (unchanged) ── */}
        <Route path="/"               element={<BasicHomePage />} />
        <Route path="/signup"         element={<SignUp />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/dashboard"      element={<DashBoard />} />
        <Route path="/foodLog"        element={<FoodLog />} />
        <Route path="/add-food"       element={<CreateFoodLog />} />
        <Route path="/nutritionInfo"  element={<NutritionInfo />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="/createProfile"  element={<CreateProfile />} />
        <Route path="/mealPlanner"    element={<MealPlanner />} />
        <Route path="/mealPlannerHome" element={<MealPlannerHome />} />
        <Route path="/history"        element={<History />} />
        <Route path="/help"           element={<Help />} />
        <Route path="/specialists"    element={<Specialists />} />
        <Route path="/videos"         element={<Videos />} />
        <Route path="/photo-log"      element={<PhotoFoodLog />} />
        <Route path="/weekly-insights" element={<WeeklyInsights />} />

        {/* ── New: Activity Tracker ── */}
        <Route path="/activity"       element={<ActivityTracker />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App