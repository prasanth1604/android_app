import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios'; 

const API_BASE_URL = 'http://localhost:8000/api'; 

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.headers.includeAuth !== false) { 
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }

    delete config.headers.includeAuth;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data);
    } else if (error.request) {
      return Promise.reject({ detail: 'No response from server. Network error or server is down.' });
    } else {
      return Promise.reject({ detail: error.message });
    }
  }
);



const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); 
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
      await axiosInstance.post(
        '/auth/signup/',
        {
          username,
          password,
          password_confirm: passwordConfirm, 
          first_name: firstName,
          last_name: lastName,
          email,
        },
        { headers: { includeAuth: false } }
      );
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
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


const Login = ({ setIsAuthenticated, setIsAdmin }) => { 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('/auth/login/', { username, password }, { headers: { includeAuth: false } });
      localStorage.setItem('token', response.data.token);
      

      const userProfile = await axiosInstance.get('/users/me/');
      const isAdminUser = userProfile.data.user.is_staff;
      localStorage.setItem('isAdmin', isAdminUser); 

      setIsAuthenticated(true); 
      setIsAdmin(isAdminUser); 
      console.log('Login successful. isAdminUser:', isAdminUser); 
      console.log('localStorage isAdmin:', localStorage.getItem('isAdmin')); 

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


const Navbar = ({ isAuthenticated, isAdmin, handleLogout }) => { 
  console.log('Navbar render. isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin); 
  return (
    <nav style={styles.navbar}>
      <ul style={styles.navList}>
        <li style={styles.navItem}><Link to="/" style={styles.navLink}>Home</Link></li>
        {!isAuthenticated ? ( 
          <>
            <li style={styles.navItem}><Link to="/login" style={styles.navLink}>Login</Link></li>
            <li style={styles.navItem}><Link to="/signup" style={styles.navLink}>Signup</Link></li>
          </>
        ) : (
          <>
            <li style={styles.navItem}><Link to="/dashboard" style={styles.navLink}>Dashboard</Link></li>
            <li style={styles.navItem}><Link to="/profile" style={styles.navLink}>Profile</Link></li>
            <li style={styles.navItem}><Link to="/admin/apps" style={styles.navLink}>Manage Apps (Only for Admin)</Link></li> 
            <li style={styles.navItem}><Link to="/admin/tasks" style={styles.navLink}>Review Tasks (Only for Admin)</Link></li> 
            <li style={styles.navItem}><button onClick={handleLogout} style={styles.logoutButton}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};


const Dashboard = () => {
  const [apps, setApps] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [error, setError] = useState('');

  
  const DEFAULT_APP_IMAGE = '/android-logo-0.png'; 

  useEffect(() => {
    const fetchData = async () => { 
      try {
        const [appsResponse, tasksResponse] = await Promise.all([
          axiosInstance.get('/apps/'),
          axiosInstance.get('/tasks/') 
        ]);
        setApps(appsResponse.data);
        setUserTasks(tasksResponse.data);
      } catch (err) {
        setError(err.detail || 'Failed to load data.');
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const handleStartTask = async (appId) => {
    setError('');
    try {
      const response = await axiosInstance.post('/tasks/create/', { app: appId });
      alert(`Task for App ID ${appId} created! Now upload screenshot.`);
      window.location.href = `/upload/${response.data.id}`; 
    } catch (err) {
      setError(err.detail || 'Failed to start task.');
      console.error('Error creating task:', err);
    }
  };

  const approvedAppIds = userTasks
    .filter(task => task.is_approved)
    .map(task => task.app.id); 
  const availableApps = apps.filter(app => !approvedAppIds.includes(app.id));


  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>
      {error && <p style={styles.errorMessage}>{error}</p>}
      
      <h3>Available Apps</h3>
      {availableApps.length === 0 ? (
        <p>No new apps available. You've completed all tasks or there are no apps to display.</p>
      ) : (
        <ul style={styles.list}>
          {availableApps.map(app => (
            <li key={app.id} style={styles.listItem}>
              <img src={DEFAULT_APP_IMAGE} alt={app.name} style={styles.appIcon} />
              <div style={styles.appInfo}>
                <p><strong>{app.name}</strong></p>
                <p>{app.points} Points</p>
              </div>
              <button onClick={() => handleStartTask(app.id)} style={styles.smallButton}>Download & Upload</button>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{marginTop: '40px'}}>My Downloaded Apps</h3>
      {userTasks.length === 0 ? (
        <p>You haven't downloaded any apps yet.</p>
      ) : (
        <ul style={styles.list}>
          {userTasks.map(task => (
            <li key={task.id} style={styles.listItem}>

              <img src={DEFAULT_APP_IMAGE} alt={task.app.name} style={styles.appIcon} />
              <div style={styles.appInfo}>
                <p><strong>App:</strong> {task.app.name}</p> 
                <p><strong>Status:</strong> {task.is_approved ? <span style={styles.statusApproved}>Approved</span> : <span style={styles.statusPending}>Pending Review</span>}</p>
              </div>
              {task.screenshot && <img src={task.screenshot} alt="Screenshot" style={styles.screenshotSmall} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


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
        <p><strong>Superuser Status:</strong> {profile.user.is_staff ? 'Yes' : 'No'}</p> {/* Changed */}
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
      // CHANGED: Use axiosInstance.put instead of axiosInstance.post for updates
      await axiosInstance.put(`/tasks/${taskId}/screenshots/`, formData);
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

  const DEFAULT_APP_IMAGE = '/android-logo-0.png'; 

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
      <h2>Manage Apps (Superuser)</h2> {/* Changed */}
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
              <img src={DEFAULT_APP_IMAGE} alt={app.name} style={styles.appIcon} />
              <strong>{app.name}</strong> - {app.points} Points
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
  const [showPendingOnly, setShowPendingOnly] = useState(false); // NEW: State for filtering

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

  // Filter tasks based on showPendingOnly state
  const filteredTasks = showPendingOnly ? tasks.filter(task => !task.is_approved) : tasks;

  return (
    <div style={styles.container}>
      <h2>Review Submitted Tasks (Superuser)</h2> {/* Changed */}
      {error && <p style={styles.errorMessage}>{error}</p>}

      <div style={styles.buttonGroup} className="task-filter-buttons"> {/* NEW: Filter buttons */}
        <button
          onClick={() => setShowPendingOnly(false)}
          style={{ ...styles.smallButton, ...(showPendingOnly ? {} : styles.activeFilterButton) }}
        >
          All Tasks
        </button>
        <button
          onClick={() => setShowPendingOnly(true)}
          style={{ ...styles.smallButton, ...(showPendingOnly ? styles.activeFilterButton : {}) }}
        >
          Pending Tasks
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <p>{showPendingOnly ? 'No pending tasks.' : 'No tasks submitted for review.'}</p>
      ) : (
        <ul style={styles.list}>
          {filteredTasks.map(task => (
            <li key={task.id} style={styles.listItem}>
              <p><strong>User:</strong> {task.user}</p>
              <p><strong>App:</strong> {task.app}</p>
              <div>
                {task.screenshot && (
                <img src={task.screenshot} alt="Screenshot" style={styles.screenshot} />
                )}
              </div>
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
  // State to manage authentication status globally
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  // Function to handle logout, passed to Navbar
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
    setIsAdmin(false);
    window.location.href = '/login'; // Redirect to login
  };

  // Effect to re-check auth status on mount (e.g., on page refresh)
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, []);


  return (
    <Router>
      <div style={styles.appContainer}>
        {/* Pass auth states and logout handler to Navbar */}
        <Navbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<div style={styles.container}><h1>Welcome to the Reward Platform!</h1></div>} />
          <Route path="/signup" element={<Signup />} />
          {/* Pass setIsAuthenticated and setIsAdmin to Login */}
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />} />
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
    backgroundColor: '#f0f2f5', 
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
    padding: '20px',
    boxSizing: 'border-box', 
  },
  container: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px', 
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)', 
    marginTop: '40px',
    marginBottom: '40px', 
    width: '100%',
    maxWidth: '650px', 
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px', /* More spacing */
    marginBottom: '25px',
    alignItems: 'center', /* Center form elements */
  },
  input: {
    padding: '14px', /* More padding */
    borderRadius: '8px',
    border: '1px solid #cdd4da', /* Slightly softer border */
    fontSize: '16px',
    width: 'calc(100% - 28px)', /* Adjust width for padding */
    maxWidth: '400px', /* Limit input width */
    boxSizing: 'border-box',
  },
  button: {
    padding: '14px 25px', /* More padding */
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '17px', /* Slightly larger font */
    fontWeight: '600', /* Bolder font */
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 8px rgba(0, 123, 255, 0.2)', /* Button shadow */
  },
  'button:hover': {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)', /* Lift effect */
    boxShadow: '0 6px 12px rgba(0, 123, 255, 0.3)',
  },
  smallButton: {
    padding: '10px 15px', /* More padding */
    borderRadius: '6px', /* Slightly more rounded */
    border: '1px solid #007bff',
    backgroundColor: '#e9f5ff',
    color: '#007bff',
    fontSize: '14px',
    cursor: 'pointer',
    marginLeft: '12px', /* More spacing */
    transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease',
  },
  'smallButton:hover': {
    backgroundColor: '#007bff',
    color: 'white',
    transform: 'translateY(-1px)',
  },
  logoutButton: {
    padding: '14px 25px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 8px rgba(220, 53, 69, 0.2)',
  },
  'logoutButton:hover': {
    backgroundColor: '#c82333',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(220, 53, 69, 0.3)',
  },
  errorMessage: {
    color: '#dc3545',
    marginTop: '15px',
    fontSize: '15px',
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: '20px',
    fontSize: '15px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '600',
  },
  navbar: {
    width: '100%',
    backgroundColor: '#212529', 
    padding: '18px 0', 
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
    position: 'sticky', 
    top: 0,
    zIndex: 1000, 
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    flexWrap: 'wrap',
  },
  navItem: {
    margin: '0 18px', 
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px', 
    padding: '10px 15px',
    borderRadius: '6px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  'navLink:hover': {
    backgroundColor: '#343a40',
    color: '#007bff',
  },
  profileInfo: {
    textAlign: 'left',
    marginBottom: '25px',
    padding: '20px',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    backgroundColor: '#f8f9fa',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  dropzone: {
    border: '2px dashed #007bff',
    borderRadius: '10px',
    padding: '50px', 
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f0f8ff', 
    color: '#007bff',
    marginBottom: '25px',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  'dropzone:hover': {
    backgroundColor: '#e0f0ff',
    borderColor: '#0056b3',
  },
  screenshot: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginTop: '15px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  screenshotSmall: { 
    maxWidth: '100px',
    height: 'auto',
    borderRadius: '5px',
    marginTop: '10px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
  },
  list: {
    listStyle: 'none',
    padding: '0',
    marginTop: '20px',
  },
  listItem: {
    backgroundColor: '#f8f9fa',
    padding: '18px',
    borderRadius: '10px',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)',
    textAlign: 'left',
  },
  statusApproved: {
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  statusPending: { 
    color: '#ffc107',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    width: '100%', 
    justifyContent: 'center', 
  },
  activeFilterButton: { 
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff',
  },
  appIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    objectFit: 'cover',
    marginRight: '15px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  appInfo: { 
    flexGrow: 1,
    textAlign: 'left',
  }
};

export default App;
