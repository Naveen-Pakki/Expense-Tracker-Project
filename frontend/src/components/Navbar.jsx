import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';
import { Bell, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const userData = getCurrentUser();
    setUser(userData);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="navbar">
      <div>
        <h3>Welcome back, {user ? user.name : 'User'}!</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Track and optimize your daily expenditures
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={toggleTheme} title="Toggle light/dark theme">
          {theme === 'dark' ? (
            <Sun size={18} style={{ color: 'var(--warning)' }} />
          ) : (
            <Moon size={18} style={{ color: 'var(--primary)' }} />
          )}
        </button>

        <button className="btn btn-secondary" style={{ padding: '8px 12px' }}>
          <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>

        <div className="user-widget">
          <div className="user-avatar">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div style={{ textAlign: 'left' }} className="hide-mobile">
            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user ? user.name : 'Loading...'}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user ? user.email : ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
