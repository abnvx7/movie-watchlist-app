import React, { useState } from 'react';
import { Clapperboard, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const result = await register(username, email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to create account.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon-wrap" style={{ margin: '0 auto', width: '48px', height: '48px' }}>
            <Clapperboard size={26} />
          </div>
          <h1>Create CineTrack Account</h1>
          <p>Start tracking and rating your favorite media today</p>
        </div>

        {error && (
          <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-username">Username *</label>
            <input
              id="reg-username"
              type="text"
              className="form-control"
              placeholder="e.g. movie_buff_99"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email (Optional)</label>
            <input
              id="reg-email"
              type="email"
              className="form-control"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password *</label>
            <input
              id="reg-password"
              type="password"
              className="form-control"
              placeholder="Minimum 4 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password *</label>
            <input
              id="reg-confirm"
              type="password"
              className="form-control"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
            id="register-submit-btn"
          >
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <button
            type="button"
            className="btn-ghost"
            style={{ color: 'var(--accent-gold)', fontWeight: 600, padding: 0 }}
            onClick={onSwitchToLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
