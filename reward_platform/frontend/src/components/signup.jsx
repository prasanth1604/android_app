import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Pass a custom header to indicate no auth for this request
      await axiosInstance.post('/auth/signup/', { username, password, first_name: firstName, last_name: lastName, email }, { headers: { includeAuth: false } });
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.detail || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={styles.input} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
        <input type="text" placeholder="First Name (Optional)" value={firstName} onChange={e => setFirstName(e.target.value)} style={styles.input} />
        <input type="text" placeholder="Last Name (Optional)" value={lastName} onChange={e => setLastName(e.target.value)} style={styles.input} />
        <input type="email" placeholder="Email (Optional)" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} />
        <button type="submit" style={styles.button}>Signup</button>
      </form>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <p style={styles.linkText}>Already have an account? <Link to="/login" style={styles.link}>Login</Link></p>
    </div>
  );
};

export default Signup;