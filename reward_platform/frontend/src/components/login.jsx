import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Pass a custom header to indicate no auth for this request
      const response = await axiosInstance.post('/auth/login/', { username, password }, { headers: { includeAuth: false } });
      localStorage.setItem('token', response.data.token);
      // Fetch user profile to determine admin status
      const userProfile = await axiosInstance.get('/users/me/');
      localStorage.setItem('isAdmin', userProfile.data.user.is_staff); // Assuming backend sends is_staff
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || 'Login failed. Invalid credentials.');
      console.error('Login error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={styles.input} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
        <button type="submit" style={styles.button}>Login</button>
      </form>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <p style={styles.linkText}>Don't have an account? <Link to="/signup" style={styles.link}>Signup</Link></p>
    </div>
  );
};

export default Login;