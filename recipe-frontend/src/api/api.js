// src/api/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getRecipes = async () => {
    try {
      const response = await axios.get(`${API_URL}/recipes`);
      return response.data;
    } catch (err) {
      console.error('Ошибка при получении рецептов:', err);
      return [];
    }
  };
  

export const getUserRecommendations = async (userId) => {
  return await axios.get(`${API_URL}/users/${userId}/recommendations`);
};

export const addRecipeToFavorites = async (userId, recipeId) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/users/${userId}/favorites`,
      { recipeId },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};