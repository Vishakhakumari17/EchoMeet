import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isMeetingPage = location.pathname !== '/' && location.pathname !== '/home' && location.pathname !== '/history' && !isAuthPage;

  if (isAuthPage || isMeetingPage) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate('/')}>
        EchoMeet
      </div>
      
      <div className={styles.links}>
        <button className={styles.themeToggle} onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        {!token ? (
          <>
            <button className={styles.navBtn} onClick={() => navigate('/')}>Home</button>
            <button className={styles.navBtn} onClick={() => navigate('/login')}>Login</button>
            <button className={`${styles.navBtn} ${styles.primaryBtn}`} onClick={() => navigate('/register')}>Get Started</button>
          </>
        ) : (
          <>
            <button className={styles.navBtn} onClick={() => navigate('/home')}>Dashboard</button>
            <button className={styles.navBtn} onClick={() => navigate('/history')}>History</button>
            <button className={`${styles.navBtn} ${styles.dangerBtn}`} onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
