const Profile = require("../models/Profile");

// Helper function to calculate calories (to avoid repeating code)
const calculateCalories = (height, weight, age, gender, activityLevel, goal) => {
    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    let tdee;
    const factors = {
        'sedentary': 1.2,
        'lightly active': 1.375,
        'moderately active': 1.55,
        'very active': 1.725,
        'extra active': 1.9,
        'super active': 2.0
    };

    tdee = bmr * (factors[activityLevel.toLowerCase()] || 1.2);

    if (goal.toLowerCase() === 'weight loss') return tdee - 500;
    if (goal.toLowerCase() === 'weight gain') return tdee + 500;
    return tdee;
};

// 1. Create Profile
exports.createProfile = async (req, res) => {
    const { height, weight, age, activityLevel, gender, goal } = req.body;
    const user = req.userId;

    if (!activityLevel) return res.status(400).json({ success: false, message: 'Activity level is required' });

    try {
        const calorieRequirement = calculateCalories(height, weight, age, gender, activityLevel, goal);

        const profile = new Profile({
            user, height, weight, age, activityLevel, gender, goal, calorieRequirement,
        });

        await profile.save();
        res.status(201).json({ success: true, message: 'Profile created successfully', profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Profile
exports.getProfile = async (req, res) => {
    const user = req.userId;
    try {
        const profile = await Profile.findOne({ user }).populate("user");
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
        res.status(200).json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. UPDATE Profile (NEW LOGIC)
exports.updateProfile = async (req, res) => {
    const user = req.userId;
    const { height, weight, age, activityLevel, gender, goal } = req.body;

    try {
        // Pehle check karein ki profile exist karti hai
        let profile = await Profile.findOne({ user });
        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        // Nayi calories calculate karein based on updated numbers
        const calorieRequirement = calculateCalories(
            height || profile.height,
            weight || profile.weight,
            age || profile.age,
            gender || profile.gender,
            activityLevel || profile.activityLevel,
            goal || profile.goal
        );

        // Database mein update karein
        profile = await Profile.findOneAndUpdate(
            { user },
            { 
                height, weight, age, activityLevel, gender, goal, calorieRequirement 
            },
            { new: true, runValidators: true }
        ).populate("user");

        res.status(200).json({ 
            success: true, 
            message: "Profile updated and calories recalculated!", 
            profile 
        });
    } catch (error) {
        console.error("Update Error:", error.message);
        res.status(500).json({ success: false, message: "Server error during update" });
    }
};