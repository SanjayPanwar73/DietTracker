const Profile = require("../models/Profile");

exports.createProfile = async (req, res) => {
    const { height, weight, age, activityLevel, gender, goal } = req.body;
    const user = req.userId;
    // Check if activityLevel is missing
    if (!activityLevel) {
        return res.status(400).json({ success: false, message: 'Activity level is required' });
    }

    try {
        // Calculate BMR
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else if (gender === 'female') {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        } else {
            return res.status(400).json({ success: false, message: 'Invalid gender' });
        }

        // Apply activity level factor
        let tdee;
        switch (activityLevel) {
            case 'sedentary':
                tdee = bmr * 1.2;
                break;
            case 'lightly active':
                tdee = bmr * 1.375;
                break;
            case 'moderately active':
                tdee = bmr * 1.55;
                break;
            case 'very active':
                tdee = bmr * 1.725;
                break;
            case 'extra active':
                tdee = bmr * 1.9;
                break;
            case 'super active':
                tdee = bmr * 2.0;
                break;
            default:
                throw new Error("Invalid activity level");
        }

        // Adjust calorie intake based on goal
        let calorieRequirement;
        if (goal === 'weight loss') {
            calorieRequirement = tdee - 500;
        } else if (goal === 'weight gain') {
            calorieRequirement = tdee + 500;
        } else {
            calorieRequirement = tdee; // For maintenance
        }

        // Create a new profile and save it to the database
        const profile = new Profile({
            user,
            height,
            weight,
            age,
            activityLevel,
            gender,
            goal,
            calorieRequirement,
        });

        await profile.save();

        res.status(201).json({ success: true, message: 'Profile created successfully', profile });
    } catch (error) {
        console.error("Error creating profile:", error.message);
        res.status(500).json({ success: false, message: 'Failed to create profile', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    const user = req.userId;  // Assuming the userId is available from the request (e.g., from JWT token)

    try {
        const profile = await Profile.findOne({ user })
            .populate("user");  // Populating the 'user' reference in the profile document

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
    }
}
