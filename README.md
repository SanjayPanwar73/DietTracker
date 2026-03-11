# 🥗 Diet Tracker Application

A full-stack Diet Tracking Web Application built with the MERN stack (MongoDB, Express, React, Node.js). This application helps users track their daily food intake, monitor nutrition, plan meals, and achieve their fitness goals.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Frontend Routes](#frontend-routes)
8. [Installation & Setup](#installation--setup)
9. [Environment Variables](#environment-variables)
10. [Dependencies](#dependencies)
11. [Key Components](#key-components)
12. [Screenshots Description](#screenshots-description)

---

## 🌟 Project Overview

**Diet Tracker** is a comprehensive web application that enables users to:
- Create and manage their personal health profiles
- Log daily food intake across different meal types
- View nutrition information and track calories
- Plan meals according to their dietary goals
- View historical data and progress
- Get AI-powered diet advice through an integrated chatbot

---

## 🛠 Tech Stack

### Frontend
- **React** (v18.3.1) - UI Library
- **Vite** (v6.0.5) - Build Tool
- **Tailwind CSS** (v3.4.17) - Styling
- **React Router DOM** (v7.1.1) - Routing
- **Axios** - HTTP Client
- **Chart.js & React-Chartjs-2** - Data Visualization
- **React Datepicker** - Date Selection
- **React Toastify** - Notifications
- **Lucide React** - Icons
- **Date-fns** - Date Formatting

### Backend
- **Node.js** - Runtime Environment
- **Express.js** (v4.21.2) - Web Framework
- **MongoDB** - Database
- **Mongoose** (v8.9.4) - ODM
- **JSON Web Token (JWT)** - Authentication
- **Bcryptjs** - Password Hashing
- **CORS** - Cross-Origin Resource Sharing
- **Dotenv** - Environment Variables

---

## 📁 Project Structure

```
DietTracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── foodController.js     # Food logging logic
│   │   └── profileController.js  # Profile management logic
│   ├── middlewares/
│   │   └── Authenticate.js       # JWT authentication middleware
│   ├── models/
│   │   ├── Food.js               # Food schema
│   │   ├── Profile.js            # User profile schema
│   │   └── User.js               # User schema
│   ├── routes/
│   │   ├── authRouter.js         # Auth API routes
│   │   ├── chatBotRouter.js      # Chatbot API routes
│   │   ├── foodRouter.js         # Food API routes
│   │   └── profileRouter.js      # Profile API routes
│   ├── frontend/                 # Embedded frontend (not main)
│   ├── index.js                  # Server entry point
│   ├── package.json
│   └── .env                      # Environment variables
│
└── frontend/                     # Main Frontend Application
    ├── src/
    │   ├── components/
    │   │   ├── CreateFoodLog.jsx # Food log creation form
    │   │   ├── Footer.jsx        # Footer component
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Navbar.jsx         # Navigation bar
    │   │   └── SignUp.jsx         # Registration page
    │   ├── pages/
    │   │   ├── BasicHome.jsx      # Landing page
    │   │   ├── BasicHomePage.jsx  # Home page wrapper
    │   │   ├── CreateProfile.jsx # Profile creation
    │   │   ├── DashBoard.jsx      # Main dashboard with charts
    │   │   ├── Feature.jsx       # Features display
    │   │   ├── FoodLog.jsx        # Food log view
    │   │   ├── History.jsx        # Historical data
    │   │   ├── MealPlanner.jsx    # Meal planning
    │   │   ├── MealPlannerHome.jsx# Meal planner home
    │   │   ├── NutritionInfo.jsx # Nutrition details
    │   │   └── Profile.jsx        # User profile view
    │   ├── Styles/
    │   │   └── Basichome.css      # Basic home styles
    │   ├── assets/
    │   │   └── dt.jpg             # App logo/image
    │   ├── App.css
    │   ├── App.jsx                # Main app component
    │   ├── index.css
    │   └── main.jsx               # React entry point
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── eslint.config.js
```

---

## ✨ Features

### 1. User Authentication
- **Sign Up**: Create a new account with name, email, and password
- **Login**: Secure login with JWT token authentication
- **Logout**: Secure session termination

### 2. Profile Management
- Create personal health profile with:
  - Height (cm)
  - Weight (kg)
  - Age
  - Gender (male/female/other)
  - Activity Level (6 levels from sedentary to super active)
  - Health Goal (weight loss/maintenance/weight gain)
- Automatic daily calorie requirement calculation
- View and edit profile information

### 3. Food Logging
- Log food entries with:
  - Food name
  - Quantity
  - Meal type (Breakfast, Lunch, Dinner, Snacks)
  - Nutrition information
- View all logged foods
- Delete food entries
- Date-wise filtering

### 4. Nutrition Tracking
- View detailed nutrition information
- Track daily calorie intake
- Visual charts showing:
  - Calorie consumption over time
  - Meal breakdown
  - Progress towards daily goals

### 5. Meal Planning
- Plan meals for the week
- Create customized meal plans
- Track planned vs consumed calories

### 6. History
- View historical food logs
- Track progress over time
- Analyze eating patterns

### 7. AI Chatbot
- Get diet and nutrition advice
- Ask health-related questions
- Receive personalized suggestions

### 8. Dashboard
- Overview of daily progress
- Visual charts and statistics
- Quick access to all features

---

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |

### Food Routes (`/api/food`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/food/createFood` | Create a new food log entry |
| GET | `/api/food/allFood` | Get all food entries for user |
| DELETE | `/api/food/deleteFood/:id` | Delete a food entry |

### Profile Routes (`/api/profile`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/profile/createProfile` | Create user profile |
| GET | `/api/profile/getProfile` | Get user profile |

### Chatbot Routes (`/api/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/chats` | Send message to chatbot |

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required)
}
```

### Profile Schema
```javascript
{
  user: ObjectId (ref: User),
  height: Number (cm, required),
  weight: Number (kg, required),
  age: Number (required),
  activityLevel: String (enum: sedentary, lightly active, moderately active, very active, extra active, super active),
  gender: String (enum: male, female, other),
  goal: String (enum: weight loss, maintenance, weight gain),
  calorieRequirement: Number,
  timestamps: true
}
```

### Food Schema
```javascript
{
  foodName: String (required),
  quantity: Number (required),
  mealType: String (enum: Breakfast, Lunch, Dinner, Snacks),
  user: ObjectId (ref: User),
  nutritionInfo: Object,
  timestamps: true
}
```

---

## 🌐 Frontend Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | BasicHomePage | Landing/Home page |
| `/signup` | SignUp | Registration page |
| `/login` | Login | Login page |
| `/dashboard` | DashBoard | Main dashboard |
| `/foodLog` | FoodLog | Food log view |
| `/add-food` | CreateFoodLog | Add new food entry |
| `/nutritionInfo` | NutritionInfo | Nutrition details |
| `/profile` | Profile | User profile |
| `/createProfile` | CreateProfile | Create profile |
| `/mealPlanner` | MealPlanner | Meal planning |
| `/mealPlannerHome` | MealPlannerHome | Meal planner home |
| `/history` | History | Historical data |

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd DietTracker/backend

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
# Start the server
npm start
# OR for development with nodemon
npx nodemon index.js
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd DietTracker/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/diettracker
# OR for MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/diettracker

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Chatbot API Key (AIML API)
CHAT_API_KEY=your_aiml_api_key_here
```

---

## 📦 Dependencies

### Backend Dependencies
```json
{
  "axios": "^1.7.9",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.9.4"
}
```

### Frontend Dependencies
```json
{
  "axios": "^1.7.9",
  "chart.js": "^4.4.7",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.562.0",
  "react": "^18.3.1",
  "react-chartjs-2": "^5.3.0",
  "react-datepicker": "^9.1.0",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.1.1",
  "react-toastify": "^11.0.2"
}
```

---

## 🧩 Key Components

### Navbar
- Responsive navigation with user authentication state
- Links to all main pages
- Dynamic menu based on login status

### Dashboard
- Daily calorie progress chart (using Chart.js)
- Recent food entries
- Quick action buttons
- Progress indicators

### Food Log
- List of all logged foods
- Filter by date
- Delete functionality
- Meal type categorization

### Profile
- User information display
- Calorie requirement calculation
- Goal tracking

### Chatbot
- AI-powered diet assistant
- Conversational interface
- Health and nutrition advice

---

## 📸 Screenshots Description

The application includes the following UI sections:

1. **Landing Page**: Hero section with app introduction and call-to-action buttons
2. **Login/Signup Pages**: Clean, modern authentication forms
3. **Dashboard**: Main hub with charts, progress, and quick actions
4. **Food Log Page**: Tabular view of all food entries with date filtering
5. **Nutrition Info**: Detailed nutrition breakdown
6. **Profile Page**: User stats and health information
7. **Meal Planner**: Weekly meal planning interface
8. **History**: Historical data visualization
9. **Chatbot**: AI chat interface for diet advice

---

## 🎯 How to Use

1. **Sign Up**: Create an account on the signup page
2. **Create Profile**: Fill in your height, weight, age, gender, activity level, and goal
3. **Log Food**: Start logging your meals using the food log feature
4. **Track Progress**: View your daily/weekly progress on the dashboard
5. **Plan Meals**: Use the meal planner to plan your weekly meals
6. **Get Advice**: Use the chatbot for diet and nutrition questions
7. **View History**: Check your historical data to track long-term progress

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

Created as a MERN stack learning project.

---

## 🙏 Acknowledgments

- React Documentation
- Mongoose Documentation
- Chart.js Documentation
- Tailwind CSS Documentation