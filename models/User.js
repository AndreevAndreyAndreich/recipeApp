// models/User.js
const mongoose = require('mongoose');

// Создаем схему пользователя
const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  preferences: {
    type: [String],
    default: [],
  },
  favorites: {
    type: [String],
    default: [],
  },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
