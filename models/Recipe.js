const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  recipe_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  ingredients: [
    {
      name: String,
      quantity: String,
    },
  ],
  cook_time: { type: Number, required: true },
  ratings: [Number],
  reviews: [
    {
      user_id: String,
      text: String,
      date: Date,
    },
  ],
});

const Recipe = mongoose.model('Recipe', RecipeSchema);
module.exports = Recipe;
