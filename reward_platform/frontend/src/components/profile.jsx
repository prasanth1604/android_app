import React, { useState, useEffect } from 'react';

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

export default Profile;