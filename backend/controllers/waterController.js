const Water = require("../models/Water");

exports.logWater = async (req, res) => {
  const userId = req.userId;
  const { amount = 250 } = req.body;
  try {
    const newWater = new Water({ user: userId, amount });
    await newWater.save();
    res.status(201).json({ message: "Water logged successfully", water: newWater });
  } catch (err) {
    res.status(500).json({ message: "Error logging water", error: err.message });
  }
};

exports.getTodayWater = async (req, res) => {
  const userId = req.userId;
  try {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
    const todayWater = await Water.find({ user: userId, createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const totalAmount = todayWater.reduce((sum, w) => sum + w.amount, 0);
    res.status(200).json({ totalAmount, logs: todayWater, goal: 2000, percentage: Math.min((totalAmount / 2000) * 100, 100) });
  } catch (err) {
    res.status(500).json({ message: "Error fetching water", error: err.message });
  }
};

exports.deleteWaterLog = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const water = await Water.findOneAndDelete({ _id: id, user: userId });
    if (!water) return res.status(404).json({ message: "Water log not found" });
    res.status(200).json({ message: "Water log deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting water log", error: err.message });
  }
};

exports.updateWaterLog = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.userId;
  try {
    const water = await Water.findOneAndUpdate(
      { _id: id, user: userId },
      { amount },
      { new: true }
    );
    if (!water) return res.status(404).json({ message: "Water log not found" });
    res.status(200).json({ message: "Water log updated successfully", water });
  } catch (err) {
    res.status(500).json({ message: "Error updating water log", error: err.message });
  }
};