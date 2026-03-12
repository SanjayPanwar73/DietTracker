const mongoose = require('mongoose');

const fitnessDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  steps: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  distance: { type: Number, default: 0 }, // meters
  activeMinutes: { type: Number, default: 0 },
}, { timestamps: true });

fitnessDataSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FitnessData', fitnessDataSchema);