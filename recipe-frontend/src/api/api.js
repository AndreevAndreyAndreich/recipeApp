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
  
// Получение рекомендаций на основе избранных рецептов пользователя
export const getRecommendationsBasedOnFavorites = async (userId) => {
  const response = await axios.get(`http://localhost:3000/users/${userId}/recommendations`);
  return response.data;
};

// Добавление рецепта в избранное
export const addRecipeToFavorites = async (userId, recipeId) => {
  try {
    const response = await axios.post(`http://localhost:3000/users/${userId}/favorites`, {
      recipeId,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при добавлении в избранное:", error);
    throw error; // Прокидываем ошибку, чтобы она была обработана в вызывающем коде
  }
};


export const getUserRecommendations = async (userId) => {
  const response = await axios.get(`http://localhost:3000/users/${userId}/recommendations`);
  return response.data;
};