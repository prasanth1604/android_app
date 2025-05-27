import React, { useState, useEffect } from 'react';

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

export default AdminApps;