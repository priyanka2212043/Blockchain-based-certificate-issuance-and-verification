import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googleIcon from '../assets/google-icon.jpg';
import '../styles/Login.css';
import api from '../utils/api';
import Navbar from './NavBar2';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { user, token, message } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      alert(message || 'Login successful!');

      if (user.role === 'student') {
        navigate('/student', { state: { email: user.email } });
      } else if (user.role === 'instructor') {
        navigate('/instructor', { state: { email: user.email } });
      } else {
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password'); // ✅ new page
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google'; 
    // 🔗 replace with your backend Google OAuth route
  };

  return (
    <div className="login-container">
      <Navbar/>
      <div className="login-box">
        <h2>Log In</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <span
            className="forgot-password"
            onClick={handleForgotPassword}
            style={{ cursor: 'pointer', color: '#58a6ff' }}
          >
            Forgot Password?
          </span>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="create-account">
          New to Certichain?{' '}
          <span
            onClick={handleRegisterClick}
            style={{ color: '#58a6ff', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;