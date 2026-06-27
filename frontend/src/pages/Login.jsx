import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login, isAuthenticated } from '../services/authService';
import { Wallet, AlertCircle, Sun, Moon, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
    
    // Check if session expired redirect
    if (location.search.includes('expired=true')) {
      setError('Your session has expired. Please login again.');
    }
  }, [navigate, location]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-layout">
      {/* Floating Theme Toggle */}
      <button 
        type="button"
        className="btn btn-secondary" 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          padding: '10px 14px',
          borderRadius: '10px',
          cursor: 'pointer',
          zIndex: 100
        }} 
        onClick={toggleTheme}
        title="Toggle light/dark theme"
      >
        {theme === 'dark' ? (
          <Sun size={18} style={{ color: 'var(--warning)' }} />
        ) : (
          <Moon size={18} style={{ color: 'var(--primary)' }} />
        )}
      </button>

      {/* Left Column: SaaS Value Proposition */}
      <div className="auth-promo-side">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.15)', width: '48px', height: '48px' }}>
            <Wallet size={26} style={{ color: 'var(--primary)' }} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em' }}>ExpenseTracker</span>
        </div>

        <div style={{ marginTop: '60px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.2', marginBottom: '16px' }}>
            Wealth Tracking,<br />
            <span style={{ background: 'linear-gradient(90deg, var(--primary), var(--success))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Refined & Smart.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '440px' }}>
            A modular corporate financial tool to monitor category budgets, analyze visual aggregates, and secure your transaction files.
          </p>
        </div>

        {/* Feature Checklists */}
        <div className="auth-features-list">
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '2px' }}>Smart Budget Safeguards</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Get warned prior to registering over budget limits.</p>
            </div>
          </div>

          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '2px' }}>Fintech Grade Document Export</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Download audit-ready PDF tables and raw CSV sheets in Indian Rupees.</p>
            </div>
          </div>

          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '2px' }}>Dual-Theme Mesh Engine</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Experience seamless, high-performance styling transformations.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Glassmorphic Auth Form */}
      <div className="auth-form-side">
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.12)', width: '48px', height: '48px', marginBottom: '16px' }}>
              <Wallet size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.02em', textAlign: 'center' }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
              Sign in to manage your expenses & budgets.
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: 'var(--danger)',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: '600' }}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
