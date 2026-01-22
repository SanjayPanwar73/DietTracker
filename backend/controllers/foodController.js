const axios = require("axios");
const Food = require("../models/Food");


exports.createFood = async (req, res) => {
  const { foodName, quantity, mealType } = req.body;
  const user = req.userId;

  if (!foodName || !quantity || !mealType) {
    return res
      .status(400)
      .json({ message: "Please provide foodName, quantity, and mealType." });
  }

  try {
    // Function to fetch nutrition data
    const fetchNutritionData = async (foodName) => {
      try {
        const response = await axios.get(
          `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(foodName)}`,
          {
            headers: {
              "X-Api-Key": process.env.CALORIE_NINJAS_API_KEY, // Ensure API key is in the environment
            },
          }
        );

        return response.data.items[0]; // Use the first result from the API
      } catch (error) {
        console.error("Error fetching nutrition data:", error.message);
        return null;
      }
    };

    // Fetch base nutrition information
    const baseNutritionInfo = await fetchNutritionData(foodName);

    if (!baseNutritionInfo) {
      return res.status(500).json({
        message: "Failed to fetch nutrition data. Please try again.",
      });
    }

   

    const adjustedNutritionInfo = {
      calories: (baseNutritionInfo.calories || 0) * quantity,
      protein_g: (baseNutritionInfo.protein_g || 0) * quantity,
      fat_total_g: (baseNutritionInfo.fat_total_g || 0) * quantity,
      fat_saturated_g: (baseNutritionInfo.fat_saturated_g || 0) * quantity,
      carbohydrates_total_g: (baseNutritionInfo.carbohydrates_total_g || 0) * quantity,
      fiber_g: (baseNutritionInfo.fiber_g || 0) * quantity,
      sugar_g: (baseNutritionInfo.sugar_g || 0) * quantity,
      sodium_mg: (baseNutritionInfo.sodium_mg || 0) * quantity,
      potassium_mg: (baseNutritionInfo.potassium_mg || 0) * quantity,
      cholesterol_mg: (baseNutritionInfo.cholesterol_mg || 0) * quantity,
      serving_size_grams: quantity,
    };

    // Create new food entry
    const newFood = new Food({
      foodName,
      quantity,
      mealType,
      user,
      nutritionInfo: adjustedNutritionInfo,
    });

    await newFood.save();

    res.status(201).json({
      message: "Food item created successfully.",
      food: newFood,
    });
  } catch (err) {
    console.error("Error creating food:", err.message);
    res.status(500).json({ message: "Error creating food.", error: err.message });
  }
};



// Get All Food for a User Controller
exports.getUserFoods = async (req, res) => {
  const userId = req.userId;

  try {
    const foods = await Food.find({ user: userId }).populate("user", "username email");

    if (foods.length === 0) {
      return res.status(200).json({ message: "No food items found.", foods: [] });
    }

    res.status(200).json({ foods });
  } catch (err) {
    console.error("Error retrieving foods:", err.message);
    res.status(500).json({ message: "Error retrieving foods.", error: err.message });
  }
};

exports.deleteFood = async (req, res) => {  
  const foodId = req.params.id;
  const userId = req.userId;

  try {
    const food = await Food.findOneAndDelete({ _id: foodId, user: userId });

    if (!food) {
      return res.status(404).json({ message: "Food item not found." });
    }

    res.status(200).json({ message: "Food item deleted successfully." });
  } catch (err) {
    console.error("Error deleting food:", err.message);
    res.status(500).json({ message: "Error deleting food.", error: err.message });
  }
}