import React from 'react';
import "../Styles/BasicHome.css";
import { Link } from 'react-router-dom';

const BasicHome = () => {
  return (
    <div className='basic-home h-screen flex flex-col items-center justify-center bg-gray-100'>
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-green-600">
          Welcome to Diet Tracker
        </div>
        <div className="mt-4 text-xl text-gray-700">
          "The journey of a thousand miles begins with a single step." - Lao Tzu
        </div>
        <div className="mt-6">
            <Link to={'/signup'}>
            <button className='btn'>
              <span>Get Started</span>
            </button></Link>
        </div>
      </div>
      </div>
  )
}

export default BasicHome;
