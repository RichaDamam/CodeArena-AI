const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 1200,
  },
  level: {
    type: Number,
    default: 1,
  },
  skillProfile: {
    type: Map,
    of: Number,
    default: {
      "Arrays": 0,
      "Strings": 0,
      "Math": 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('User', UserSchema);
