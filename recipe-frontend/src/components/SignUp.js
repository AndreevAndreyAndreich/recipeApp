import axios from 'axios';
import React, { useState } from 'react';
import './Auth.css';

const SignUp = () => {
  const [userID, setUserID] = useState('');
  const [name, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/register', {
        userID,
        name,
        email,
      });
      alert('Регистрация успешна!');
    } catch (error) {
      console.error('Ошибка при регистрации:', error.response ? error.response.data : error.message);
      alert(`Ошибка при регистрации: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Регистрация</h2>
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="userID"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
          />
          <input
            type="text"
            placeholder="Имя пользователя"
            value={name}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
