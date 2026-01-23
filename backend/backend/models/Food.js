const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number, // Changed to Number for better data handling
    required: true,
  },
  mealType: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'], // Define possible values
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Link food to user
    required: true,
  },
  nutritionInfo: {
    type: Object,
  },
}, {
  timestamps: true,
});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
