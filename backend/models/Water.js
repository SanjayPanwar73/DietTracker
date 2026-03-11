const mongoose = require("mongoose");

const waterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 250,
  },
}, {
  timestamps: true,
});

const Water = mongoose.model("Water", waterSchema);

module.exports = Water;