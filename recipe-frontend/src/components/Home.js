import React, { useEffect, useState } from 'react'; // Импортируем React и хуки useState, useEffect
import { getRecipes, getUserRecommendations, addRecipeToFavorites } from '../api/api'; // Импортируем методы из API
import Fuse from 'fuse.js'; // Импортируем Fuse.js для поиска

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userId] = useState('user003');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  useEffect(() => {
    // Получить все рецепты при загрузке компонента
    getRecipes()
      .then((data) => {
        console.log('Полученные рецепты:', data);
        setRecipes(data);
        setFilteredRecipes(data);
      })
      .catch((err) => console.error(err));
  }, [userId]);

  useEffect(() => {
    // Получить рекомендации для пользователя
    getUserRecommendations(userId)
      .then((data) => {
        console.log('Полученные рекомендации:', data);
        setRecommendations(data);
      })
      .catch((err) => console.error('Ошибка при получении рекомендаций:', err));
  }, [userId]);

  const handleAddToFavorites = (recipeId) => {
    addRecipeToFavorites(userId, recipeId)
      .then(() => {
        alert('Рецепт добавлен в избранное!');
      })
      .catch(err => console.error(err));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setFilteredRecipes(recipes);
      return;
    }

    const fuse = new Fuse(recipes, {
      keys: ['name', 'ingredients.name'],
      includeScore: true,
      threshold: 0.4,
    });

    const results = fuse.search(e.target.value);
    setFilteredRecipes(results.map(result => result.item));
  };

  return (
    <div className="Home">
      <h1>Каталог Рецептов</h1>
      
      {/* Поле поиска */}
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Поиск..." 
          value={searchQuery}
          onChange={handleSearch}
        />
        <button>Поиск</button>
      </div>

      {/* Рекомендованные рецепты */}
      <h2>Рекомендованные Рецепты</h2>
      <div className="recommendations">
        {recommendations.map((recipe) => (
          <div key={recipe.recipe_id} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>Категория: {recipe.category}</p>
            <button onClick={() => handleAddToFavorites(recipe.recipe_id)}>
              Добавить в избранное
            </button>
          </div>
        ))}
      </div>

      {/* Каталог рецептов */}
      <h2>Все Рецепты</h2>
      <div className="recipes">
        {filteredRecipes.length === 0 ? (
          <p>Нет рецептов для отображения.</p>
        ) : (
          filteredRecipes.map((recipe) => (
            <div key={recipe.recipe_id} className="recipe-card">
              <h3>{recipe.name}</h3>
              <p>Категория: {recipe.category}</p>
              <p>Время приготовления: {recipe.cook_time} минут</p>
              <h4>Ингредиенты:</h4>
              <ul>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.name} — {ingredient.quantity}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleAddToFavorites(recipe.recipe_id)}>
                Добавить в избранное
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
