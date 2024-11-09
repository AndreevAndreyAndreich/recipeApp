import React, { useEffect, useState } from 'react';
import { getRecipes, getRecommendationsBasedOnFavorites, addRecipeToFavorites, getUserRecommendations } from './api/api';
import Fuse from 'fuse.js';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId] = useState('user003');

  useEffect(() => {
    getRecipes()
      .then((data) => {
        console.log('Полученные рецепты:', data);
        setRecipes(data);
        setFilteredRecipes(data);
      })
      .catch((err) => console.error(err));
  }, [userId]);

  useEffect(() => {
    getUserRecommendations(userId)
      .then((data) => {
        console.log('Полученные рекомендации:', data);
        setRecommendations(data.data);
      })
      .catch((err) => console.error('Ошибка при получении рекомендаций:', err));
  }, [userId]);

  const handleAddToFavorites = async (recipeId) => {
    try {
      await addRecipeToFavorites(userId, recipeId);
      alert('Рецепт добавлен в избранное!');
      
      // Обновить рекомендации после добавления в избранное
      const recommendations = await getRecommendationsBasedOnFavorites(userId);
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Ошибка при добавлении в избранное:', error);
    }
  };
  

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredRecipes(recipes);
      return;
    }

    const options = {
      keys: ['name', 'ingredients.name'],
      threshold: 0.4
    };
    const fuse = new Fuse(recipes, options);
    const result = fuse.search(searchQuery);
    setFilteredRecipes(result.map(resultItem => resultItem.item));
  };

  return (
    <Router>
      <div className="App">
        <header className="header">
          <div className="header-content">
            <h1 className="catalog-title">Каталог Рецептов</h1>
            <div className="menu-buttons">
              <Link to="/">
                <button className="home-button">На главную</button>
              </Link>
              <Link to="/signin">
                <button className="sign-in-button">Вход</button>
              </Link>
              <Link to="/signup">
                <button className="sign-up-button">Регистрация</button>
              </Link>
            </div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Поиск рецептов или ингредиентов..."
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
            <button onClick={handleSearch}>Поиск</button>
          </div>
        </header>
        
        <Routes>
          <Route path="/" element={
            <>
              <div className="recommended-block">
                <h2>Рекомендованные Рецепты</h2>
                {Array.isArray(recommendations) && recommendations.length === 0 ? (
                  <p>Нет рекомендаций для отображения.</p>
                ) : (
                  <div className="recommended-recipes">
                    {Array.isArray(recommendations) && recommendations.slice(0, 3).map((recipe) => (
                      <div key={recipe.recipe_id} className="recommended-recipe-card">
                        <h4>{recipe.name}</h4>
                        <p><strong>Категория:</strong> {recipe.category}</p>
                        <button onClick={() => handleAddToFavorites(recipe.recipe_id)}>
                          Добавить в избранное
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="recipe-catalog">
                {recipes.length === 0 ? (
                  <p>Нет рецептов для отображения.</p>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <div key={recipe.recipe_id} className="recipe-card">
                      <h3>{recipe.name}</h3>
                      <p><strong>Категория:</strong> {recipe.category}</p>
                      <p><strong>Время приготовления:</strong> {recipe.cook_time} минут</p>
                      <p><strong>Ингредиенты:</strong></p>
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
            </>
          } />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
