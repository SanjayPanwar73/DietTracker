import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Heart 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">

        {/* TOP SECTION: Grid Layout (Changed to 3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Column 1: Brand Identity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
               <ChefHat className="w-8 h-8 text-green-500 group-hover:text-green-400 transition" />
               <span className="text-2xl font-bold tracking-tight text-white">DietTracker</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your personal companion for a healthier lifestyle. Track meals, analyze nutrition, and reach your fitness goals with data-driven insights.
            </p>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-green-400 hover:pl-1 transition-all">Dashboard</Link></li>
              <li><Link to="/foodLog" className="hover:text-green-400 hover:pl-1 transition-all">Food Diary</Link></li>
              <li><Link to="/mealPlannerHome" className="hover:text-green-400 hover:pl-1 transition-all">AI Meal Planner</Link></li>
              <li><Link to="/nutritionInfo" className="hover:text-green-400 hover:pl-1 transition-all">Nutrition Analytics</Link></li>
            </ul>
          </div>

          {/* Column 3: Company & Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/profile" className="hover:text-green-400 hover:pl-1 transition-all">My Account</Link></li>
              <li><a href="#" className="hover:text-green-400 hover:pl-1 transition-all">Help Center</a></li>
              <li><a href="#" className="hover:text-green-400 hover:pl-1 transition-all">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 hover:pl-1 transition-all">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* BOTTOM SECTION: Copyright & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm flex items-center gap-1.5">
            &copy; 2025 DietTracker. Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" /> for a better you.
          </p>
          
          <div className="flex gap-5">
            <a href="#" className="text-gray-400 hover:text-white transition transform hover:-translate-y-1"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition transform hover:-translate-y-1"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition transform hover:-translate-y-1"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-white transition transform hover:-translate-y-1"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;