const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["cardio", "strength", "flexibility", "sports", "other"],
      default: "other",
    },
    duration: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, required: true, min: 0 },
    intensity: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "moderate",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Exercise", ExerciseSchema);
