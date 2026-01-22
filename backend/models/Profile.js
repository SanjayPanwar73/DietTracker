const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Every profile is tied to a user
    },
    height: {
        type: Number,
        required: true, // Height in cm
        min: 50,
        max: 300,
    },
    weight: {
        type: Number,
        required: true, // Weight in kg
        min: 2,
        max: 500,
    },
    age: {
        type: Number,
        required: true,
        min: 1,
        max: 120,
    },
    activityLevel: {
        type: String,
        required: true,
        enum: [
            'sedentary',           // Little or no exercise
            'lightly active',      // Exercise 1-3 times/week
            'moderately active',   // Exercise 4-5 times/week
            'very active',         // Daily exercise or intense exercise 3-4 times/week
            'extra active',        // Intense exercise 6-7 times/week
            'super active',        // Very intense exercise daily or physical job
        ],
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'], // Gender is often required for BMR calculation
    },
    goal: {
        type: String,
        enum: ['weight loss', 'maintenance', 'weight gain'], // User's health goal
        default: 'maintenance',
    },  
    calorieRequirement: {
        type: Number, // Store fetched calorie requirement
        default: null, // Initialize as null until fetched
    },
}, { timestamps: true }); // Adds createdAt and updatedAt

module.exports = mongoose.model('Profile', ProfileSchema);
