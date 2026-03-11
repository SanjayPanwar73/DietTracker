const Exercise = require("../models/Exercise");

exports.logExercise = async (req, res) => {
  const userId = req.userId;
  const { name, category, duration, caloriesBurned, intensity, notes } = req.body;
  try {
    const newExercise = new Exercise({ user: userId, name, category, duration, caloriesBurned, intensity, notes });
    await newExercise.save();
    res.status(201).json({ message: "Exercise logged successfully", exercise: newExercise });
  } catch (err) {
    res.status(500).json({ message: "Error logging exercise", error: err.message });
  }
};

exports.getAllExercises = async (req, res) => {
  const userId = req.userId;
  try {
    const exercises = await Exercise.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ exercises });
  } catch (err) {
    res.status(500).json({ message: "Error fetching exercises", error: err.message });
  }
};

exports.getTodayExercises = async (req, res) => {
  const userId = req.userId;
  try {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
    const todayExercises = await Exercise.find({ user: userId, createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const totalCalories = todayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
    const totalDuration = todayExercises.reduce((sum, e) => sum + e.duration, 0);
    res.status(200).json({ totalCalories, totalDuration, logs: todayExercises });
  } catch (err) {
    res.status(500).json({ message: "Error fetching today exercises", error: err.message });
  }
};

exports.deleteExercise = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const exercise = await Exercise.findOneAndDelete({ _id: id, user: userId });
    if (!exercise) return res.status(404).json({ message: "Exercise not found" });
    res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting exercise", error: err.message });
  }
};

exports.updateExercise = async (req, res) => {
  const { id } = req.params;
  const { duration, caloriesBurned } = req.body;
  const userId = req.userId;
  try {
    const exercise = await Exercise.findOneAndUpdate(
      { _id: id, user: userId },
      { duration, caloriesBurned },
      { new: true }
    );
    if (!exercise) return res.status(404).json({ message: "Exercise not found" });
    res.status(200).json({ message: "Exercise updated successfully", exercise });
  } catch (err) {
    res.status(500).json({ message: "Error updating exercise", error: err.message });
  }
};