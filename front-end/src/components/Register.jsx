import React, { useState } from 'react';
import '../styles/Register.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from './NavBar2';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // clear error on change
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => {
    const pwErrors = [];
    if (password.length < 8) pwErrors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) pwErrors.push('an uppercase letter');
    if (!/[a-z]/.test(password)) pwErrors.push('a lowercase letter');
    if (!/\d/.test(password)) pwErrors.push('a number');
    if (!/[@$!%*?&]/.test(password)) pwErrors.push('a special character');
    return pwErrors;
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!isValidEmail(form.email)) newErrors.email = 'Invalid email format';

    if (!form.password) newErrors.password = 'Password is required';
    else {
      const pwErrors = validatePassword(form.password);
      if (pwErrors.length > 0)
        newErrors.password = `Password must include ${pwErrors.join(', ')}`;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await api.post('/auth/register', form);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <div className="register-page">
      <Navbar/>
      <form className="register-container" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        <label>Name</label>
        <input
          type="text"
          name="username"
          placeholder="Enter your name"
          value={form.username}
          onChange={handleChange}
        />
        {errors.username && <span className="error">{errors.username}</span>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <label>Password</label>
        <div className="password-input">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <span className="error">{errors.password}</span>}

        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="instructor">Course Instructor</option>
        </select>

        <button type="submit" className="signup-btn">Sign up</button>

        {errors.submit && <span className="error submit-error">{errors.submit}</span>}

        <hr />

        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
