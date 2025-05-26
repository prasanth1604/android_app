// Frontend built with React + Axios + React Router

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:8000';
axios.defaults.baseURL = API_BASE;
axios.defaults.headers.post['Content-Type'] = 'application/json';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    axios.post('/logout/', {}, { headers: { Authorization: `Token ${token}` } });
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/user/profile" element={<UserProfile token={token} onLogout={handleLogout} />} />
            <Route path="/user/tasks" element={<UserTasks token={token} />} />
            <Route path="/user/apps" element={<UserApps token={token} />} />
            <Route path="/user/request" element={<UserRequest token={token} />} />
            <Route path="/admin" element={<AdminPanel token={token} />} />
            <Route path="/admin/add" element={<AddApp token={token} />} />
            <Route path="*" element={<Navigate to="/user/profile" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const res = await axios.post('/login/', { username, password });
    onLogin(res.data.token);
    navigate('/user/profile');
  };

  return (
    <div className='form-container'>
      <h2>Login</h2>
      <input className="input" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input className='input' type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className='btn' onClick={handleSubmit}>Login</button>
    </div>
  );
}

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await axios.post('/signup/', { username, password, confirm_password: confirm });
    navigate('/login');
  };

  return (
    <div className='form-container'>
      <h2>Signup</h2>
      <input className='input' placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input className='input' type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <input className='input' type="password" placeholder="Confirm Password" onChange={(e) => setConfirm(e.target.value)} />
      <button className='btn' onClick={handleSubmit}>Signup</button>
    </div>
  );
}

function UserProfile({ token, onLogout }) {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    axios.get('/api/userprofile', { headers: { Authorization: `Token ${token}` } })
      .then(res => setProfile(res.data));
  }, []);

  return (
    <div>
      <h2>User Profile</h2>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

function UserTasks({ token }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('/api/usertasks', { headers: { Authorization: `Token ${token}` } })
      .then(res => setTasks(res.data.app_names));
  }, []);

  return <div><h2>Tasks</h2><ul>{tasks.map(t => <li key={t}>{t}</li>)}</ul></div>;
}

function UserApps({ token }) {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    axios.get('/api/available_apps', { headers: { Authorization: `Token ${token}` } })
      .then(res => setApps(res.data));
  }, []);

  return (
    <div>
      <h2>Available Apps</h2>
      <ul>{apps.map(a => <li key={a.id}>{a.app_name} - {a.points} points</li>)}</ul>
    </div>
  );
}

function UserRequest({ token }) {
  const [tasks, setTasks] = useState([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    axios.get('/api/usertasks', {
      headers: { Authorization: `Token ${token}` }
    }).then(res => setTasks(res.data.app_names));
  }, [token]);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('app_name', selectedApp);
    formData.append('screenshot', screenshot);

    await axios.post('/api/userrequest', formData, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    // Optionally: clear form after submit
    setSelectedApp('');
    setScreenshot(null);
  };

  return (
    <div>
      <h2>Submit Task Proof</h2>
      <label>Select App:</label>
      <select value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}>
        <option value="">-- Choose an App --</option>
        {tasks.map((app, index) => (
          <option key={index} value={app}>{app}</option>
        ))}
      </select>
      <br />
      <label>Upload Screenshot:</label>
      <input type="file" onChange={(e) => setScreenshot(e.target.files[0])} />
      <br />
      <button onClick={handleSubmit} disabled={!selectedApp || !screenshot}>
        Submit
      </button>
    </div>
  );
}


function AdminPanel({ token }) {
  const [apps, setApps] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get('/api/admin', { headers: { Authorization: `Token ${token}` } })
      .then(res => setApps(res.data));
    axios.get('/api/adminrequest', { headers: { Authorization: `Token ${token}` } })
      .then(res => setRequests(res.data));
  }, []);

  return (
    <div>
      <h2>Admin Panel</h2>
      <h3>Apps</h3>
      <ul>{apps.map(a => <li key={a.id}>{a.app_name}</li>)}</ul>
      <h3>User Requests</h3>
      <ul>{requests.map(r => <li key={r.id}>{r.user} - {r.app} - {r.status}</li>)}</ul>
    </div>
  );
}

function AddApp({ token }) {
  const [appName, setAppName] = useState('');
  const [points, setPoints] = useState('');
  const [icon, setIcon] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('app_icon', icon);
    formData.append('app_name', appName);
    formData.append('points', points);

    await axios.post('/api/admin', formData, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    navigate('/admin');
  };

  return (
    <div>
      <h2>Add New App</h2>
      <input placeholder="App Name" onChange={(e) => setAppName(e.target.value)} />
      <input type="number" placeholder="Points" onChange={(e) => setPoints(e.target.value)} />
      <input type="file" onChange={(e) => setIcon(e.target.files[0])} />
      <button onClick={handleSubmit}>Add App</button>
    </div>
  );
}

export default App;
