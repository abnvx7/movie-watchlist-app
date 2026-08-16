import React, { useState } from 'react';
import { Clapperboard, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ onSwitchToRegister }) => {
  const { login, demoLogin, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setLocalError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setLocalError('');
    const result = await login(username, password);
    setIsSubmitting(false);

    if (!result.success) {
      setLocalError(result.error || 'Failed to login. Check your credentials.');
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setLocalError('');
    const result = await demoLogin();
    setIsSubmitting(false);
    if (!result.success) {
      setLocalError(result.error || 'Demo login failed.');
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon-wrap" style={{ margin: '0 auto', width: '48px', height: '48px' }}>
            <Clapperboard size={26} />
          </div>
          <h1>Welcome to CineTrack</h1>
          <p>Your ultimate personal Movie & TV Show Watchlist</p>
        </div>

        {displayError && (
          <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-control"
              placeholder="e.g. demo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
            id="login-submit-btn"
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="auth-divider">
          <span>Or Quick Start</span>
        </div>

        <div className="demo-login-box">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            id="demo-login-btn"
          >
            <Sparkles size={16} color="var(--accent-gold)" />
            <span>Instant Demo Account (1-Click)</span>
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Auto-seeds popular movies & shows for demo
          </span>
        </div>

        <div className="auth-footer">
          <span>Don't have an account? </span>
          <button
            type="button"
            className="btn-ghost"
            style={{ color: 'var(--accent-gold)', fontWeight: 600, padding: 0 }}
            onClick={onSwitchToRegister}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
