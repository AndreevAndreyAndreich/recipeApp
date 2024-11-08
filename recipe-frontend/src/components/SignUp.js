import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

function SignUp() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/register', {
                username, // Добавлено поле username
                email,
                password,
            });
            alert('Регистрация успешна!');
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            alert('Ошибка при регистрации: ' + (error.response?.data || 'Неизвестная ошибка'));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Регистрация</h2>
                <form onSubmit={handleSignUp}>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Зарегистрироваться</button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
