import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googleIcon from '../assets/google-icon.jpg';
import '../styles/Login.css';
import api from '../utils/api';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      const { user, token, message } = res.data;

      alert(message);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate based on role
      if (user.role === 'student') {
        navigate('/student');
      } else if (user.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
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

          <a href="#" className="forgot-password">Forgot Password?</a>

          <button type="submit" className="login-button">Log in</button>
        </form>

        <div className="divider">
          <hr /><span>or</span><hr />
        </div>

        <div className="login-options">
          <button className="google-login" type="button">
            <img src={googleIcon} alt="Google" />
            Google
          </button>
        </div>

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
