import React, { useState } from 'react';
import axios from 'axios';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const response = await axios.post('http://localhost:3000/login', { email, password });
      alert('Успешная авторизация');
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      console.error('Ошибка при авторизации:', error.response.data.message);
      alert('Ошибка при авторизации: ' + error.response.data.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Авторизация</h2>
        <form>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={handleSignIn}>Войти</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;