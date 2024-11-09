// models/User.js 
const mongoose = require('mongoose');

// Создаем схему пользователя
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: { type: [String], default: [] } // Добавляем поле избранного
});

const User = mongoose.model('User', UserSchema);
module.exports = User;