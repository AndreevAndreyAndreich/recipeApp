const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

// Регистрация пользователя
app.post('/register', async (req, res) => {
  try {
    console.log(req.body); // Добавьте для отладки
    // Здесь должна быть логика регистрации пользователя (например, создание пользователя в базе данных)
    res.status(201).send({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).send({ error: 'Ошибка на сервере при регистрации' });
  }
});


// Авторизация пользователя
app.post('/login', [
  check('email', 'Введите корректный email').isEmail(),
  check('password', 'Введите пароль').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    const token = jwt.sign({ userId: user.id }, 'секретный_ключ', { expiresIn: '1h' });

    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

// Подключение к MongoDB с использованием Mongoose
mongoose.connect('mongodb://localhost:27017/recipeApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Подключение к MongoDB успешно'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));


// Базовый маршрут для проверки сервера
app.get('/', (req, res) => {
  res.send('Recipe App Server работает!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

app.post('/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).send(newUser);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Получение всех рецептов
app.get('/recipes', async (req, res) => {
    try {
      const recipes = await Recipe.find();
      res.send(recipes);
    } catch (err) {
      res.status(500).send(err);
    }
});

// Получение рецепта по ID
app.get('/recipes/:id', async (req, res) => {
    try {
      const recipe = await Recipe.findOne({ recipe_id: req.params.id });
      if (!recipe) {
        return res.status(404).send({ message: 'Рецепт не найден' });
      }
      res.send(recipe);
    } catch (err) {
      res.status(500).send(err);
    }
});
  
// Добавление нового рецепта
app.post('/recipes', async (req, res) => {
    try {
      const newRecipe = new Recipe(req.body);
      await newRecipe.save();
      res.status(201).send(newRecipe);
    } catch (err) {
      res.status(400).send(err);
    }
    });
  
// Добавление рецепта в избранное
app.post('/users/:userId/favorites', async (req, res) => {
  try {
    const { userId } = req.params;
    const { recipeId } = req.body;

    console.log('Полученный userId:', userId);
    console.log('Полученный recipeId:', recipeId);

    if (!recipeId) {
      console.log('recipeId отсутствует');
      return res.status(400).json({ message: 'recipeId is required' });
    }

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      console.log('Пользователь не найден');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }

    res.status(200).json({ message: 'Recipe added to favorites' });
  } catch (error) {
    console.error('Ошибка при добавлении рецепта в избранное:', error);
    res.status(500).json({ message: 'Error adding recipe to favorites', error });
  }
});

  // Добавление отзыва и оценки для рецепта
app.post('/recipes/:id/reviews', async (req, res) => {
    try {
      const recipe = await Recipe.findOne({ recipe_id: req.params.id });
      if (!recipe) {
        return res.status(404).send({ message: 'Рецепт не найден' });
      }
      const newReview = {
        user_id: req.body.user_id,
        text: req.body.text,
        date: new Date()
      };
      recipe.reviews.push(newReview);
      recipe.ratings.push(req.body.rating);
      await recipe.save();
      res.send(recipe);
    } catch (err) {
      res.status(400).send(err);
    }
});
  
app.get('/users/:userId/recommendations', async (req, res) => {
    try {
      // Найти пользователя по ID
      const user = await User.findOne({ user_id: req.params.userId });
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
  
      // Определить предпочтения пользователя (категории и ингредиенты)
      const userPreferences = user.preferences;
  
      // Найти рецепты, которые соответствуют предпочтениям пользователя
      const recommendedRecipes = await Recipe.find({
        $or: [
          { category: { $in: userPreferences } },
          { "ingredients.name": { $in: userPreferences } }
        ]
      });
  
      // Убрать рецепты, которые пользователь уже добавил в избранное
      const filteredRecipes = recommendedRecipes.filter(recipe => !user.favorites.includes(recipe.recipe_id));
  
      res.send(filteredRecipes);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  