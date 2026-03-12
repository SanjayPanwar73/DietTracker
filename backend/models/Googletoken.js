const mongoose = require('mongoose');

const googleTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiryDate: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('GoogleToken', googleTokenSchema);