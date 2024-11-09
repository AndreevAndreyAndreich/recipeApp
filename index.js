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
    const { userId, name, email, password } = req.body;

    // Проверьте, все ли обязательные поля пришли
    if (!userId || !name || !email || !password) {
      return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля.' });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const newUser = new User({
      user_id: userId,
      name,
      email,
      password: hashedPassword,
    });

    // Сохранение пользователя в базе данных
    await newUser.save();
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован!' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка на сервере при регистрации' });
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
    const userId = req.params.userId;
    const user = await User.findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Найти рецепты, которые похожи на те, что в избранном
    const favoriteRecipes = await Recipe.find({ _id: { $in: user.favorites } });

    // Собираем категории и ингредиенты, чтобы найти похожие рецепты
    let categories = new Set();
    let ingredients = new Set();

    favoriteRecipes.forEach(recipe => {
      categories.add(recipe.category);
      recipe.ingredients.forEach(ingredient => ingredients.add(ingredient.name));
    });

    // Найти похожие рецепты по категориям или ингредиентам
    const recommendations = await Recipe.find({
      $or: [
        { category: { $in: Array.from(categories) } },
        { 'ingredients.name': { $in: Array.from(ingredients) } }
      ],
      _id: { $nin: user.favorites } // Исключаем уже добавленные в избранное
    });

    res.json(recommendations);
  } catch (error) {
    console.error('Ошибка при получении рекомендаций:', error);
    res.status(500).json({ error: 'Ошибка на сервере при получении рекомендаций' });
  }
});
