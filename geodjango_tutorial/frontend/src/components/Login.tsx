import React, { useState } from 'react';
import Axios from '../services/Axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; // Add a shared CSS file for styling

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await Axios.post('login/', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      navigate('/map');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login to <span className="highlight">Event Hub</span></h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
        <p className="redirect-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
