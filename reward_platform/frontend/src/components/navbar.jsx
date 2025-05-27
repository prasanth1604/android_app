import React from 'react';
import { Link } from 'react-router-dom';

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

export default Navbar;