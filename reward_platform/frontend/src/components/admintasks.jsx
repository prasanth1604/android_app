import React, { useState, useEffect } from 'react';

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

export default AdminTasks;