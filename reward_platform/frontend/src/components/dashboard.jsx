import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

export default Dashboard;