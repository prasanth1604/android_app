import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios'; // Import axios

// --- Axios Setup ---
const API_BASE_URL = 'http://localhost:8000/api'; // IMPORTANT: Adjust this to your Django backend URL

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token for authenticated requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Only add Authorization header if it's explicitly needed or not overridden
    if (config.headers.includeAuth !== false) { // Custom header to control auth
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    // Remove the custom header so it doesn't get sent to the backend
    delete config.headers.includeAuth;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for consistent error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ detail: 'No response from server. Network error or server is down.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({ detail: error.message });
    }
  }
);


// --- 2. Auth/Signup.js ---
const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); // NEW: State for confirm password
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Pass a custom header to indicate no auth for this request
      await axiosInstance.post(
        '/auth/signup/',
        {
          username,
          password,
          password_confirm: passwordConfirm, // NEW: Include password_confirm
          first_name: firstName,
          last_name: lastName,
          email,
        },
        { headers: { includeAuth: false } }
      );
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      // Handle backend validation errors more specifically
      if (err.username) {
        setError(`Username: ${err.username[0]}`);
      } else if (err.password) {
        setError(`Password: ${err.password[0]}`);
      } else if (err.password_confirm) {
        setError(`Confirm Password: ${err.password_confirm[0]}`);
      } else {
        setError(err.detail || 'Signup failed. Please try again.');
      }
      console.error('Signup error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={styles.input} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
        <input type="password" placeholder="Confirm Password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required style={styles.input} /> {/* NEW: Confirm Password input */}
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

// --- 3. Auth/Login.js ---
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

// --- 4. Navbar.js ---
const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login'; // Simple redirect
  };

  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}><Link to="/" style={styles.navLink}>Home</Link></li>
        {!isLoggedIn ? (
          <>
            <li style={styles.navItem}><Link to="/login" style={styles.navLink}>Login</Link></li>
            <li style={styles.navItem}><Link to="/signup" style={styles.navLink}>Signup</Link></li>
          </>
        ) : (
          <>
            <li style={styles.navItem}><Link to="/dashboard" style={styles.navLink}>Dashboard</Link></li>
            <li style={styles.navItem}><Link to="/profile" style={styles.navLink}>Profile</Link></li>
            {isAdmin && (
              <>
                <li style={styles.navItem}><Link to="/admin/apps" style={styles.navLink}>Manage Apps</Link></li>
                <li style={styles.navItem}><Link to="/admin/tasks" style={styles.navLink}>Review Tasks</Link></li>
              </>
            )}
            <li style={styles.navItem}><button onClick={handleLogout} style={styles.logoutButton}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

// --- 5. User/Dashboard.js ---
const Dashboard = () => {
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axiosInstance.get('/apps/');
        setApps(response.data);
      } catch (err) {
        setError(err.detail || 'Failed to load apps.');
        console.error('Error fetching apps:', err);
      }
    };
    fetchApps();
  }, []);

  const handleStartTask = async (appId) => {
    setError('');
    try {
      const response = await axiosInstance.post('/tasks/create/', { app: appId });
      alert(`Task for App ID ${appId} created! Now upload screenshot.`);
      window.location.href = `/upload/${response.data.id}`; // Redirect to upload with task ID
    } catch (err) {
      setError(err.detail || 'Failed to start task.');
      console.error('Error creating task:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <h3>Available Apps</h3>
      {apps.length === 0 ? (
        <p>No apps available.</p>
      ) : (
        <ul style={styles.list}>
          {apps.map(app => (
            <li key={app.id} style={styles.listItem}>
              {app.name} - {app.points} Points
              <button onClick={() => handleStartTask(app.id)} style={styles.smallButton}>Download & Upload</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- 6. User/Profile.js ---
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/users/me/');
        setProfile(response.data);
        setFirstName(response.data.user.first_name || '');
        setLastName(response.data.user.last_name || '');
        // Update isAdmin status in localStorage based on fetched profile
        localStorage.setItem('isAdmin', response.data.user.is_staff);
      } catch (err) {
        setError(err.detail || 'Failed to load profile.');
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setError('');
    try {
      await axiosInstance.put('/users/me/', { first_name: firstName, last_name: lastName });
      alert('Profile updated!');
      // Re-fetch profile to update UI with latest data
      const response = await axiosInstance.get('/users/me/');
      setProfile(response.data);
      setFirstName(response.data.user.first_name || '');
      setLastName(response.data.user.last_name || '');
    } catch (err) {
      setError(err.detail || 'Failed to update profile.');
      console.error('Error updating profile:', err);
    }
  };

  if (!profile) return <div style={styles.container}><p>Loading profile...</p></div>;

  return (
    <div style={styles.container}>
      <h2>Your Profile</h2>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <div style={styles.profileInfo}>
        <p><strong>Username:</strong> {profile.user.username}</p>
        <p><strong>Full Name:</strong> {profile.user.first_name} {profile.user.last_name}</p>
        <p><strong>Points Earned:</strong> {profile.points_earned}</p>
        <p><strong>Admin Status:</strong> {profile.user.is_staff ? 'Yes' : 'No'}</p>
      </div>
      <h3 style={{marginTop: '20px'}}>Edit Profile</h3>
      <div style={styles.form}>
        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} style={styles.input} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} style={styles.input} />
        <button onClick={handleUpdateProfile} style={styles.button}>Save Changes</button>
      </div>
    </div>
  );
};

// --- 7. User/UploadScreenshot.js ---
const UploadScreenshot = () => {
  const { taskId } = useParams(); // Now expecting taskId from the URL
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }, // Accept all image types
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a screenshot.');
      return;
    }

    const formData = new FormData();
    formData.append('screenshot', file);

    setError('');
    try {
      // Axios automatically sets Content-Type for FormData
      await axiosInstance.post(`/tasks/${taskId}/screenshots/`, formData);
      alert('Screenshot uploaded successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || 'Failed to upload screenshot.');
      console.error('Upload error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload Screenshot for Task ID: {taskId}</h2>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <div {...getRootProps()} style={styles.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the screenshot here ...</p>
        ) : (
          <p>Drag 'n' drop your screenshot here, or click to select file</p>
        )}
        {file && <p>Selected file: {file.name}</p>}
      </div>
      {file && <button onClick={handleUpload} style={styles.button}>Upload Screenshot</button>}
    </div>
  );
};

// --- 8. Admin/AdminApps.js ---
const AdminApps = () => {
  const [apps, setApps] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [error, setError] = useState('');

  const fetchApps = async () => {
    try {
      const response = await axiosInstance.get('/admin/apps/');
      setApps(response.data);
    } catch (err) {
      setError(err.detail || 'Failed to load apps.');
      console.error('Error fetching admin apps:', err);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleAddApp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosInstance.post('/admin/apps/', { name: newName, points: parseInt(newPoints) });
      setNewName('');
      setNewPoints('');
      fetchApps(); // Refresh list
    } catch (err) {
      setError(err.detail || 'Failed to add app.');
      console.error('Error adding app:', err);
    }
  };

  const handleDeleteApp = async (id) => {
    setError('');
    if (window.confirm('Are you sure you want to delete this app?')) {
      try {
        await axiosInstance.delete(`/admin/apps/${id}/`);
        fetchApps(); // Refresh list
      } catch (err) {
        setError(err.detail || 'Failed to delete app.');
        console.error('Error deleting app:', err);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Manage Apps</h2>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <h3 style={{marginTop: '20px'}}>Add New App</h3>
      <form onSubmit={handleAddApp} style={styles.form}>
        <input type="text" placeholder="App Name" value={newName} onChange={e => setNewName(e.target.value)} required style={styles.input} />
        <input type="number" placeholder="Points" value={newPoints} onChange={e => setNewPoints(e.target.value)} required style={styles.input} />
        <button type="submit" style={styles.button}>Add App</button>
      </form>
      <h3 style={{marginTop: '20px'}}>Current Apps</h3>
      {apps.length === 0 ? (
        <p>No apps added yet.</p>
      ) : (
        <ul style={styles.list}>
          {apps.map(app => (
            <li key={app.id} style={styles.listItem}>
              {app.name} - {app.points} Points
              <button onClick={() => handleDeleteApp(app.id)} style={styles.smallButton}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- 9. Admin/AdminTasks.js ---
const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/admin/tasks/');
      setTasks(response.data);
    } catch (err) {
      setError(err.detail || 'Failed to load tasks.');
      console.error('Error fetching admin tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleApprove = async (taskId) => {
    setError('');
    try {
      await axiosInstance.post(`/admin/tasks/${taskId}/approve/`, {});
      alert('Task approved!');
      fetchTasks(); // Refresh list
    } catch (err) {
      setError(err.detail || 'Failed to approve task.');
      console.error('Error approving task:', err);
    }
  };

  const handleReject = async (taskId) => {
    setError('');
    if (window.confirm('Are you sure you want to reject this task?')) {
      try {
        await axiosInstance.post(`/admin/tasks/${taskId}/reject/`, {});
        alert('Task rejected!');
        fetchTasks(); // Refresh list
      } catch (err) {
        setError(err.detail || 'Failed to reject task.');
        console.error('Error rejecting task:', err);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Review Submitted Tasks</h2>
      {error && <p style={styles.errorMessage}>{error}</p>}
      {tasks.length === 0 ? (
        <p>No tasks submitted for review.</p>
      ) : (
        <ul style={styles.list}>
          {tasks.map(task => (
            <li key={task.id} style={styles.listItem}>
              <p><strong>User:</strong> {task.user}</p>
              <p><strong>App:</strong> {task.app}</p>
              {task.screenshot && (
                <img src={task.screenshot} alt="Screenshot" style={styles.screenshot} />
              )}
              <p><strong>Submitted At:</strong> {new Date(task.completed_at).toLocaleString()}</p>
              {!task.is_approved && (
                <div style={styles.buttonGroup}>
                  <button onClick={() => handleApprove(task.id)} style={styles.smallButton}>Approve</button>
                  <button onClick={() => handleReject(task.id)} style={styles.smallButton}>Reject</button>
                </div>
              )}
              {task.is_approved && <p style={styles.statusApproved}>Status: Approved</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- 10. App.js ---
const App = () => {
  return (
    <Router>
      <div style={styles.appContainer}>
        <Navbar />
        <Routes>
          <Route path="/" element={<div style={styles.container}><h1>Welcome to the Reward Platform!</h1></div>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload/:taskId" element={<UploadScreenshot />} />
          <Route path="/admin/apps" element={<AdminApps />} />
          <Route path="/admin/tasks" element={<AdminTasks />} />
        </Routes>
      </div>
    </Router>
  );
};

// --- Basic Styles (for simplicity, inline or use App.css) ---
const styles = {
  appContainer: {
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginTop: '40px',
    width: '90%',
    maxWidth: '600px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '16px',
    width: 'calc(100% - 24px)',
  },
  button: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  smallButton: {
    padding: '8px 12px',
    borderRadius: '5px',
    border: '1px solid #007bff',
    backgroundColor: '#e9f5ff',
    color: '#007bff',
    fontSize: '14px',
    cursor: 'pointer',
    marginLeft: '10px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  logoutButton: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  errorMessage: {
    color: '#dc3545',
    marginTop: '10px',
    fontSize: '14px',
  },
  linkText: {
    marginTop: '15px',
    fontSize: '14px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
  navbar: {
    width: '100%',
    backgroundColor: '#343a40',
    padding: '15px 0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
  },
  navItem: {
    margin: '0 15px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '17px',
    padding: '8px 12px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  profileInfo: {
    textAlign: 'left',
    marginBottom: '20px',
    padding: '15px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
  },
  dropzone: {
    border: '2px dashed #007bff',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#e9f5ff',
    color: '#007bff',
    marginBottom: '20px',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  screenshot: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginTop: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    textAlign: 'left',
  },
  statusApproved: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  }
};

export default App;